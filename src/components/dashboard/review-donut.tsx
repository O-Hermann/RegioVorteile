import Link from "next/link";
import type { CaseStatusFilter } from "@/lib/case-labels";
import { dashCardClass, dashModuleHoverClass, dashIconBoxClass, dashTextDonutNumber, dashDonutSizeClass, dashDonutInsetClass, dashDonutColClass } from "@/components/dashboard/dash-ui";

// "Prüfübersicht"-Karte, 1:1 aus dem "Goldstandard"-Mockup (siehe
// [[effivo_mvp_roadmap]]): eigenes Status-Farbschema statt wiederverwendeter
// Kategorie-/Marken-Toene (vier Iterationsrunden mit dem Nutzer, siehe
// Roadmap-Eintrag) - Neu = Gold, In Prüfung = kraeftiges Kobaltblau, Geprüft
// = sattes Gruen, Abgeschlossen = helles Grau. Legende, Donut-Segmente und
// Gesamtsumme kommen aus `counts` (getCaseCounts(), von page.tsx
// uebergeben). Donut hat jetzt echte Luecken zwischen den Segmenten (statt
// nahtlos ineinander uebergehend), einen Schlagschatten und einen dezenten
// Glanz-Highlight fuer mehr Tiefe. "Ø Prüfzeit" bleibt bewusst eine
// Demoangabe - siehe review-status.tsx fuer die ausfuehrliche Begruendung.
const STATUS_LEGEND: { key: Exclude<CaseStatusFilter, "all">; label: string; dot: string; colorVar: string }[] = [
  { key: "NEW", label: "Neu", dot: "bg-dash-status-new", colorVar: "var(--color-dash-status-new)" },
  { key: "IN_REVIEW", label: "In Prüfung", dot: "bg-dash-status-active", colorVar: "var(--color-dash-status-active)" },
  { key: "REVIEWED", label: "Geprüft", dot: "bg-dash-status-reviewed", colorVar: "var(--color-dash-status-reviewed)" },
  { key: "CLOSED", label: "Abgeschlossen", dot: "bg-dash-status-done", colorVar: "var(--color-dash-status-done)" },
];

export function ReviewDonut({ counts }: { counts: Record<CaseStatusFilter, number> }) {
  const total = counts.all;
  const legend = STATUS_LEGEND.map((entry) => ({
    ...entry,
    value: counts[entry.key],
    share: total > 0 ? `${Math.round((counts[entry.key] / total) * 100)}%` : "0%",
  }));

  // Kumulative Prozentgrenzen fuer den conic-gradient inkl. echter Luecken
  // zwischen den Segmenten (mit der Kartenflaeche eingefaerbt, wie im
  // Mockup) - bei total=0 wird der Farbverlauf gar nicht erst gerendert
  // (siehe grauer Fallback-Kreis weiter unten), daher keine Division-durch-0
  // -Sonderbehandlung noetig. Per reduce() statt einer waehrend des Renders
  // mutierten Variable (React-Compiler-Kompatibilitaet).
  const gapDeg = 3;
  const availableDeg = 360 - gapDeg * legend.length;
  const donutStops = legend.reduce<{ cursor: number; css: string[] }>(
    (acc, entry) => {
      const span = total > 0 ? (entry.value / total) * availableDeg : 0;
      const segFrom = acc.cursor;
      const segTo = segFrom + span;
      const gapFrom = segTo;
      const gapTo = gapFrom + gapDeg;
      return {
        cursor: gapTo,
        css: [...acc.css, `${entry.colorVar} ${segFrom.toFixed(2)}deg ${segTo.toFixed(2)}deg`, `var(--color-dash-panel) ${gapFrom.toFixed(2)}deg ${gapTo.toFixed(2)}deg`],
      };
    },
    { cursor: 0, css: [] },
  ).css;
  const gradient = `conic-gradient(${donutStops.join(", ")})`;
  const newCount = counts.NEW;

  return (
    <div className={`flex min-h-0 flex-col gap-4 overflow-hidden p-6 ${dashCardClass} ${dashModuleHoverClass}`}>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-[20px] font-semibold leading-[28px] text-dash-text">
          <span className={dashIconBoxClass}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="7" />
              <path d="M12 5v7l4 2" />
            </svg>
          </span>
          Prüfübersicht
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-dash-line px-2.5 py-1 text-[12px] font-semibold text-dash-text-muted">
          <i className="h-1.5 w-1.5 rounded-full bg-dash-gold" />
          {total} {total === 1 ? "Fall gesamt" : "Fälle gesamt"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-dash-line bg-dash-panel-soft px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-dash-text-faint">Bearbeitungsstatus</span>
          <strong className="truncate text-[14px] font-semibold text-dash-text">
            {newCount === 0 ? "Keine neuen Fälle" : `${newCount} ${newCount === 1 ? "neuer Fall wartet" : "neue Fälle warten"} auf Prüfung`}
          </strong>
        </div>
        <span className="shrink-0 whitespace-nowrap text-right text-[12px] text-dash-text-muted">
          <b className="block text-[14px] font-semibold text-dash-text">11 Min.</b>Ø Prüfzeit
        </span>
      </div>

      <div className={`grid ${dashDonutColClass} items-center gap-5`}>
        <div className={`relative mx-auto ${dashDonutSizeClass} rounded-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.22)]`}>
          {total > 0 ? (
            <>
              <div className="absolute inset-0 rounded-full" style={{ backgroundImage: gradient }} />
              <div
                className="absolute inset-0 rounded-full"
                style={{ backgroundImage: "radial-gradient(110px 85px at 28% 18%, rgba(255,255,255,0.22), transparent 62%)" }}
              />
            </>
          ) : (
            <div className="absolute inset-0 rounded-full bg-dash-panel-soft" />
          )}
          <div className={`absolute ${dashDonutInsetClass} rounded-full bg-dash-panel shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)]`} />
          <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center text-center">
            <b className={`block ${dashTextDonutNumber} font-bold leading-none tabular-nums text-dash-text`}>{total}</b>
            <span className="mt-1 block text-[11px] leading-none text-dash-text-muted">Gesamt</span>
          </div>
        </div>
        <div className="grid gap-1.5">
          {legend.map((leg) => (
            <div
              key={leg.key}
              className={`grid grid-cols-[1fr_auto_36px] items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] ${leg.key === "NEW" ? "bg-dash-gold-glow" : ""}`}
            >
              <span className="flex min-w-0 items-center gap-2 text-dash-text-secondary">
                <i className={`h-2 w-2 shrink-0 rounded-full ${leg.dot}`} />
                <span className="truncate">{leg.label}</span>
              </span>
              <b className="text-right font-semibold tabular-nums text-dash-text">{leg.value}</b>
              <em className="text-right text-[12px] not-italic tabular-nums text-dash-text-faint">{leg.share}</em>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={newCount === 0 ? "/arbeitgeber/dashboard/faelle" : "/arbeitgeber/dashboard/faelle?status=NEW"}
        className="mt-auto flex shrink-0 items-center justify-between gap-2 rounded-xl bg-dash-gold-glow px-4 py-3.5 text-[13px] font-semibold text-dash-gold transition-[background,transform] duration-150 hover:-translate-y-px hover:bg-dash-gold/25"
      >
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 rounded-full bg-dash-gold" />
          <b>{newCount === 0 ? "Alle Fälle ansehen" : `${newCount} ${newCount === 1 ? "neuen Fall" : "neue Fälle"} zuerst prüfen`}</b>
        </span>
        <span>Öffnen →</span>
      </Link>
    </div>
  );
}
