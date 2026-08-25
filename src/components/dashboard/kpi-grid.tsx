import type { MetricChange } from "@/lib/company-metrics";
import { formatChange, changeTone } from "@/lib/company-metrics";

export type KpiAccent = "highlight" | "teal" | "orange" | "green" | "blue" | "purple";

export type KpiTile = {
  key: string;
  label: string;
  value: string;
  icon: (props: { className?: string }) => React.ReactElement;
  accent: KpiAccent;
  wide?: boolean;
  change?: MetricChange | null;
  changeDirection?: "up-good" | "down-good";
  changeContext?: string;
};

const ACCENT_BAR: Record<KpiAccent, string> = {
  highlight: "dark:bg-[linear-gradient(180deg,#5ff2e8,#2bcf9c)] bg-emerald-500",
  teal: "bg-ink-500 dark:bg-dash-teal/70",
  orange: "bg-amber-500 dark:bg-dash-orange/70",
  green: "bg-emerald-500 dark:bg-dash-green/70",
  blue: "bg-sky-500 dark:bg-dash-blue/70",
  purple: "bg-violet-500 dark:bg-dash-purple/70",
};

const ACCENT_BUBBLE: Record<KpiAccent, string> = {
  highlight:
    "text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 dark:text-dash-green dark:bg-[rgba(50,215,154,0.1)] dark:border-dash-green/60",
  teal: "text-ink-700 bg-ink-500/10 border border-ink-500/30 dark:text-dash-teal dark:bg-[rgba(37,216,206,0.09)] dark:border-dash-teal/60",
  orange:
    "text-amber-600 bg-amber-500/10 border border-amber-500/30 dark:text-dash-orange dark:bg-[rgba(240,162,62,0.16)] dark:border-dash-orange/60",
  green:
    "text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 dark:text-dash-green dark:bg-[rgba(50,215,154,0.1)] dark:border-dash-green/60",
  blue: "text-sky-600 bg-sky-500/10 border border-sky-500/30 dark:text-dash-blue dark:bg-[rgba(79,159,255,0.1)] dark:border-dash-blue/60",
  purple:
    "text-violet-600 bg-violet-500/10 border border-violet-500/30 dark:text-dash-purple dark:bg-[rgba(170,118,255,0.12)] dark:border-dash-purple/60",
};

const CHANGE_TONE_CLASSES: Record<"positive" | "negative" | "neutral", string> = {
  positive: "text-emerald-600 dark:text-[#67dea9]",
  negative: "text-rose-600 dark:text-[#ff9b96]",
  neutral: "text-sand-500 dark:text-[#8bcfc9]",
};

// KPI-Kacheln der linken Spalte, optisch 1:1 die V12-".kpi"-Karten (Akzent-
// leiste links, Icon-Bubble, grosser Wert, kleine Veraenderungszeile).
// Anders als die Demo-Referenz sind es hier bewusst 8 statt 7 Kacheln, weil
// 8 echte Kennzahlen existieren (siehe ArbeitgeberDashboardPage) - die letzte
// ("Offene Datenfehler") bleibt wie im Original die volle Breite spannende
// "wide"-Kachel. Veraenderungswerte werden NUR angezeigt, wenn dafuer eine
// echte Vormonats-Berechnung existiert (Umsatz/Offene Forderungen/Kunden mit
// Umsatz) - fuer die uebrigen Kennzahlen gibt es keine echte Vormonatsgroesse,
// ein erfundener Prozentwert waere hier Platzhalter-Content ohne Datenbasis.
export function KpiGrid({ tiles }: { tiles: KpiTile[] }) {
  return (
    <div className="grid flex-1 grid-cols-2 auto-rows-fr gap-2">
      {tiles.map((tile) => {
        const change =
          tile.change !== undefined && tile.change !== null && tile.changeDirection
            ? { text: formatChange(tile.change), tone: changeTone(tile.change, tile.changeDirection) }
            : null;

        return (
          <div
            key={tile.key}
            className={`relative flex min-h-[74px] flex-col justify-center overflow-hidden rounded-[13px] border border-card-border dark:border-[rgba(45,79,111,0.65)] bg-card dark:bg-[linear-gradient(180deg,rgba(13,35,59,0.84),rgba(9,29,50,0.78))] px-3 py-2.5 shadow-warm-sm transition-[transform,border-color,background,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-ink-400 dark:hover:border-[rgba(63,129,166,0.75)] dark:hover:bg-[linear-gradient(180deg,rgba(17,43,70,0.92),rgba(10,33,56,0.88))] ${
              tile.wide ? "col-span-2 grid grid-cols-[1fr_auto] items-center" : ""
            }`}
          >
            <span className={`absolute left-0 top-[13px] bottom-[13px] w-[2px] rounded-r-[2px] opacity-70 ${ACCENT_BAR[tile.accent]}`} />
            <div className={tile.wide ? "min-w-0" : ""}>
              <div className="flex items-center gap-2 text-[11px] font-medium text-sand-700 dark:text-[#d8e7f2]">
                <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${ACCENT_BUBBLE[tile.accent]}`}>
                  <tile.icon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">{tile.label}</span>
              </div>
              <p className="mt-1 font-display text-[19px] font-bold leading-none tracking-tight tabular-nums text-sand-900 dark:text-dash-text">
                {tile.value}
              </p>
              {change && (
                <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px]">
                  <span className={`font-bold tabular-nums whitespace-nowrap ${CHANGE_TONE_CLASSES[change.tone]}`}>{change.text}</span>
                  {tile.changeContext && (
                    <span className={`truncate ${dashSecondary}`}>{tile.changeContext}</span>
                  )}
                </div>
              )}
            </div>
            {tile.wide && (
              <span className="shrink-0 rounded-full border border-ink-400/30 bg-ink-50 px-3 py-1.5 text-[10.5px] font-bold text-ink-700 dark:border-dash-teal/25 dark:bg-[linear-gradient(180deg,rgba(29,97,106,0.75),rgba(10,56,71,0.78))] dark:text-dash-text">
                Details ansehen →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const dashSecondary = "text-sand-500 dark:text-[#89a7c0]";
