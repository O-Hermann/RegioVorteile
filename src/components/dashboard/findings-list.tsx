import { CopyIcon, FileTextIcon, PercentIcon, ScaleIcon } from "@/components/icons";
import { DASH_ACCENT_HEX, type DashAccent, dashFontDisplayClass, dashTextTitle, dashTextBody, dashTextSectionHeading, dashTextSecondarySm } from "@/components/dashboard/dash-ui";
import type { DuplicatePaymentResult } from "@/lib/duplicate-payment-detection";
import type { OpenCreditNoteResult } from "@/lib/open-credit-note-detection";
import type { OverpaymentResult } from "@/lib/overpayment-detection";
import type { MissedDiscountResult } from "@/lib/discount-detection";

// Kernstueck des MVP-Fokus (siehe Nutzer-Vorgabe: "wo Doppelzahlungen
// gefallen sind, wo kein Skonto beruecksichtigt wurde, wo offene
// Gutschriften sind" - Umsatz/Kosten-Uebersicht kommt bewusst erst spaeter).
// Fortschritt siehe [[effivo_mvp_roadmap]] (Phase 1 - abgeschlossen
// 2026-08-29).
//
// Stand 2026-08-29: alle vier Fund-Kategorien sind ECHT - buildFindings()
// berechnet sie aus tatsaechlich importierten DataImportRecord-Zeilen
// (siehe duplicate-payment-detection.ts / open-credit-note-detection.ts /
// overpayment-detection.ts / discount-detection.ts). Companies ohne die
// dafuer noetigen gemappten Felder bekommen pro Kategorie ehrlich 0 Faelle
// statt eines geratenen/falschen Treffers - siehe die jeweilige Detection-
// Datei fuer die genaue Regel.
export type FindingCase = { who: string; what: string; amount: number };

export type FindingCategory = {
  key: string;
  name: string;
  desc: string;
  amount: number;
  count: number;
  accent: DashAccent;
  icon: (props: { className?: string }) => React.ReactElement;
  cases: FindingCase[];
};

// Baut die vollstaendige Liste aus den vier echten Erkennungen. Betraege
// dort sind Prisma.Decimal - .toNumber() ist hier unbedenklich
// (Anzeigewerte, keine Rechengrundlage mehr). Reihenfolge (duplicate,
// discount, credit, overpayment) entspricht der urspruenglichen
// Kartenreihenfolge aus dem Mockup, nicht der Reihenfolge, in der die
// Kategorien "echt" wurden.
export function buildFindings(
  duplicatePayments: DuplicatePaymentResult,
  openCreditNotes: OpenCreditNoteResult,
  overpayments: OverpaymentResult,
  missedDiscounts: MissedDiscountResult,
): FindingCategory[] {
  const duplicateFinding: FindingCategory = {
    key: "duplicate",
    name: "Doppelzahlungen",
    desc: "Rechnungen, die versehentlich doppelt oder mehrfach beglichen wurden.",
    amount: duplicatePayments.totalAmount.toNumber(),
    count: duplicatePayments.caseCount,
    accent: "red",
    icon: CopyIcon,
    cases: duplicatePayments.topCases.map((c) => ({ who: c.who, what: c.what, amount: c.amount.toNumber() })),
  };
  const discountFinding: FindingCategory = {
    key: "discount",
    name: "Skonto nicht genutzt",
    desc: "Frühzahler-Rabatte, die durch verspätete Zahlung verpasst wurden.",
    amount: missedDiscounts.totalAmount.toNumber(),
    count: missedDiscounts.caseCount,
    accent: "orange",
    icon: PercentIcon,
    cases: missedDiscounts.topCases.map((c) => ({ who: c.who, what: c.what, amount: c.amount.toNumber() })),
  };
  const creditFinding: FindingCategory = {
    key: "credit",
    name: "Offene Gutschriften",
    desc: "Erhaltene Gutschriften, die noch nicht mit Rechnungen verrechnet wurden.",
    amount: openCreditNotes.totalAmount.toNumber(),
    count: openCreditNotes.caseCount,
    accent: "blue",
    icon: FileTextIcon,
    cases: openCreditNotes.topCases.map((c) => ({ who: c.who, what: c.what, amount: c.amount.toNumber() })),
  };
  const overpaymentFinding: FindingCategory = {
    key: "overpayment",
    name: "Mögliche Überzahlung",
    desc: "Gezahlter Betrag weicht vom Rechnungsbetrag ab, z. B. durch Tipp- oder Rundungsfehler.",
    amount: overpayments.totalAmount.toNumber(),
    count: overpayments.caseCount,
    accent: "teal",
    icon: ScaleIcon,
    cases: overpayments.topCases.map((c) => ({ who: c.who, what: c.what, amount: c.amount.toNumber() })),
  };
  return [duplicateFinding, discountFinding, creditFinding, overpaymentFinding];
}

