import type { MetricChange } from "@/lib/company-metrics";
import { formatChange, changeTone } from "@/lib/company-metrics";
import { dashTextValue, dashTextKpiLabel, dashTextSecondary } from "@/components/dashboard/dash-ui";

export type KpiAccent = "highlight" | "teal" | "orange" | "green" | "blue" | "purple";

export type KpiTile = {
  key: string;
  label: string;
  value: string;
  icon: (props: { className?: string }) => React.ReactElement;
  accent: KpiAccent;
  change?: MetricChange | null;
  changeDirection?: "up-good" | "down-good";
  changeContext?: string;
  // Nur fuer "Offene Datenfehler": zeigt statt einer Veraenderungszeile (die
  // es fuer diese Kennzahl nicht gibt) eine kompakte "Details ansehen"-
  // Kennzeichnung neben dem Wert, ohne eine eigene breite Kachel zu
  // benoetigen - passt dadurch in dasselbe 2x4-Raster wie alle anderen
  // Kennzahlen.
  detailsLabel?: string;
};

const ACCENT_BAR: Record<KpiAccent, string> = {
  highlight: "bg-emerald-500 dark:bg-transparent dark:bg-[linear-gradient(180deg,#5ff2e8,#2bcf9c)]",
  teal: "bg-ink-500 dark:bg-dash-teal/70",
  orange: "bg-amber-500 dark:bg-dash-orange/70",
  green: "bg-emerald-500 dark:bg-dash-green/70",
  blue: "bg-sky-500 dark:bg-dash-blue/70",
  purple: "bg-violet-500 dark:bg-dash-purple/70",
};

const ACCENT_BUBBLE: Record<KpiAccent, string> = {
  highlight:
    "text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 dark:text-dash-green dark:bg-[rgba(71,215,149,0.1)] dark:border-dash-green/60",
  teal: "text-ink-700 bg-ink-500/10 border border-ink-500/30 dark:text-dash-teal dark:bg-[rgba(45,214,197,0.09)] dark:border-dash-teal/60",
  orange:
    "text-amber-600 bg-amber-500/10 border border-amber-500/30 dark:text-dash-orange dark:bg-[rgba(226,171,72,0.16)] dark:border-dash-orange/60",
  green:
    "text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 dark:text-dash-green dark:bg-[rgba(71,215,149,0.1)] dark:border-dash-green/60",
  blue: "text-sky-600 bg-sky-500/10 border border-sky-500/30 dark:text-dash-blue dark:bg-[rgba(99,170,255,0.1)] dark:border-dash-blue/60",
  purple:
    "text-violet-600 bg-violet-500/10 border border-violet-500/30 dark:text-dash-purple dark:bg-[rgba(170,118,255,0.12)] dark:border-dash-purple/60",
};

const CHANGE_TONE_CLASSES: Record<"positive" | "negative" | "neutral", string> = {
  positive: "text-emerald-600 dark:text-[#67dea9]",
  negative: "text-rose-600 dark:text-[#ff9b96]",
  neutral: "text-sand-500 dark:text-[#8bcfc9]",
};

const dashSecondary = "text-sand-500 dark:text-[#89a7c0]";

// KPI-Kacheln der linken Spalte, optisch 1:1 die V12-".kpi"-Karten (Akzent-
// leiste links, Icon-Bubble, grosser Wert, kleine Veraenderungszeile, Pfeil
// oben rechts). Acht echte Kennzahlen in einem sauberen 2x4-Raster - jede
// Kennzahl hat ihre eigene physische Kachel (keine Zusammenfuehrung, keine
// breite Sonderkachel mehr): "Offene Datenfehler" zeigt statt der bei ihr
// nicht vorhandenen Veraenderungszeile stattdessen kompakt "Details ansehen"
// neben dem Wert (siehe "detailsLabel").
//
// Gleiche Kartenhoehe fuer alle acht Kacheln: bewusst NICHT ueber eine
// geschaetzte feste/clamp-basierte Mindesthoehe geloest (ein erster Versuch
// devon lief bei mittleren Viewport-Hoehen ueber die Kartenkante hinaus, da
// die Text-Groessen selbst schon nichtlinear per clamp() skalieren - ein
// linearer Hoehen-Schaetzwert trifft die tatsaechlich benoetigte Hoehe dann
// nicht mehr exakt). Stattdessen bekommt JEDE Kachel exakt dieselben drei
// Zeilen (Icon/Label, Wert, dritte Zeile) - Kacheln ohne echte Veraenderung
// oder CTA rendern die dritte Zeile unsichtbar (aber layoutwirksam, gleiche
// Schriftgroessen-Klasse). Dadurch ist die natuerliche Inhaltshoehe aller
// Kacheln bei jeder Viewport-Hoehe identisch, ohne eine eigene Annaeherung
// pflegen zu muessen.
export function KpiGrid({ tiles }: { tiles: KpiTile[] }) {
  return (
    <div className="grid flex-1 grid-cols-2 gap-2">
      {tiles.map((tile) => {
        const change =
          tile.change !== undefined && tile.change !== null && tile.changeDirection
            ? { text: formatChange(tile.change), tone: changeTone(tile.change, tile.changeDirection) }
            : null;

        return (
          <div
            key={tile.key}
            className="relative flex flex-col justify-center overflow-hidden rounded-[13px] border border-card-border dark:border-[rgba(45,79,111,0.65)] bg-card dark:bg-[linear-gradient(180deg,rgba(13,35,59,0.84),rgba(9,29,50,0.78))] px-3 py-2 shadow-warm-sm transition-[transform,border-color,background,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-ink-400 dark:hover:border-[rgba(63,129,166,0.75)] dark:hover:bg-[linear-gradient(180deg,rgba(17,43,70,0.92),rgba(10,33,56,0.88))]"
          >
            <span className="absolute right-2.5 top-2.5 text-[13px] leading-none text-[#7f96ab] dark:text-[#44617e]">›</span>
            <span className={`absolute left-0 top-[13px] bottom-[13px] w-[2px] rounded-r-[2px] opacity-70 ${ACCENT_BAR[tile.accent]}`} />
            <div className={`flex items-center gap-2 ${dashTextKpiLabel} font-medium text-sand-700 dark:text-[#d8e7f2]`}>
              <span className={`flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-full ${ACCENT_BUBBLE[tile.accent]}`}>
                <tile.icon className="h-4 w-4" />
              </span>
              <span className="truncate">{tile.label}</span>
            </div>

            <p className={`mt-0.5 font-display ${dashTextValue} font-bold leading-none tracking-tight tabular-nums text-sand-900 dark:text-dash-text`}>
              {tile.value}
            </p>

            {tile.detailsLabel ? (
              <div className={`mt-0.5 flex min-w-0 items-center ${dashTextSecondary}`}>
                <span className="truncate font-bold text-ink-600 dark:text-dash-teal">{tile.detailsLabel}</span>
              </div>
            ) : change ? (
              <div className={`mt-0.5 flex min-w-0 items-center gap-1.5 ${dashTextSecondary}`}>
                <span className={`font-bold tabular-nums whitespace-nowrap ${CHANGE_TONE_CLASSES[change.tone]}`}>{change.text}</span>
                {tile.changeContext && <span className={`truncate ${dashSecondary}`}>{tile.changeContext}</span>}
              </div>
            ) : (
              <div aria-hidden className={`invisible mt-0.5 flex min-w-0 items-center gap-1.5 ${dashTextSecondary}`}>
                <span className="font-bold tabular-nums whitespace-nowrap">—</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
