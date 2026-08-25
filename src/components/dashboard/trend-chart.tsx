import Link from "next/link";
import { TrendingUpIcon } from "@/components/icons";
import { formatEuroCompact, formatChange, changeTone, shortMonthLabel, type MetricChange, type MonthPeriod } from "@/lib/company-metrics";
import type { Prisma } from "@/generated/prisma/client";
import {
  dashTextTitle,
  dashTextBody,
  dashTextBodyLg,
  dashTextSectionHeading,
  dashTextSecondary,
  dashTextSecondarySm,
} from "@/components/dashboard/dash-ui";

// "Entwicklung"-Karte, optisch 1:1 der V12-".trend-card" (Flaechendiagramm
// mit Gradient-Fuellung, hervorgehobenem letzten Punkt mit Halo, Achsen-
// beschriftung). Zeigt die echte Umsatzhistorie (dieselbe Datengrundlage wie
// die bisherige RevenueSparkline) statt der Demo-Reihe "Erkannt/Bestaetigt/
// Zurueckgeholt" aus der Referenz - dafuer existiert kein echtes Datenmodell.
export function TrendChart({ history }: { history: { period: MonthPeriod; revenue: Prisma.Decimal }[] }) {
  const hasData = history.length >= 2;
  const values = history.map((h) => h.revenue.toNumber());
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const width = 360;
  const height = 108;
  const padY = 8;
  const stepX = history.length > 1 ? width / (history.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - padY - ((v - min) / range) * (height - padY * 2);
    return [x, y] as [number, number];
  });
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath = hasData
    ? `${linePath} L${points[points.length - 1][0].toFixed(1)} ${height} L${points[0][0].toFixed(1)} ${height} Z`
    : "";
  const last = history[history.length - 1];
  const first = history[0];
  const lastPoint = points[points.length - 1];

  const current = last?.revenue;
  const change: MetricChange | null =
    history.length >= 2
      ? { kind: "value", percent: first.revenue.toNumber() === 0 ? 0 : ((last.revenue.toNumber() - first.revenue.toNumber()) / Math.abs(first.revenue.toNumber())) * 100 }
      : null;
  const tone = changeTone(change, "up-good");

  return (
    <Link
      href="/arbeitgeber/dashboard/entwicklung"
      className="group flex min-h-0 flex-col overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-3.5 shadow-warm-sm transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-ink-400 dark:hover:border-[rgba(71,119,156,0.78)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_15px_34px_rgba(0,0,0,0.18)]"
    >
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div className={`flex items-center gap-2 ${dashTextTitle} font-extrabold text-sand-900 dark:text-dash-text`}>
          <span className="flex h-[27px] w-[27px] items-center justify-center rounded-[9px] text-ink-700 dark:text-dash-teal bg-ink-400/15 dark:bg-transparent dark:bg-[linear-gradient(180deg,rgba(37,216,206,0.14),rgba(37,216,206,0.07))] border border-ink-400/25 dark:border-[rgba(37,216,206,0.14)]">
            <TrendingUpIcon className="h-3.5 w-3.5" />
          </span>
          Entwicklung
        </div>
        {hasData && (
          <div className="text-right leading-tight">
            <p className={`${dashTextSecondarySm} uppercase tracking-wide text-sand-400 dark:text-[#7897af]`}>Aktuell</p>
            <p className={`${dashTextSectionHeading} font-extrabold tabular-nums text-ink-700 dark:text-[#68eee6]`}>{formatEuroCompact(current!)}</p>
            <p
              className={`${dashTextSecondarySm} font-bold tabular-nums ${tone === "positive" ? "text-emerald-600 dark:text-[#68dca7]" : tone === "negative" ? "text-rose-600 dark:text-dash-red" : "text-sand-400 dark:text-dash-text-muted"}`}
            >
              {formatChange(change)}
            </p>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex flex-1 min-h-0 items-center justify-center text-center">
          <p className={`${dashTextBodyLg} leading-snug text-sand-500 dark:text-dash-text-secondary`}>
            Nach dem ersten Datenimport wird hier die Unternehmensentwicklung dargestellt.
          </p>
        </div>
      ) : (
        <>
          <p className={`mb-1 mt-1 ${dashTextSecondary} text-sand-500 dark:text-[#92abc4]`}>
            Umsatz · letzte {history.length} {history.length === 1 ? "Monat" : "Monate"}
          </p>
          <div className="min-h-[94px] flex-1 overflow-hidden rounded-[10px] border border-card-border/60 dark:border-[rgba(68,103,133,0.12)] dark:bg-[linear-gradient(180deg,rgba(6,24,43,0.20),rgba(6,24,43,0.02))]">
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="dashTrendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-line-color)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--chart-line-color)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g stroke="currentColor" strokeWidth="1" className="text-sand-200 dark:text-white/[0.06]">
                <path d={`M0 ${height * 0.15}h${width}M0 ${height * 0.5}h${width}M0 ${height * 0.85}h${width}`} />
              </g>
              <path d={areaPath} fill="url(#dashTrendArea)" />
              <path
                d={linePath}
                fill="none"
                stroke="var(--chart-line-color)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.slice(0, -1).map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="2.3" style={{ fill: "var(--chart-point-color)" }} fillOpacity="0.85" />
              ))}
              {lastPoint && (
                <>
                  <circle cx={lastPoint[0]} cy={lastPoint[1]} r="6.5" style={{ fill: "var(--chart-line-color)" }} fillOpacity="0.16" />
                  <circle cx={lastPoint[0]} cy={lastPoint[1]} r="3.2" style={{ fill: "var(--chart-point-color)" }} stroke="var(--chart-line-color)" strokeWidth="1.2" />
                </>
              )}
            </svg>
          </div>
          <div className="mt-1 flex justify-between text-[8px] text-sand-400 dark:text-[#6685a2]">
            {history.map((h, i) => (
              <span
                key={i}
                className={i === history.length - 1 ? "font-bold text-ink-600 dark:text-[#6fe9e2]" : ""}
              >
                {shortMonthLabel(h.period)}
              </span>
            ))}
          </div>
        </>
      )}

      <div className={`mt-2 flex shrink-0 items-center justify-between gap-2 border-t border-card-border/70 dark:border-white/[0.06] pt-2 ${dashTextBody} text-ink-600 dark:text-dash-teal`}>
        <span>Trend anzeigen</span>
        <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}
