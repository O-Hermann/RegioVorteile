"use client";

import { useState } from "react";

export function MonthlyBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-3 sm:gap-5" style={{ height: "9rem" }}>
      {data.map((d, i) => {
        const pct = Math.max((d.count / max) * 100, d.count > 0 ? 6 : 2);
        const isHovered = hovered === i;
        return (
          <div
            key={d.label}
            className="flex flex-1 flex-col items-center justify-end h-full"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className={`mb-1 text-xs tabular-nums transition-colors ${
                isHovered ? "text-gold-600 font-semibold" : "text-sand-500"
              }`}
              title={`${d.count} Einlösungen`}
            >
              {d.count}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t-md transition-colors duration-200 ${
                  isHovered ? "bg-gold-400" : "bg-gold-500"
                } ${d.count === 0 ? "opacity-30" : ""}`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="mt-2 text-xs font-medium text-sand-600">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
