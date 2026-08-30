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
// "key" ist die stabile Identitaet dieses Falls fuer case-sync.ts (Phase 2) -
// siehe Kommentar in open-credit-note-detection.ts zur selben Konvention
// (bevorzugt Referenznummer, sonst Zeilen-Id als Rueckfall).
export type OverpaymentCase = {
  key: string;
  who: string;
  what: string;
  amount: Prisma.Decimal;
  // MVP-Roadmap Phase 5 (siehe [[effivo_mvp_roadmap]]) - fuer die
  // Case-Detail-Ansicht.
  sourceRecordIds: string[];
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
  allCases: OverpaymentCase[];
};

export async function detectPossibleOverpayments(companyId: string): Promise<OverpaymentResult> {
  const rows = await prisma.dataImportRecord.findMany({
    where: {
      companyId,
      paidAmount: { not: null },
      // Bugfix Phase 3.1 (siehe [[effivo_mvp_roadmap]] und derselbe Kommentar
      // in discount-detection.ts): "documentType: { not: 'CREDIT_NOTE' }"
      // schliesst in diesem Prisma-7/Driver-Adapter-Setup faelschlich auch
      // NULL-Zeilen aus - jede Zeile ohne gemappte Belegart-Spalte waere NIE
      // fuer die Ueberzahlungs-Erkennung beruecksichtigt worden. Explizites
      // OR schliesst NULL korrekt mit ein.
      OR: [{ documentType: null }, { documentType: { not: "CREDIT_NOTE" } }],
      dataImport: { category: "FINANCE", status: "PROCESSED" },
    },
    select: {
      id: true,
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
    const ref = row.referenceNumber?.trim();
    cases.push({
      key: ref ? ref.toLowerCase() : row.id,
      who: row.name?.trim() || row.organization?.trim() || "Unbekannt",
      what: `gezahlt ${formatEuroAmount(paidAmount)} € statt ${formatEuroAmount(invoiceAmount)} €`,
      amount: excess,
      sourceRecordIds: [row.id],
    });
  }

  cases.sort((a, b) => b.amount.comparedTo(a.amount));

  return {
    totalAmount,
    caseCount: cases.length,
    topCases: cases.slice(0, 3),
    allCases: cases,
  };
}
