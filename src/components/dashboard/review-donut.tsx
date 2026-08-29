import Link from "next/link";
import type { CaseStatusFilter } from "@/lib/case-labels";
import {
  dashTextTitle,
  dashTextBody,
  dashTextBodyLg,
  dashTextSecondaryLg,
  dashTextSecondarySm,
  dashTextDonutNumber,
  dashDonutSizeClass,
  dashDonutInsetClass,
  dashDonutColClass,
} from "@/components/dashboard/dash-ui";

// "Prüfübersicht"-Karte, optisch 1:1 die V12-".v10-review"-Karte (Donut per
// conic-gradient, Legende, Statuszeile). MVP-Roadmap Phase 3 (siehe
// [[effivo_mvp_roadmap]]): seit dem echten Case-Modell (Phase 2) sind Legende,
// Donut-Segmente und Gesamtsumme aus `counts` (getCaseCounts(), von
// page.tsx uebergeben) berechnet statt Referenz-Demowerten. "Ø Prüfzeit"
// bleibt bewusst eine Demoangabe (siehe Kommentar bei review-status.tsx) -
// dem Case-Modell fehlt ein Zeitstempel dafuer, wann eine Pruefung begonnen
// wurde, nur wann sie ABGESCHLOSSEN wurde (reviewedAt); die Zeit von
// createdAt bis reviewedAt waere "Durchlaufzeit" (kann tagelang Wartezeit
// enthalten), nicht "Bearbeitungszeit" - eine erfundene Kennzahl waere hier
// irrefuehrender als eine erkennbare Demoangabe.
const STATUS_LEGEND: { key: Exclude<CaseStatusFilter, "all">; label: string; dot: string; colorHex: string }[] = [
  { key: "NEW", label: "Neu", dot: "bg-dash-teal", colorHex: "#2dd6c5" },
  { key: "IN_REVIEW", label: "In Prüfung", dot: "bg-dash-orange", colorHex: "#e2ab48" },
  { key: "REVIEWED", label: "Geprüft", dot: "bg-dash-blue", colorHex: "#63aaff" },
  { key: "CLOSED", label: "Abgeschlossen", dot: "bg-dash-green", colorHex: "#47d795" },
];
// Helle (Light-Mode-)Variante derselben vier Farben, analog zum bisherigen
// hartcodierten Light-Mode-Gradient (#0f766e/#e2ab48/#63aaff/#47d795).
const STATUS_COLOR_LIGHT: Record<string, string> = { NEW: "#0f766e", IN_REVIEW: "#e2ab48", REVIEWED: "#63aaff", CLOSED: "#47d795" };

