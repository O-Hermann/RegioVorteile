import { TrendingUpIcon } from "@/components/icons";

const KPI_TILES = [
  { label: "Umsatz", value: "128.400 €", delta: "-8,2 %" },
  { label: "Ergebnis", value: "22.900 €", delta: "-3,6 %" },
  { label: "Offene Aufträge", value: "34", delta: "-12" },
];

const CHART_BARS = [55, 62, 48, 70, 65, 58, 74];

export function DashboardPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-petrol-100 dark:border-white/10 bg-white dark:bg-gradient-to-b dark:from-cockpit-card dark:to-cockpit-card-dark p-5 sm:p-6 shadow-lg shadow-petrol-900/5 dark:shadow-xl dark:shadow-black/30">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 hidden h-40 w-40 rounded-full bg-cockpit-accent-light/10 blur-3xl dark:block" />

      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-cockpit-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-cockpit-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-cockpit-border" />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-cockpit-text-secondary">Juli 2026</span>
      </div>

      <div className="relative grid grid-cols-3 gap-2.5">
        {KPI_TILES.map((tile) => (
          <div
            key={tile.label}
            className="rounded-xl border border-petrol-100 dark:border-white/10 bg-petrol-50 dark:bg-cockpit-card-dark p-3"
          >
            <p className="text-[11px] text-slate-500 dark:text-cockpit-text-secondary">{tile.label}</p>
            <p className="mt-1 font-display text-lg font-extrabold leading-none text-slate-900 dark:text-cockpit-heading">
              {tile.value}
            </p>
            <span className="mt-1.5 inline-flex rounded-full bg-red-50 dark:bg-cockpit-negative/15 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-cockpit-negative">
              {tile.delta} ggü. Vormonat
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-4 flex h-16 items-end gap-1.5 rounded-xl bg-petrol-50/60 dark:bg-cockpit-card-dark/60 p-2.5">
        {CHART_BARS.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-md bg-gradient-to-t from-petrol-700 to-petrol-500 ${
              i === CHART_BARS.length - 1
                ? "dark:from-cockpit-bar-highlight dark:to-cockpit-accent-light"
                : "dark:from-cockpit-bar dark:to-cockpit-bar-highlight/60"
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <div className="relative mt-4 rounded-xl border border-petrol-200 dark:border-cockpit-accent-light/20 bg-petrol-50 dark:bg-cockpit-accent-subtle p-3.5 dark:shadow-lg dark:shadow-cockpit-accent/10">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-petrol-700/10 dark:bg-cockpit-accent-light/20 text-petrol-700 dark:text-cockpit-accent-light">
            <TrendingUpIcon className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-cockpit-text">
            Der Umsatz liegt <strong>8,2 %</strong> unter dem Vormonat. Gleichzeitig
            wurden <strong>12 Aufträge</strong> weniger abgeschlossen.
          </p>
        </div>
      </div>
    </div>
  );
}