export function getFindingsSummary(findings: FindingCategory[]) {
  return {
    totalAmount: findings.reduce((sum, f) => sum + f.amount, 0),
    totalCount: findings.reduce((sum, f) => sum + f.count, 0),
    topCategory: [...findings].sort((a, b) => b.amount - a.amount)[0],
  };
}

const ACCENT_CLASS: Record<DashAccent, string> = {
  red: "text-rose-600 border-rose-400/50 bg-rose-500/10 dark:text-dash-red dark:border-dash-red/50 dark:bg-[rgba(255,117,109,0.1)]",
  orange: "text-amber-600 border-amber-400/50 bg-amber-500/10 dark:text-dash-orange dark:border-dash-orange/50 dark:bg-[rgba(226,171,72,0.1)]",
  blue: "text-sky-600 border-sky-400/50 bg-sky-500/10 dark:text-dash-blue dark:border-dash-blue/50 dark:bg-[rgba(99,170,255,0.1)]",
  purple: "text-violet-600 border-violet-400/50 bg-violet-500/10 dark:text-dash-purple dark:border-dash-purple/50 dark:bg-[rgba(170,118,255,0.1)]",
  green: "text-emerald-600 border-emerald-400/50 bg-emerald-500/10 dark:text-dash-green dark:border-dash-green/50 dark:bg-[rgba(71,215,149,0.1)]",
  teal: "text-ink-700 border-ink-400/50 bg-ink-500/10 dark:text-dash-teal dark:border-dash-teal/50 dark:bg-[rgba(45,214,197,0.1)]",
};

export function FindingsList({ findings }: { findings: FindingCategory[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {findings.map((f) => (
        <div
          key={f.key}
          style={{ "--case-accent": DASH_ACCENT_HEX[f.accent] } as React.CSSProperties}
          className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-4 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.032),0_16px_36px_rgba(0,0,0,0.19)] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[var(--case-accent)]"
        >
          <div className="flex items-start gap-2.5">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border ${ACCENT_CLASS[f.accent]}`}>
              <f.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className={`${dashFontDisplayClass} ${dashTextTitle} font-bold text-sand-900 dark:text-dash-text`}>{f.name}</h3>
              <p className={`mt-0.5 ${dashTextSecondarySm} leading-snug text-sand-500 dark:text-dash-text-secondary`}>{f.desc}</p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`${dashFontDisplayClass} ${dashTextSectionHeading} font-extrabold tabular-nums text-sand-900 dark:text-dash-text`}>
              {f.amount.toLocaleString("de-DE")}&nbsp;€
            </span>
            <span className={`rounded-full border border-card-border/60 bg-sand-50 px-2 py-0.5 ${dashTextSecondarySm} font-semibold text-sand-500 dark:border-[rgba(83,121,151,0.24)] dark:bg-[rgba(5,23,41,0.55)] dark:text-[#c9dde9]`}>
              {f.count} {f.count === 1 ? "Fall" : "Fälle"}
            </span>
          </div>

          {f.count === 0 ? (
            <p className={`mt-auto ${dashTextSecondarySm} text-sand-400 dark:text-dash-text-muted`}>Aktuell keine Fälle in dieser Kategorie gefunden.</p>
          ) : (
            <>
              <div className="flex flex-col border-t border-card-border dark:border-dash-line">
                {f.cases.map((c) => (
                  <div
                    key={`${c.who}-${c.what}`}
                    className={`grid grid-cols-[1fr_auto_auto] items-baseline gap-2 border-b border-card-border/70 py-2 ${dashTextSecondarySm} dark:border-dash-line/70 last:border-b-0`}
                  >
                    <span className="truncate font-semibold text-sand-800 dark:text-dash-text">{c.who}</span>
                    <span className="whitespace-nowrap text-sand-400 dark:text-dash-text-muted">{c.what}</span>
                    <span className="whitespace-nowrap text-right font-bold tabular-nums text-sand-900 dark:text-dash-text">{c.amount.toLocaleString("de-DE")}&nbsp;€</span>
                  </div>
                ))}
              </div>

              <span
                aria-disabled
                title="Noch nicht verfügbar"
                className={`mt-auto flex cursor-default items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 ${dashTextBody} font-bold ${ACCENT_CLASS[f.accent]}`}
              >
                {f.count} {f.count === 1 ? "Fall" : "Fälle"} ansehen →
              </span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
