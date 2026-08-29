import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Echte Erkennungslogik fuer die "Moegliche Ueberzahlung"-Fund-Kategorie
// (MVP-Roadmap Phase 1.2, siehe [[effivo_mvp_roadmap]]) - dritte der vier
// Fund-Kategorien, die echt statt Referenz-Demowert ist.
//
// Erkennungsregel: eine importierte FINANCE-Zeile ist eine "moegliche
// Ueberzahlung", wenn der tatsaechlich gezahlte Betrag (paidAmount, neues
// Feld - siehe import-fields.ts) den Rechnungsbetrag (grossAmount ?? amount,
// gleiche Praeferenz wie in company-metrics.ts/duplicate-payment-detection)
// UEBERSTEIGT. Kein Toleranzabzug fuer kleine Differenzen - die Kategorie
// deckt laut Produktbeschreibung explizit auch Rundungsfehler ab (siehe
// Beschreibungstext in findings-list.tsx), ein einzelner zu viel gezahlter
// Cent ist bereits ein valider, wenn auch kleiner, Fund.
//
// Gutschriften (documentType = "CREDIT_NOTE") werden ausgeschlossen: ein
// Vergleich "gezahlt vs. Rechnungsbetrag" ergibt fuer eine Gutschrift keinen
// Sinn (dort fliesst Geld in die andere Richtung).
//
// Companies ohne gemapptes "Gezahlter Betrag"-Feld (die grosse Mehrheit zu
// Beginn, da dieses Feld neu ist) haben schlicht paidAmount=null bei jeder
// Zeile - detectPossibleOverpayments liefert dann ehrlich 0 Faelle, kein
// falscher Treffer.
export type OverpaymentCase = {
  who: string;
  what: string;
  amount: Prisma.Decimal;
};

// toLocaleString allein liesse Nachkommastellen bei "runden" Betraegen weg
// (4150.5 -> "4.150,5" statt "4.150,50") - minimumFractionDigits erzwingt
// immer zwei Nachkommastellen, maximumFractionDigits verhindert mehr als
// zwei bei krummen Decimal-Werten.
function formatEuroAmount(value: Prisma.Decimal): string {
  return value.toNumber().toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export type OverpaymentResult = {
  totalAmount: Prisma.Decimal;
  caseCount: number;
  topCases: OverpaymentCase[];
};

export async function detectPossibleOverpayments(companyId: string): Promise<OverpaymentResult> {
  const rows = await prisma.dataImportRecord.findMany({
    where: {
      companyId,
      paidAmount: { not: null },
      documentType: { not: "CREDIT_NOTE" },
      dataImport: { category: "FINANCE", status: "PROCESSED" },
    },
    select: {
      referenceNumber: true,
      name: true,
      organization: true,
      grossAmount: true,
      amount: true,
      paidAmount: true,
    },
  });

  const cases: OverpaymentCase[] = [];
  let totalAmount = new Prisma.Decimal(0);

  for (const row of rows) {
    const invoiceAmount = row.grossAmount ?? row.amount;
    const paidAmount = row.paidAmount;
    if (!invoiceAmount || !paidAmount) continue;
    if (!paidAmount.greaterThan(invoiceAmount)) continue;

    const excess = paidAmount.minus(invoiceAmount);
    totalAmount = totalAmount.plus(excess);
    cases.push({
      who: row.name?.trim() || row.organization?.trim() || "Unbekannt",
      what: `gezahlt ${formatEuroAmount(paidAmount)} € statt ${formatEuroAmount(invoiceAmount)} €`,
      amount: excess,
    });
  }

  cases.sort((a, b) => b.amount.comparedTo(a.amount));

  return {
    totalAmount,
    caseCount: cases.length,
    topCases: cases.slice(0, 3),
  };
}
