import Link from "next/link";
import { ActivityIcon } from "@/components/icons";
import { periodLabel } from "@/lib/data-import";
import { shortMonthLabel, formatChange, changeTone, formatEuroCompact, type MetricChange, type MonthPeriod } from "@/lib/company-metrics";
import { dashTextTitle, dashTextBody, dashTextBodyLg, dashTextSecondaryLg, dashTextSecondarySm } from "@/components/dashboard/dash-ui";

type Row = {
  label: string;
  current: string;
  previous: string;
  change: MetricChange | null;
  direction: "up-good" | "down-good";
  emphasis?: "warning" | "highlight" | "none";
};

// "Analysevergleich"-Karte, optisch 1:1 die V12-".analysis-compare-card"
// (Kopf mit Statuschip, Kontextzeile mit hervorgehobener Hauptveraenderung,
// Tabelle mit farbiger Randleiste je nach Zeilen-Bedeutung). Inhaltlich der
// bestehende echte Monatsvergleich (Umsatz/Offene Forderungen/Kunden mit
// Umsatz) - nicht die Demo-Zeilen "Auffaelligkeiten/Bestaetigte Funde" der
// Referenz, da es dafuer kein echtes Datenmodell gibt.
export function AnalysisCompare({
  currentPeriod,
  previousPeriod,
  revenueCurrent,
  revenuePrevious,
  revenueChange,
  openReceivablesCurrent,
  openReceivablesPrevious,
  openReceivablesChange,
  customersWithRevenueCurrent,
  customersWithRevenuePrevious,
  customersWithRevenueChange,
}: {
  currentPeriod: MonthPeriod | null;
  previousPeriod: MonthPeriod | null;
  revenueCurrent: Parameters<typeof formatEuroCompact>[0];
  revenuePrevious: Parameters<typeof formatEuroCompact>[0];
  revenueChange: MetricChange | null;
  openReceivablesCurrent: Parameters<typeof formatEuroCompact>[0];
  openReceivablesPrevious: Parameters<typeof formatEuroCompact>[0];
  openReceivablesChange: MetricChange | null;
  customersWithRevenueCurrent: number | null;
  customersWithRevenuePrevious: number | null;
  customersWithRevenueChange: MetricChange | null;
}) {
  const hasData = !!(currentPeriod && previousPeriod);

  const rows: Row[] = hasData
    ? [
        {
          label: "Umsatz",
          current: formatEuroCompact(revenueCurrent),
          previous: formatEuroCompact(revenuePrevious),
          change: revenueChange,
          direction: "up-good",
          emphasis: "highlight",
        },
        {
          label: "Offene Forderungen",
          current: formatEuroCompact(openReceivablesCurrent),
          previous: formatEuroCompact(openReceivablesPrevious),
          change: openReceivablesChange,
          direction: "down-good",
          emphasis: "warning",
        },
        {
          label: "Kunden mit Umsatz",
          current: String(customersWithRevenueCurrent ?? "—"),
          previous: String(customersWithRevenuePrevious ?? "—"),
          change: customersWithRevenueChange,
          direction: "up-good",
        },
      ]
    : [];

  const headlineRow = rows.find((r) => r.emphasis === "highlight");
  const headlineTone = headlineRow ? changeTone(headlineRow.change, headlineRow.direction) : "neutral";

  return (
    <Link
      href="/arbeitgeber/dashboard/monatsvergleich"
      className="group flex min-h-0 flex-col overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-3.5 shadow-warm-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-ink-400 dark:hover:border-[rgba(71,119,156,0.78)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_15px_34px_rgba(0,0,0,0.18)]"
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className={`flex items-center gap-2 ${dashTextTitle} font-extrabold text-sand-900 dark:text-dash-text`}>
          <span className="flex h-[27px] w-[27px] items-center justify-center rounded-[9px] text-ink-700 dark:text-dash-teal bg-ink-400/15 dark:bg-transparent dark:bg-[linear-gradient(180deg,rgba(45,214,197,0.14),rgba(45,214,197,0.07))] border border-ink-400/25 dark:border-[rgba(45,214,197,0.14)]">
            <ActivityIcon className="h-3.5 w-3.5" />
          </span>
          Analysevergleich
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-card-border px-2 py-1 ${dashTextSecondarySm} font-semibold text-sand-500 dark:border-[rgba(85,125,156,0.20)] dark:bg-[rgba(5,23,41,0.45)] dark:text-[#91a9bf]`}>
          <i className="h-[5px] w-[5px] rounded-full bg-emerald-400 dark:bg-[#59e1a5]" />
          Vormonat
        </span>
      </div>

      {!hasData ? (
        <div className="flex flex-1 min-h-0 items-center justify-center text-center">
          <p className={`${dashTextBodyLg} leading-snug text-sand-500 dark:text-dash-text-secondary`}>
            Für einen Monatsvergleich werden mindestens zwei verarbeitete Monatsimporte benötigt.
          </p>
        </div>
      ) : (
        <>
          <div className={`mt-1.5 flex items-center justify-between gap-2 ${dashTextBody} text-sand-500 dark:text-[#8ea8bf]`}>
            <span>
              {periodLabel(currentPeriod!.periodMonth, currentPeriod!.periodYear)} ggü.{" "}
              {periodLabel(previousPeriod!.periodMonth, previousPeriod!.periodYear)}
            </span>
            {headlineRow && (
              <b
                className={`whitespace-nowrap ${dashTextSecondaryLg} font-bold ${
                  headlineTone === "positive"
                    ? "text-emerald-600 dark:text-[#70e4ad]"
                    : headlineTone === "negative"
                      ? "text-rose-600 dark:text-dash-red"
                      : "text-sand-500 dark:text-dash-text-secondary"
                }`}
              >
                {formatChange(headlineRow.change)} Umsatz
              </b>
            )}
          </div>

          {/* Ein gemeinsames Subgrid statt vier unabhaengiger Zeilen-Grids: nur so
              teilen sich Kopf- und alle Datenzeilen exakt dieselben Spalten-
              breiten (wie bei einer echten <table>). Mit separaten Zeilen-Grids
              (frueherer Stand) berechnete jede "auto"-Spalte ihre Breite nur aus
              dem Inhalt DIESER EINEN Zeile - dadurch standen die Betragsspalten
              zeilenweise unterschiedlich breit und die Zahlen liefen nicht mehr
              sauber untereinander. */}
          <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_auto_auto_auto] overflow-hidden rounded-[10px] border border-card-border/70 dark:border-[rgba(64,101,132,0.18)]">
            <div className="col-span-4 grid grid-cols-subgrid gap-0.5 border-b border-card-border/50 px-1 py-1.5 text-[8.5px] font-semibold uppercase tracking-wide text-sand-400 dark:border-white/[0.045] dark:text-[#6f91af]">
              <span />
              <span className="whitespace-nowrap text-right">{shortMonthLabel(currentPeriod!)}</span>
              <span className="whitespace-nowrap text-right">{shortMonthLabel(previousPeriod!)}</span>
              <span className="whitespace-nowrap text-right">Änderung</span>
            </div>
            {rows.map((row) => {
              const tone = changeTone(row.change, row.direction);
              return (
                <div
                  key={row.label}
                  className={`relative col-span-4 grid grid-cols-subgrid items-center gap-0.5 border-b border-card-border/40 px-1 py-2 ${dashTextBody} last:border-0 dark:border-white/[0.045] ${
                    row.emphasis === "highlight"
                      ? "bg-emerald-50/50 dark:bg-transparent dark:bg-[linear-gradient(90deg,rgba(71,215,149,0.055),rgba(45,214,197,0.02))]"
                      : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full ${
                      row.emphasis === "warning"
                        ? "bg-amber-400/80 dark:bg-dash-orange/70"
                        : row.emphasis === "highlight"
                          ? "bg-emerald-400/80 dark:bg-gradient-to-b dark:from-[#5ee8df] dark:to-[#3bd49f]"
                          : "bg-transparent"
                    }`}
                  />
                  <span
                    className={`truncate ${row.emphasis === "highlight" ? "font-semibold text-sand-900 dark:text-[#eaf8f4]" : "text-sand-600 dark:text-[#a5bbcf]"}`}
                  >
                    {row.label}
                  </span>
                  <b className="whitespace-nowrap text-right font-bold tabular-nums text-sand-900 dark:text-dash-text">{row.current}</b>
                  <b className="whitespace-nowrap text-right font-bold tabular-nums text-sand-500 dark:text-[#a5bbcf]">{row.previous}</b>
                  <b
                    className={`text-right ${dashTextSecondaryLg} font-bold tabular-nums whitespace-nowrap ${
                      tone === "positive"
                        ? "text-emerald-600 dark:text-dash-green"
                        : tone === "negative"
                          ? "text-rose-600 dark:text-dash-red"
                          : "text-sand-400 dark:text-dash-text-muted"
                    }`}
                  >
                    {formatChange(row.change)}
                  </b>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className={`mt-auto flex shrink-0 items-center justify-between gap-2 border-t border-card-border/70 dark:border-white/[0.06] pt-2 ${dashTextBody} text-ink-600 dark:text-dash-teal`}>
        <span>Zum Monatsvergleich</span>
        <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}
