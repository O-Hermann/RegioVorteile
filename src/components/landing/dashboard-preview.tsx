import { TrendingUpIcon } from "@/components/icons";

const KPI_TILES = [
  { label: "Umsatz", value: "128.400 €", delta: "+3,1 %", positive: true },
  { label: "Rohertrag", value: "41.200 €", delta: "-4,2 %", positive: false },
  { label: "Personalkostenquote", value: "34 %", delta: "+1,4 Pp.", positive: false },
];

const CHART_BARS = [55, 62, 48, 70, 65, 58, 74];

export function DashboardPreview() {
  return (
    <div className="rounded-2xl border border-petrol-100 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-lg shadow-petrol-900/5 dark:shadow-[0_0_40px_-12px_rgba(34,211,238,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-white/20" />
        </div>
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-500">Juli 2026</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {KPI_TILES.map((tile) => (
          <div key={tile.label} className="rounded-lg bg-petrol-50 dark:bg-white/5 p-3">
            <p className="text-[10px] text-slate-500 dark:text-slate-500">{tile.label}</p>
            <p className="mt-0.5 font-display text-base font-bold text-slate-900 dark:text-white">
              {tile.value}
            </p>
            <p
              className={`text-[10px] font-semibold ${
                tile.positive ? "text-petrol-700 dark:text-cyan-300" : "text-red-600 dark:text-red-400"
              }`}
            >
              {tile.delta} ggü. Vormonat
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex h-14 items-end gap-1.5">
        {CHART_BARS.map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-petrol-700 dark:bg-cyan-400" style={{ height: `${h}%` }} />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-petrol-200 dark:border-cyan-400/30 bg-petrol-50 dark:bg-cyan-500/10 p-3.5">
        <div className="flex items-start gap-2.5">
          <TrendingUpIcon className="mt-0.5 h-4 w-4 shrink-0 text-petrol-700 dark:text-cyan-300" />
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
            Ihr Rohertrag ist im Juli um <strong>4,2 %</strong> gesunken – hauptsächlich
            durch gestiegene Materialkosten im Einkauf. Empfehlung: Lieferantenkonditionen
            prüfen.
          </p>
        </div>
      </div>
    </div>
  );
}
