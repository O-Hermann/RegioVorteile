import Link from "next/link";
import { CopyIcon, FileTextIcon, PercentIcon, ScaleIcon } from "@/components/icons";
import { dashCardClass } from "@/components/dashboard/dash-ui";
import type { DuplicatePaymentResult } from "@/lib/duplicate-payment-detection";
import type { OpenCreditNoteResult } from "@/lib/open-credit-note-detection";
import type { OverpaymentResult } from "@/lib/overpayment-detection";
import type { MissedDiscountResult } from "@/lib/discount-detection";
import type { CaseCategory } from "@/generated/prisma/client";

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

// "accentClass" traegt die vier fest zugeordneten Kategorie-Akzentfarben aus
// dem "Goldstandard"-Design (siehe [[effivo_mvp_roadmap]]): Doppelzahlungen
// = Rubinrot, Skonto = Grasgruen, Gutschriften = Himmelblau, Ueberzahlung =
// Amethyst - direkt als Tailwind-Klassen-Suffix statt ueber den (nur fuer
// Handlungsbedarf/Aktivitaeten genutzten) generischen DashAccent-Typ, damit
// hier keine Umwege ueber CSS-Custom-Properties noetig sind.
export type FindingCategory = {
  key: string;
  // Entspricht 1:1 dem CaseCategory-Enum (siehe schema.prisma) - verlinkt die
  // "X Fälle ansehen"-CTA (Phase 2.3) auf genau diese Kategorie in der
  // Fallpruefungs-Arbeitsliste (?category=...).
  caseCategory: CaseCategory;
  name: string;
  desc: string;
  amount: number;
  count: number;
  accentClass: "red" | "green" | "blue" | "purple";
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
    caseCategory: "DUPLICATE_PAYMENT",
    name: "Doppelzahlungen",
    desc: "Rechnungen, die versehentlich doppelt oder mehrfach beglichen wurden.",
    amount: duplicatePayments.totalAmount.toNumber(),
    count: duplicatePayments.caseCount,
    accentClass: "red",
    icon: CopyIcon,
    cases: duplicatePayments.topCases.map((c) => ({ who: c.who, what: c.what, amount: c.amount.toNumber() })),
  };
  const discountFinding: FindingCategory = {
    key: "discount",
    caseCategory: "MISSED_DISCOUNT",
    name: "Skonto nicht genutzt",
    desc: "Frühzahler-Rabatte, die durch verspätete Zahlung verpasst wurden.",
    amount: missedDiscounts.totalAmount.toNumber(),
    count: missedDiscounts.caseCount,
    accentClass: "green",
    icon: PercentIcon,
    cases: missedDiscounts.topCases.map((c) => ({ who: c.who, what: c.what, amount: c.amount.toNumber() })),
  };
  const creditFinding: FindingCategory = {
    key: "credit",
    caseCategory: "OPEN_CREDIT_NOTE",
    name: "Offene Gutschriften",
    desc: "Erhaltene Gutschriften, die noch nicht mit Rechnungen verrechnet wurden.",
    amount: openCreditNotes.totalAmount.toNumber(),
    count: openCreditNotes.caseCount,
    accentClass: "blue",
    icon: FileTextIcon,
    cases: openCreditNotes.topCases.map((c) => ({ who: c.who, what: c.what, amount: c.amount.toNumber() })),
  };
  const overpaymentFinding: FindingCategory = {
    key: "overpayment",
    caseCategory: "OVERPAYMENT",
    name: "Mögliche Überzahlung",
    desc: "Gezahlter Betrag weicht vom Rechnungsbetrag ab, z. B. durch Tipp- oder Rundungsfehler.",
    amount: overpayments.totalAmount.toNumber(),
    count: overpayments.caseCount,
    accentClass: "purple",
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

// Statische Tailwind-Klassen (nicht dynamisch zusammengesetzt) fuer jede der
// vier Akzentfarben - Tailwinds Build-Scanner findet nur woertlich im Code
// stehende Klassennamen (siehe Gotcha in [[controlling_cockpit_dark_mode_bg_leak_gotcha]]),
// daher hier vier komplette Sets statt einer Template-String-Zusammensetzung.
const TOP_BAR_CLASS: Record<FindingCategory["accentClass"], string> = {
  red: "before:bg-gradient-to-r before:from-dash-red before:to-dash-red/45",
  green: "before:bg-gradient-to-r before:from-dash-green before:to-dash-green/45",
  blue: "before:bg-gradient-to-r before:from-dash-blue before:to-dash-blue/45",
  purple: "before:bg-gradient-to-r before:from-dash-purple before:to-dash-purple/45",
};
const ICON_BOX_CLASS: Record<FindingCategory["accentClass"], string> = {
  red: "bg-dash-red-tint text-dash-red",
  green: "bg-dash-green-tint text-dash-green",
  blue: "bg-dash-blue-tint text-dash-blue",
  purple: "bg-dash-purple-tint text-dash-purple",
};
const CTA_CLASS: Record<FindingCategory["accentClass"], string> = {
  red: "bg-dash-red-tint text-dash-red hover:bg-dash-red/25",
  green: "bg-dash-green-tint text-dash-green hover:bg-dash-green/25",
  blue: "bg-dash-blue-tint text-dash-blue hover:bg-dash-blue/25",
  purple: "bg-dash-purple-tint text-dash-purple hover:bg-dash-purple/25",
};
const HOVER_BORDER_CLASS: Record<FindingCategory["accentClass"], string> = {
  red: "hover:-translate-y-[3px] hover:border-dash-red/45 hover:shadow-[0_10px_24px_rgba(239,88,120,0.16)]",
  green: "hover:-translate-y-[3px] hover:border-dash-green/45 hover:shadow-[0_10px_24px_rgba(111,189,92,0.16)]",
  blue: "hover:-translate-y-[3px] hover:border-dash-blue/45 hover:shadow-[0_10px_24px_rgba(63,169,222,0.16)]",
  purple: "hover:-translate-y-[3px] hover:border-dash-purple/45 hover:shadow-[0_10px_24px_rgba(177,95,209,0.16)]",
};

export function FindingsList({ findings }: { findings: FindingCategory[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {findings.map((f) => (
        <div
          key={f.key}
          className={`relative flex flex-col gap-4 overflow-hidden p-6 ${dashCardClass} ${HOVER_BORDER_CLASS[f.accentClass]} before:absolute before:inset-x-0 before:top-0 before:h-1 ${TOP_BAR_CLASS[f.accentClass]}`}
        >
          <div className="flex items-start gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_BOX_CLASS[f.accentClass]}`}>
              <f.icon className="h-[19px] w-[19px]" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[20px] font-semibold leading-[28px] text-dash-text">{f.name}</h3>
              <p className="mt-0.5 text-[13px] leading-[18px] text-dash-text-muted">{f.desc}</p>
            </div>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-[26px] font-bold tracking-[-0.01em] tabular-nums text-dash-text">{f.amount.toLocaleString("de-DE")}&nbsp;€</span>
            <span className="rounded-lg border border-dash-line bg-dash-panel-soft px-2.5 py-1 text-[12px] font-semibold text-dash-text-muted">
              {f.count} {f.count === 1 ? "Fall" : "Fälle"}
            </span>
          </div>

          {f.count === 0 ? (
            <p className="mt-auto text-[13px] text-dash-text-faint">Aktuell keine Fälle in dieser Kategorie gefunden.</p>
          ) : (
            <>
              <div className="flex flex-col overflow-hidden rounded-lg border-t border-dash-line">
                {f.cases.map((c, i) => (
                  <div
                    key={`${c.who}-${c.what}`}
                    className={`grid grid-cols-[1fr_auto_auto] items-baseline gap-2.5 px-3 py-2.5 text-[13px] ${i % 2 === 0 ? "bg-dash-panel-soft" : ""}`}
                  >
                    <span className="truncate font-semibold text-dash-text">{c.who}</span>
                    <span className="whitespace-nowrap text-dash-text-faint">{c.what}</span>
                    <span className="whitespace-nowrap text-right font-semibold tabular-nums text-dash-text">{c.amount.toLocaleString("de-DE")}&nbsp;€</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/arbeitgeber/dashboard/faelle?category=${f.caseCategory}`}
                className={`mt-auto flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-[13px] font-semibold transition-[background,transform] duration-150 hover:-translate-y-px ${CTA_CLASS[f.accentClass]}`}
              >
                {f.count} {f.count === 1 ? "Fall" : "Fälle"} ansehen →
              </Link>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
