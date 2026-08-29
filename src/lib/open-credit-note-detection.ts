import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Echte Erkennungslogik fuer die "Offene Gutschriften"-Fund-Kategorie
// (MVP-Roadmap Phase 1.1, siehe [[effivo_mvp_roadmap]]) - zweite der vier
// Fund-Kategorien, die echt statt Referenz-Demowert ist (nach
// duplicate-payment-detection.ts).
//
// Erkennungsregel: eine importierte FINANCE-Zeile ist eine "offene
// Gutschrift", wenn ihre Belegart als Gutschrift gemappt wurde
// (documentType = "CREDIT_NOTE", siehe import-fields.ts/
// CanonicalDocumentType) UND ihr Zahlungsstatus "OPEN" ist. Der gemeinsame
// Status-Wortschatz (PAID/OPEN/PARTIALLY_PAID/OVERDUE/CANCELED) gilt fuer
// Rechnungen UND Gutschriften gleichermassen - bei einer Gutschrift bedeutet
// "OPEN" hier "noch nicht mit einer Rechnung verrechnet/ausgeglichen", nicht
// "unbezahlt" (das waere fachlich falsch fuer ein Dokument, das der Firma
// selbst Geld einbringt statt kostet).
//
// Anders als bei Doppelzahlungen gibt es hier kein Gruppierungs-/Vergleichs-
// kriterium - jede offene Gutschrift ist unabhaengig fuer sich ein eigener
// Fall (kein "Duplikat"-Konzept).
//
// Companies ohne gemapptes "Belegart"-Feld (die grosse Mehrheit zu Beginn,
// da dieses Feld neu ist) haben schlicht documentType=null bei jeder Zeile -
// detectOpenCreditNotes liefert dann ehrlich 0 Faelle, kein falscher Treffer.
export type OpenCreditNoteCase = {
  who: string;
  what: string;
  amount: Prisma.Decimal;
};

export type OpenCreditNoteResult = {
  totalAmount: Prisma.Decimal;
  caseCount: number;
  topCases: OpenCreditNoteCase[];
};

export async function detectOpenCreditNotes(companyId: string): Promise<OpenCreditNoteResult> {
  const rows = await prisma.dataImportRecord.findMany({
    where: {
      companyId,
      documentType: "CREDIT_NOTE",
      status: "OPEN",
      dataImport: { category: "FINANCE", status: "PROCESSED" },
    },
    select: {
      referenceNumber: true,
      name: true,
      organization: true,
      grossAmount: true,
      amount: true,
    },
  });

  const cases: OpenCreditNoteCase[] = [];
  let totalAmount = new Prisma.Decimal(0);

  for (const row of rows) {
    const amount = row.grossAmount ?? row.amount;
    if (!amount || amount.isZero()) continue;
    const absAmount = amount.abs();
    totalAmount = totalAmount.plus(absAmount);
    cases.push({
      who: row.name?.trim() || row.organization?.trim() || "Unbekannt",
      what: row.referenceNumber?.trim() || "Gutschrift ohne Referenz",
      amount: absAmount,
    });
  }

  cases.sort((a, b) => b.amount.comparedTo(a.amount));

  return {
    totalAmount,
    caseCount: cases.length,
    topCases: cases.slice(0, 3),
  };
}
