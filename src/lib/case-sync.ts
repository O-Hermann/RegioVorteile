import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma, type CaseCategory } from "@/generated/prisma/client";
import { detectDuplicatePayments, type DuplicatePaymentResult } from "@/lib/duplicate-payment-detection";
import { detectOpenCreditNotes, type OpenCreditNoteResult } from "@/lib/open-credit-note-detection";
import { detectPossibleOverpayments, type OverpaymentResult } from "@/lib/overpayment-detection";
import { detectMissedDiscounts, type MissedDiscountResult } from "@/lib/discount-detection";

export type SyncedFindings = {
  duplicatePayments: DuplicatePaymentResult;
  openCreditNotes: OpenCreditNoteResult;
  overpayments: OverpaymentResult;
  missedDiscounts: MissedDiscountResult;
};

// MVP-Roadmap Phase 2 (siehe [[effivo_mvp_roadmap]]): fuehrt alle vier
// Erkennungen aus UND gleicht das Ergebnis mit der Case-Tabelle ab (Upsert
// je Fund-Instanz, identifiziert ueber ihren stabilen "key" - siehe
// Kommentare in den jeweiligen detect*()-Dateien). who/what/amount werden
// bei jedem Sync aktualisiert, der Status ausdruecklich NICHT - ein bereits
// "Geprueft"-markierter Fall bleibt geprueft, auch wenn sich der gemeldete
// Betrag durch neue Importe leicht verschiebt.
//
// Bewusst KEIN automatisches Schliessen "verschwundener" Faelle (ein Fall,
// der beim letzten Sync noch erkannt wurde, jetzt aber nicht mehr in
// allCases auftaucht, bleibt im aktuellen Status unveraendert stehen) - ein
// automatisches Wegraeumen koennte einen echten Fall unbemerkt aus der
// Arbeitsliste verschwinden lassen, nur weil z.B. ein Import geloescht oder
// eine Mapping-Spalte veraendert wurde. Das manuelle Schliessen bleibt
// bewusst Sache der Fallpruefung (Phase 2, Arbeitsliste-Seite).
//
// Aufgerufen bei jedem Dashboard-Aufruf (page.tsx) - es gibt in diesem
// Projekt keine Hintergrundjobs/Warteschlangen, daher derselbe "frisch bei
// jedem Aufruf berechnen"-Ansatz wie bei allen anderen Dashboard-Werten
// (z.B. getCompanyMetrics). Bei den ueberschaubaren Datenmengen einer
// KMU-Monatsimport-Groessenordnung ist das performant genug.
export async function syncCases(companyId: string): Promise<SyncedFindings> {
  const [duplicatePayments, openCreditNotes, overpayments, missedDiscounts] = await Promise.all([
    detectDuplicatePayments(companyId),
    detectOpenCreditNotes(companyId),
    detectPossibleOverpayments(companyId),
    detectMissedDiscounts(companyId),
  ]);

  const upserts: { category: CaseCategory; key: string; who: string; what: string; amount: Prisma.Decimal }[] = [
    ...duplicatePayments.allCases.map((c) => ({ category: "DUPLICATE_PAYMENT" as const, key: c.key, who: c.who, what: c.what, amount: c.amount })),
    ...openCreditNotes.allCases.map((c) => ({ category: "OPEN_CREDIT_NOTE" as const, key: c.key, who: c.who, what: c.what, amount: c.amount })),
    ...overpayments.allCases.map((c) => ({ category: "OVERPAYMENT" as const, key: c.key, who: c.who, what: c.what, amount: c.amount })),
    ...missedDiscounts.allCases.map((c) => ({ category: "MISSED_DISCOUNT" as const, key: c.key, who: c.who, what: c.what, amount: c.amount })),
  ];

  await Promise.all(
    upserts.map((u) =>
      prisma.case.upsert({
        where: { companyId_category_dedupeKey: { companyId, category: u.category, dedupeKey: u.key } },
        create: { companyId, category: u.category, dedupeKey: u.key, who: u.who, what: u.what, amount: u.amount },
        update: { who: u.who, what: u.what, amount: u.amount },
      }),
    ),
  );

  return { duplicatePayments, openCreditNotes, overpayments, missedDiscounts };
}
