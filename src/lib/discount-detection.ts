import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Echte Erkennungslogik fuer die "Skonto nicht genutzt"-Fund-Kategorie
// (MVP-Roadmap Phase 1.3, siehe [[effivo_mvp_roadmap]]) - letzte der vier
// Fund-Kategorien, die echt statt Referenz-Demowert ist. Komplexeste der
// vier: braucht drei neue Felder statt einem/keinem.
//
// Erkennungsregel: eine importierte FINANCE-Zeile hat einen verpassten
// Skonto-Rabatt, wenn ALLE gelten:
// - discountPercent > 0 (ein Skonto-Rabatt war ueberhaupt vereinbart)
// - discountDeadline gesetzt (letzter Tag, an dem der Rabatt noch galt)
// - completionDate gesetzt (Zahlungsdatum - fuer FINANCE-Importe
//   zweckentfremdet, siehe Kommentar in schema.prisma) UND liegt NACH
//   discountDeadline (tatsaechlich zu spaet bezahlt, nicht nur "koennte
//   noch zu spaet werden")
//
// Bewusst NUR tatsaechlich zu spaet bezahlte Zeilen (nicht z.B. noch offene
// Zeilen mit bereits abgelaufener Frist) - das ist die einzige Variante, die
// sich ohne Annahme ueber "heute" beweisen laesst, analog zur "few but
// reliable hits"-Philosophie der anderen drei Detektoren.
//
// Verpasster Betrag = Rechnungsbetrag (grossAmount ?? amount, gleiche
// Praeferenz wie in den anderen drei Detektoren) × discountPercent / 100.
// Gutschriften werden ausgeschlossen (ein Skonto-Rabatt bezieht sich auf
// eine Rechnung, nicht auf eine Gutschrift).
//
// Companies ohne alle drei gemappten Felder (die grosse Mehrheit zu Beginn,
// da diese Felder neu sind) haben schlicht null bei mindestens einem Feld -
// detectMissedDiscounts liefert dann ehrlich 0 Faelle, kein falscher Treffer.
//
// MVP-Roadmap Phase 3.1: discountPercent/discountDeadline muessen nicht
// zwingend aus eigenen Spalten stammen - sie koennen auch aus einer
// "Zahlungsbedingungen"-Freitext-Spalte (z.B. "2% 10 Tage, netto 30")
// hergeleitet worden sein, siehe parsePaymentTermsText() in import-fields.ts
// und applyPaymentTermsFallback() in import-process.ts. Diese Funktion hier
// bleibt davon unberuehrt - sie liest ausschliesslich die beiden bereits
// befuellten Spalten, unabhaengig von ihrer Herkunft.
// "key" ist die stabile Identitaet dieses Falls fuer case-sync.ts (Phase 2) -
// siehe Kommentar in open-credit-note-detection.ts zur selben Konvention
// (bevorzugt Referenznummer, sonst Zeilen-Id als Rueckfall).
export type MissedDiscountCase = {
  key: string;
  who: string;
  what: string;
  amount: Prisma.Decimal;
};

export type MissedDiscountResult = {
  totalAmount: Prisma.Decimal;
  caseCount: number;
  topCases: MissedDiscountCase[];
  allCases: MissedDiscountCase[];
};

export async function detectMissedDiscounts(companyId: string): Promise<MissedDiscountResult> {
  const rows = await prisma.dataImportRecord.findMany({
    where: {
      companyId,
      discountPercent: { gt: 0 },
      discountDeadline: { not: null },
      completionDate: { not: null },
      // Bugfix Phase 3.1 (siehe [[effivo_mvp_roadmap]]): "documentType: { not:
      // 'CREDIT_NOTE' }" schliesst in diesem Prisma-7/Driver-Adapter-Setup
      // faelschlich auch NULL-Zeilen aus (SQL-Dreiwertlogik statt des
      // dokumentierten Prisma-Verhaltens) - jede Zeile ohne gemappte
      // Belegart-Spalte (die grosse Mehrheit, da dieses Feld optional ist)
      // waere NIE fuer die Skonto-Erkennung beruecksichtigt worden, unabhaengig
      // davon, ob discountPercent/discountDeadline/completionDate gesetzt
      // waren. Per E2E-Test entdeckt und bestaetigt. Explizites OR schliesst
      // NULL korrekt mit ein.
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
      discountPercent: true,
      discountDeadline: true,
      completionDate: true,
    },
  });

  const cases: MissedDiscountCase[] = [];
  let totalAmount = new Prisma.Decimal(0);

  for (const row of rows) {
    const invoiceAmount = row.grossAmount ?? row.amount;
    if (!invoiceAmount || !row.discountPercent || !row.discountDeadline || !row.completionDate) continue;
    if (row.completionDate.getTime() <= row.discountDeadline.getTime()) continue; // rechtzeitig bezahlt

    const missed = invoiceAmount.times(row.discountPercent).dividedBy(100);
    if (missed.isZero()) continue;
    totalAmount = totalAmount.plus(missed);
    const ref = row.referenceNumber?.trim();
    cases.push({
      key: ref ? ref.toLowerCase() : row.id,
      who: row.name?.trim() || row.organization?.trim() || "Unbekannt",
      what: `${row.discountPercent.toNumber().toLocaleString("de-DE")} % Skonto verpasst`,
      amount: missed,
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
