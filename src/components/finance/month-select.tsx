"use client";

import { useRouter } from "next/navigation";
import { periodLabel } from "@/lib/data-import";
import { monthParamValue, type MonthPeriod } from "@/lib/finance-format";

// Ersetzt die fruehere Kombination aus grossem Monats-Label + Pill-Button-
// Reihe (Phase 5.2) durch eine einzelne, skalierbare Auswahl (Phase 5.2.1,
// Punkt 9) - bleibt bewusst bei der bestehenden Server-Component-Navigation
// (?month=YYYY-MM via URL), kein Client-State-Paralleluniversum: die Auswahl
// stoesst nur eine Navigation an, das eigentliche Rendering bleibt serverseitig.
export function MonthSelect({
  availableMonths,
  selectedPeriod,
}: {
  availableMonths: MonthPeriod[];
  selectedPeriod: MonthPeriod;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-end gap-1.5">
      <label
        htmlFor="finance-month-select"
        className="text-[11px] font-semibold uppercase tracking-wide text-sand-400 dark:text-cockpit-text-weak"
      >
        Zeitraum
      </label>
      <select
        id="finance-month-select"
        value={monthParamValue(selectedPeriod)}
        onChange={(e) => router.push(`?month=${e.target.value}`)}
        className="min-w-[180px] rounded-lg border border-card-border bg-card px-3.5 py-2 text-sm font-semibold text-sand-900 shadow-sm transition-colors hover:border-ink-300 focus:border-ink-500 focus:outline-none focus:ring-2 focus:ring-ink-500/40 dark:border-white/10 dark:bg-white/5 dark:text-cockpit-text dark:hover:border-cockpit-accent-light/50 dark:focus:border-cockpit-accent-light dark:focus:ring-cockpit-accent-light/30"
      >
        {availableMonths.map((m) => (
          <option key={monthParamValue(m)} value={monthParamValue(m)}>
            {periodLabel(m.periodMonth, m.periodYear)}
          </option>
        ))}
      </select>
    </div>
  );
}