export function ReviewDonut({ counts }: { counts: Record<CaseStatusFilter, number> }) {
  const total = counts.all;
  const legend = STATUS_LEGEND.map((entry) => ({
    ...entry,
    value: counts[entry.key],
    share: total > 0 ? `${Math.round((counts[entry.key] / total) * 100)}%` : "0%",
  }));

  // Kumulative Prozentgrenzen fuer den conic-gradient (0% Start, dann
  // aufsummiert) - bei total=0 bleibt jedes Segment bei 0% (voll grauer
  // Kreis statt Division durch 0). Per reduce() statt einer waehrend des
  // Renders mutierten Variable (React-Compiler-Kompatibilitaet).
  const stops = legend.reduce<{ key: string; label: string; dot: string; colorHex: string; value: number; share: string; from: number; to: number }[]>(
    (acc, entry) => {
      const from = acc.length > 0 ? acc[acc.length - 1].to : 0;
      const to = from + (total > 0 ? (entry.value / total) * 100 : 0);
      return [...acc, { ...entry, from, to }];
    },
    [],
  );
  const gradientLight = stops.map((s) => `${STATUS_COLOR_LIGHT[s.key]}_${s.from.toFixed(2)}%_${s.to.toFixed(2)}%`).join(",");
  const gradientDark = stops.map((s) => `${s.colorHex}_${s.from.toFixed(2)}%_${s.to.toFixed(2)}%`).join(",");
  const newCount = counts.NEW;

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-3.5 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.032),0_16px_36px_rgba(0,0,0,0.19)]">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className={`flex items-center gap-2 ${dashTextTitle} font-extrabold text-sand-900 dark:text-dash-text`}>
          <span className="flex h-[27px] w-[27px] items-center justify-center rounded-[9px] text-ink-700 dark:text-dash-teal bg-ink-400/15 dark:bg-transparent dark:bg-[linear-gradient(180deg,rgba(45,214,197,0.14),rgba(45,214,197,0.07))] border border-ink-400/25 dark:border-[rgba(45,214,197,0.14)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="7" />
              <path d="M12 5v7l4 2" />
            </svg>
          </span>
          Prüfübersicht
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-card-border px-2 py-1 ${dashTextSecondaryLg} font-semibold text-sand-500 dark:border-[rgba(45,214,197,0.16)] dark:bg-[rgba(45,214,197,0.055)] dark:text-[#b9f9f5]`}>
          <i className="h-1.5 w-1.5 rounded-full bg-ink-500 dark:bg-dash-teal" />
          {total} {total === 1 ? "Fall gesamt" : "Fälle gesamt"}
        </span>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 rounded-[10px] border border-card-border/60 bg-sand-50/60 px-2.5 py-1.5 dark:border-[rgba(71,108,140,0.19)] dark:bg-[linear-gradient(180deg,rgba(8,29,50,0.62),rgba(7,25,44,0.44))]">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={`${dashTextSecondarySm} font-bold uppercase tracking-wide text-sand-400 dark:text-dash-text-muted`}>Bearbeitungsstatus</span>
          <strong className={`truncate ${dashTextBodyLg} font-bold text-sand-900 dark:text-[#eef8ff]`}>
            {newCount === 0 ? "Keine neuen Fälle" : `${newCount} ${newCount === 1 ? "neuer Fall wartet" : "neue Fälle warten"} auf Prüfung`}
          </strong>
        </div>
        <span className={`shrink-0 whitespace-nowrap text-right ${dashTextSecondarySm} text-sand-500 dark:text-dash-text-muted`}>
          <b className={`block ${dashTextBodyLg} font-bold text-sand-900 dark:text-[#d7e8f5]`}>11 Min.</b>Ø Prüfzeit
        </span>
      </div>

      <div className={`mt-1.5 grid ${dashDonutColClass} items-center gap-3`}>
        <div className={`relative mx-auto ${dashDonutSizeClass} rounded-full shadow-warm-sm dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045),0_10px_22px_rgba(0,0,0,0.14)]`}>
          {total > 0 ? (
            <>
              <div className="absolute inset-0 rounded-full dark:hidden" style={{ backgroundImage: `conic-gradient(${gradientLight.replaceAll("_", " ")})` }} />
              <div className="absolute inset-0 hidden rounded-full dark:block" style={{ backgroundImage: `conic-gradient(${gradientDark.replaceAll("_", " ")})` }} />
            </>
          ) : (
            <div className="absolute inset-0 rounded-full bg-sand-200 dark:bg-[rgba(83,121,151,0.18)]" />
          )}
          <div className={`absolute ${dashDonutInsetClass} rounded-full bg-sand-50 dark:bg-[radial-gradient(circle,rgba(14,41,68,0.99),rgba(9,29,50,0.99))]`} />
          <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center text-center">
            <b className={`block ${dashTextDonutNumber} font-extrabold leading-none text-sand-900 dark:text-dash-text`}>{total}</b>
            <span className={`mt-0.5 block leading-none ${dashTextSecondarySm} text-sand-500 dark:text-dash-text-muted`}>Gesamt</span>
          </div>
        </div>
        <div className="grid gap-1">
          {legend.map((leg) => (
            <div
              key={leg.key}
              className={`grid grid-cols-[1fr_auto_32px] items-center gap-2 rounded-lg px-1.5 py-1 ${dashTextBody} ${
                leg.key === "NEW" ? "bg-ink-50 dark:bg-[rgba(45,214,197,0.07)] dark:border dark:border-[rgba(45,214,197,0.12)]" : ""
              }`}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-sand-600 dark:text-dash-text-secondary">
                <i className={`h-[7px] w-[7px] shrink-0 rounded-sm ${leg.dot}`} />
                <span className="truncate">{leg.label}</span>
              </span>
              <b className="text-right font-bold tabular-nums text-sand-900 dark:text-dash-text">{leg.value}</b>
              <em className={`text-right ${dashTextSecondaryLg} not-italic text-sand-400 tabular-nums dark:text-dash-text-secondary`}>{leg.share}</em>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={newCount === 0 ? "/arbeitgeber/dashboard/faelle" : "/arbeitgeber/dashboard/faelle?status=NEW"}
        className={`mt-auto flex shrink-0 items-center justify-between gap-2 rounded-[9px] border border-ink-400/20 bg-ink-50/60 px-2.5 py-2 ${dashTextBody} text-ink-700 transition-colors hover:bg-ink-50 dark:border-[rgba(45,214,197,0.14)] dark:bg-transparent dark:bg-[linear-gradient(90deg,rgba(45,214,197,0.07),rgba(45,214,197,0.018))] dark:text-[#9df8f2] dark:hover:text-[#c1fbf5]`}
      >
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 rounded-full bg-ink-500 dark:bg-dash-teal" />
          <b>{newCount === 0 ? "Alle Fälle ansehen" : `${newCount} ${newCount === 1 ? "neuen Fall" : "neue Fälle"} zuerst prüfen`}</b>
        </span>
        <span>Öffnen →</span>
      </Link>
    </div>
  );
}
