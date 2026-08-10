"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { periodLabel } from "@/lib/data-import";
import { monthParamValue, type MonthPeriod } from "@/lib/finance-format";
import { ChevronDownIcon, CheckIcon } from "@/components/icons";

// Ersetzt die fruehere Kombination aus grossem Monats-Label + Pill-Button-
// Reihe (Phase 5.2) durch eine einzelne, skalierbare Auswahl (Phase 5.2.1,
// Punkt 9) - bleibt bewusst bei der bestehenden Server-Component-Navigation
// (?month=YYYY-MM via URL), kein Client-State-Paralleluniversum: die Auswahl
// stoesst nur eine Navigation an, das eigentliche Rendering bleibt serverseitig.
//
// Feinschliff Teil F: eigene Listbox statt natives <select> - im Dark Mode
// oeffnete der Browser sonst eine helle, themenfremde native Auswahlliste.
// Bewusst "aria-activedescendant"-Muster: der DOM-Fokus bleibt IMMER auf dem
// Button, nur die Markierung wandert visuell/semantisch durch die Liste.
// Ein fruehrerer Versuch, den Fokus per Effekt tatsaechlich auf die <ul> zu
// verschieben, fuehrte zu einem Race Condition zwischen dem Oeffnen-Klick und
// einem sehr schnell folgenden Pfeiltasten-Druck (die Taste kam dann noch
// beim Button an, bevor der Fokus-Effekt gefeuert hatte). Alle Tasten werden
// deshalb zentral im Button gehandhabt, kein zweiter Listener auf der Liste.
function sameMonth(a: MonthPeriod, b: MonthPeriod): boolean {
  return a.periodMonth === b.periodMonth && a.periodYear === b.periodYear;
}

export function MonthSelect({
  availableMonths,
  selectedPeriod,
}: {
  availableMonths: MonthPeriod[];
  selectedPeriod: MonthPeriod;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => {
    const i = availableMonths.findIndex((m) => sameMonth(m, selectedPeriod));
    return i >= 0 ? i : 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      listRef.current?.querySelector<HTMLLIElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function selectMonth(m: MonthPeriod) {
    setOpen(false);
    router.push(`?month=${monthParamValue(m)}`);
  }

  function onButtonKeyDown(event: ReactKeyboardEvent) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, availableMonths.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectMonth(availableMonths[activeIndex]);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(availableMonths.length - 1);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex flex-col items-end gap-1.5">
      <label
        htmlFor="finance-month-select"
        className="text-[11px] font-semibold uppercase tracking-wide text-sand-500 dark:text-cockpit-text-weak"
      >
        Zeitraum
      </label>
      <button
        id="finance-month-select"
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="finance-month-listbox"
        aria-activedescendant={open ? `finance-month-option-${activeIndex}` : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        className="flex min-w-[180px] items-center justify-between gap-2 rounded-lg border border-card-border bg-card px-3.5 py-2 text-sm font-semibold text-sand-900 shadow-warm-sm transition-colors hover:border-ink-400 focus:border-ink-500 focus:outline-none focus:ring-2 focus:ring-ink-500/40 dark:border-white/10 dark:bg-white/5 dark:text-cockpit-text dark:hover:border-cockpit-accent-light/50 dark:focus:border-cockpit-accent-light dark:focus:ring-cockpit-accent-light/30"
      >
        {periodLabel(selectedPeriod.periodMonth, selectedPeriod.periodYear)}
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-sand-400 transition-transform dark:text-cockpit-text-weak ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          id="finance-month-listbox"
          ref={listRef}
          role="listbox"
          className="absolute right-0 top-full z-30 mt-1 max-h-72 w-full min-w-[180px] overflow-y-auto rounded-lg border border-card-border bg-card py-1 shadow-warm-lg dark:border-white/10 dark:bg-cockpit-card dark:shadow-2xl dark:shadow-black/40"
        >
          {availableMonths.map((m, i) => {
            const active = sameMonth(m, selectedPeriod);
            const highlighted = i === activeIndex;
            return (
              <li
                key={monthParamValue(m)}
                id={`finance-month-option-${i}`}
                data-index={i}
                role="option"
                aria-selected={active}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => selectMonth(m)}
                className={`flex cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-sm transition-colors ${
                  highlighted ? "bg-ink-50 dark:bg-white/5" : ""
                } ${active ? "font-semibold text-ink-700 dark:text-cockpit-accent-light" : "text-sand-800 dark:text-cockpit-text"}`}
              >
                {periodLabel(m.periodMonth, m.periodYear)}
                {active && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-ink-600 dark:text-cockpit-accent-light" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
