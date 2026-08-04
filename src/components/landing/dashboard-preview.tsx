import { TrendingUpIcon } from "@/components/icons";

const KPI_TILES = [
  { label: "Umsatz", value: "128.400 €", delta: "-8,2 %", positive: false },
  { label: "Ergebnis", value: "22.900 €", delta: "-3,6 %", positive: false },
  { label: "Offene Aufträge", value: "34", delta: "-12", positive: false },
];

const CHART_BARS = [55, 62, 48, 70, 65, 58, 74];

export function DashboardPreview() {
  return (
    <div className="rounded-2xl border border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-card p-5 sm:p-6 shadow-lg shadow-petrol-900/5 dark:shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-cockpit-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-cockpit-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-cockpit-border" />
        </div>
        <span className="text-[10px] font-medium text-slate-500 dark:text-cockpit-text-weak">Juli 2026</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {KPI_TILES.map((tile) => (
          <div key={tile.label} className="rounded-lg bg-petrol-50 dark:bg-cockpit-card-dark p-3">
            <p className="text-[10px] text-slate-500 dark:text-cockpit-text-weak">{tile.label}</p>
            <p className="mt-0.5 font-display text-base font-bold text-slate-900 dark:text-cockpit-heading">
              {tile.value}
            </p>
            <p
              className={`text-[10px] font-semibold ${
                tile.positive ? "text-petrol-700 dark:text-cockpit-positive" : "text-red-600 dark:text-cockpit-negative"
              }`}
            >
              {tile.delta} ggü. Vormonat
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex h-14 items-end gap-1.5">
        {CHART_BARS.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t bg-petrol-700 ${
              i === CHART_BARS.length - 1 ? "dark:bg-cockpit-bar-highlight" : "dark:bg-cockpit-bar"
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-petrol-200 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-accent-subtle p-3.5">
        <div className="flex items-start gap-2.5">
          <TrendingUpIcon className="mt-0.5 h-4 w-4 shrink-0 text-petrol-700 dark:text-cockpit-accent-light" />
          <p className="text-xs leading-relaxed text-slate-700 dark:text-cockpit-text">
            Der Umsatz liegt <strong>8,2 %</strong> unter dem Vormonat. Gleichzeitig
            wurden <strong>12 Aufträge</strong> weniger abgeschlossen.
          </p>
        </div>
      </div>
    </div>
  );
}
