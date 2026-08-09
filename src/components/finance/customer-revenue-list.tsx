"use client";

import { useState } from "react";
import { formatEuroDetailed, formatPercentShare } from "@/lib/finance-format";
import { importSecondaryTextClass } from "@/lib/import-ui";

// Reine Anzeigekomponente - erhaelt bereits als Zahl aggregierte Betraege
// (nie Prisma.Decimal direkt, siehe Kommentar in revenue-line-chart.tsx).
export type CustomerRevenueView = { customer: string; revenue: number; sharePercent: number };

const INITIAL_VISIBLE = 5;

export function CustomerRevenueList({ customers }: { customers: CustomerRevenueView[] }) {
  const [showAll, setShowAll] = useState(false);

  if (customers.length === 0) {
    return <p className={`text-sm ${importSecondaryTextClass}`}>Für diesen Monat liegen keine Kundenumsätze vor.</p>;
  }

  const visible = showAll ? customers : customers.slice(0, INITIAL_VISIBLE);

  return (
    <div>
      <ul className="divide-y divide-card-border/60 dark:divide-white/5">
        {visible.map((c) => (
          <li key={c.customer} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="min-w-0 truncate font-medium text-sand-900 dark:text-cockpit-text" title={c.customer}>
              {c.customer}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="font-semibold text-sand-900 dark:text-cockpit-heading">{formatEuroDetailed(c.revenue)}</span>
              <span className={`text-xs ${importSecondaryTextClass}`}>{formatPercentShare(c.sharePercent)}</span>
            </span>
          </li>
        ))}
      </ul>
      {customers.length > INITIAL_VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 text-sm font-semibold text-ink-600 hover:text-ink-700 dark:text-cockpit-accent-light dark:hover:text-cockpit-accent"
        >
          {showAll ? "Weniger anzeigen" : `Alle anzeigen (${customers.length})`}
        </button>
      )}
    </div>
  );
}
