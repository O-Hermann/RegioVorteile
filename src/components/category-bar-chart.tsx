"use client";

import { useState } from "react";

export function CategoryBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = Math.max((d.count / max) * 100, 4);
        const isHovered = hovered === d.label;
        return (
          <div
            key={d.label}
            onMouseEnter={() => setHovered(d.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-sand-800">{d.label}</span>
              <span className="tabular-nums text-sand-500" title={`${d.count} eingelöst`}>
                {d.count}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-sand-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isHovered ? "bg-gold-400" : "bg-gold-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
