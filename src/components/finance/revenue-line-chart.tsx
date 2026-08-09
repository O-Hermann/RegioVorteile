"use client";

import { useState } from "react";
import { formatEuroDetailed, shortMonthLabel, type MonthPeriod } from "@/lib/finance-format";

// Reine Anzeigekomponente: erhaelt bereits als Zahl aggregierte Werte (nie
// Prisma.Decimal direkt - Decimal-Instanzen lassen sich nicht ueber die
// Server/Client-Grenze serialisieren, siehe Aufrufer in page.tsx).
export type RevenueHistoryPoint = { period: MonthPeriod; revenue: number };

const WIDTH = 640;
const HEIGHT = 220;
const PAD_X = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 34;

export function RevenueLineChart({
  history,
  selectedPeriod,
}: {
  history: RevenueHistoryPoint[];
  selectedPeriod?: MonthPeriod | null;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const values = history.map((h) => h.revenue);
  const min = Math.min(0, ...values);
  const max = Math.max(...values, 0);
  const range = max - min || 1;
  const innerWidth = WIDTH - PAD_X * 2;
  const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = history.length > 1 ? innerWidth / (history.length - 1) : 0;
  const points = values.map((v, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_TOP + innerHeight - ((v - min) / range) * innerHeight,
  }));
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const baselineY = PAD_TOP + innerHeight;
  const gridLines = [0, 0.5, 1].map((f) => PAD_TOP + innerHeight * f);

  if (history.length === 0) return null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Umsatzentwicklung">
        <defs>
          <linearGradient id="financeRevenueLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5eead4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="financeRevenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e9794" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1e9794" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((y, i) => (
          <line
            key={i}
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={y}
            y2={y}
            className="stroke-card-border dark:stroke-white/10"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}

        {points.length > 1 && (
          <polygon points={`${points[0].x},${baselineY} ${polylinePoints} ${points[points.length - 1].x},${baselineY}`} fill="url(#financeRevenueFill)" />
        )}

        <polyline
          points={polylinePoints}
          fill="none"
          stroke="url(#financeRevenueLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => {
          const isSelected =
            !!selectedPeriod &&
            history[i].period.periodMonth === selectedPeriod.periodMonth &&
            history[i].period.periodYear === selectedPeriod.periodYear;
          const isActive = hoverIndex === i;
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 6 : isSelected ? 5 : 3.5}
                fill={isSelected ? "#99f6e4" : "#5eead4"}
                fillOpacity={isActive ? 1 : 0.85}
                stroke={isSelected ? "#087a78" : "none"}
                strokeWidth={isSelected ? 2 : 0}
                className="transition-all duration-150"
              />
              {/* groesseres, unsichtbares Hit-Target fuer entspanntes Hovern */}
              <circle
                cx={p.x}
                cy={p.y}
                r={14}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          );
        })}

        {points.map((p, i) => (
          <text key={i} x={p.x} y={HEIGHT - 10} textAnchor="middle" className="fill-sand-500 dark:fill-cockpit-text-weak" fontSize="11">
            {shortMonthLabel(history[i].period)}
          </text>
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-card-border bg-card px-3 py-2 text-xs shadow-warm dark:border-white/10 dark:bg-cockpit-card dark:shadow-black/40"
          style={{
            left: `${(points[hoverIndex].x / WIDTH) * 100}%`,
            top: `${(points[hoverIndex].y / HEIGHT) * 100}%`,
            marginTop: -10,
          }}
        >
          <p className="whitespace-nowrap font-semibold text-sand-900 dark:text-cockpit-heading">
            {shortMonthLabel(history[hoverIndex].period)}
          </p>
          <p className="whitespace-nowrap text-sand-600 dark:text-cockpit-text-secondary">
            {formatEuroDetailed(history[hoverIndex].revenue)}
          </p>
        </div>
      )}
    </div>
  );
}
