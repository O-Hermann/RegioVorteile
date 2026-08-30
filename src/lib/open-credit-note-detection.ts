import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { looksLikeCreditNoteReference } from "@/lib/import-fields";

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
// MVP-Roadmap Phase 3.2 (siehe [[effivo_mvp_roadmap]]): Companies OHNE
// gemapptes "Belegart"-Feld (documentType=null bei jeder Zeile) sind NICHT
// mehr automatisch 0 Faelle - eine Zeile OHNE documentType gilt ebenfalls
// als offene Gutschrift, wenn eine der beiden beweisbaren Fallback-Regeln
// zutrifft (siehe isFallbackCreditNote() unten):
// 1. Die Referenznummer traegt einen gebraeuchlichen Gutschrift-Praefix
//    ("G-"/"GS-"/"GUT-"/"CN-", siehe looksLikeCreditNoteReference() in
//    import-fields.ts) - das staerkere, fuer sich allein ausreichende Signal.
// 2. Der Betrag ist negativ UND der Zahlungsstatus ist "OPEN" - bewusst NUR
//    in Kombination (nicht der negative Betrag allein, der z.B. auch eine
//    Stornierung/Korrektur bedeuten koennte), da ein negativer, noch
//    offener Posten ohne erkennbaren anderen Grund ein plausibles,
//    beweisbares Indiz fuer eine Gutschrift ist.
// Zeilen mit explizit gemapptem documentType="CREDIT_NOTE" nutzen weiterhin
// ausschliesslich die urspruengliche, praezise Regel (status="OPEN") - die
// Fallback-Heuristik greift NUR dort, wo keine Belegart-Zuordnung
// existiert, und uebersteuert diese nie.
// "key" ist die stabile Identitaet dieses Falls fuer case-sync.ts (Phase 2) -
// bevorzugt die (getrimmte, kleingeschriebene) Referenznummer, damit ein
// erneuter Import derselben Datei (der neue DataImportRecord-Ids erzeugt)
// nicht versehentlich einen zweiten Case fuer dieselbe reale Gutschrift
// anlegt und deren Bearbeitungsstand zuruecksetzt. Nur wenn keine
// Referenznummer vorhanden ist, faellt die Funktion auf die Zeilen-Id
// zurueck (dann kann Stabilitaet ueber Re-Importe hinweg nicht garantiert
// werden - das ist ein bekannter, akzeptierter Rand fall).
export type OpenCreditNoteCase = {
  key: string;
  who: string;
  what: string;
  amount: Prisma.Decimal;
};

export type OpenCreditNoteResult = {
  totalAmount: Prisma.Decimal;
  caseCount: number;
  topCases: OpenCreditNoteCase[];
  allCases: OpenCreditNoteCase[];
};

// Siehe ausfuehrliche Begruendung im Kommentar oberhalb von
// detectOpenCreditNotes(). Nur fuer Zeilen ohne gemapptes documentType
// aufgerufen - eine Zeile mit documentType="CREDIT_NOTE" braucht diese
// Heuristik nicht, sie ist bereits eindeutig.
function isFallbackCreditNote(row: { referenceNumber: string | null; status: string | null; amount: Prisma.Decimal | null }): boolean {
  const ref = row.referenceNumber?.trim();
  if (ref && looksLikeCreditNoteReference(ref)) return true;
  return row.status === "OPEN" && !!row.amount && row.amount.isNegative();
}

export async function detectOpenCreditNotes(companyId: string): Promise<OpenCreditNoteResult> {
  const rows = await prisma.dataImportRecord.findMany({
    where: {
      companyId,
      dataImport: { category: "FINANCE", status: "PROCESSED" },
      OR: [
        { documentType: "CREDIT_NOTE", status: "OPEN" },
        { documentType: null },
      ],
    },
    select: {
      id: true,
      referenceNumber: true,
      name: true,
      organization: true,
      grossAmount: true,
      amount: true,
      documentType: true,
      status: true,
    },
  });

  const cases: OpenCreditNoteCase[] = [];
  let totalAmount = new Prisma.Decimal(0);

  for (const row of rows) {
    if (row.documentType === null && !isFallbackCreditNote({ referenceNumber: row.referenceNumber, status: row.status, amount: row.grossAmount ?? row.amount })) {
      continue;
    }
    const amount = row.grossAmount ?? row.amount;
    if (!amount || amount.isZero()) continue;
    const absAmount = amount.abs();
    totalAmount = totalAmount.plus(absAmount);
    const ref = row.referenceNumber?.trim();
    cases.push({
      key: ref ? ref.toLowerCase() : row.id,
      who: row.name?.trim() || row.organization?.trim() || "Unbekannt",
      what: ref || "Gutschrift ohne Referenz",
      amount: absAmount,
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
