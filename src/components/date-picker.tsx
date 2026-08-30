"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from "@/components/icons";
import { dashInputClass as inputClass, dashSecondaryButtonClass as secondaryButtonClass } from "@/components/dashboard/dash-ui";
import { toIsoDateString, parseIsoDateString, formatDateDe } from "@/lib/date-format";

// Feinschliff Phase 6.2.2, Punkt 12/13: ersetzt das native <input type="date">
// in den Auftragsformularen. Der native Kalender liess sich im Dark Mode
// nicht zuverlaessig umstyled (browserabhaengiges, fremdwirkendes Popup) -
// bewusst eine kleine eigene Komponente statt einer externen Bibliothek, da
// hier nur ein einzelnes Datum je Feld benoetigt wird (kein Zeitraum, keine
// Uhrzeit). Speichert das Ergebnis weiterhin als reines "YYYY-MM-DD" ueber
// ein verstecktes <input type="hidden">, sodass die bestehende
// parseDateInput()-Logik in actions/orders.ts unveraendert bleibt.
const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_LABELS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function sameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// 42 Tage (6 Wochen) ab dem Montag der ersten Kalenderwoche des Monats -
// deckt jeden Monat vollstaendig ab, inkl. dezent abgeblendeter Tage aus dem
// Vor-/Folgemonat zur raeumlichen Orientierung.
function buildMonthGrid(monthDate: Date): Date[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7; // Montag = 0
  const start = new Date(year, month, 1 - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export function DatePicker({
  id,
  name,
  defaultValue,
}: {
  id?: string;
  name: string;
  defaultValue?: string | null;
}) {
  const initial = parseIsoDateString(defaultValue);
  const [selected, setSelected] = useState<Date | null>(initial);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(initial ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function openPanel() {
    setViewMonth(selected ?? new Date());
    setOpen(true);
  }

  function selectDay(day: Date) {
    setSelected(day);
    setOpen(false);
  }

  function clear() {
    setSelected(null);
    setOpen(false);
  }

  const grid = buildMonthGrid(viewMonth);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selected ? toIsoDateString(selected) : ""} />
      <button
        type="button"
        id={id}
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${inputClass} flex items-center justify-between gap-2 text-left`}
      >
        <span className={selected ? "" : "text-dash-text-faint"}>
          {selected ? formatDateDe(selected) : "TT.MM.JJJJ"}
        </span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-dash-text-faint" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Datum auswählen"
          className="absolute left-0 top-full z-30 mt-1 w-[280px] max-w-[calc(100vw-2rem)] rounded-xl border border-dash-line bg-dash-panel p-3 shadow-[0_18px_42px_rgba(0,0,0,0.34)]"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              aria-label="Vorheriger Monat"
              className="flex h-7 w-7 items-center justify-center rounded-full text-dash-text-secondary hover:bg-dash-panel-soft hover:text-dash-text transition-colors"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-semibold text-dash-text">
              {MONTH_LABELS_DE[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              aria-label="Nächster Monat"
              className="flex h-7 w-7 items-center justify-center rounded-full text-dash-text-secondary hover:bg-dash-panel-soft hover:text-dash-text transition-colors"
            >
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-dash-text-faint">
            {WEEKDAY_LABELS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((day, i) => {
              const inMonth = day.getMonth() === viewMonth.getMonth();
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = sameDay(day, today);
              const isSelected = sameDay(day, selected);
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => selectDay(day)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  className={`h-8 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? "bg-gradient-to-br from-dash-gold-deep to-dash-gold text-dash-panel"
                      : isToday
                        ? "ring-1 ring-inset ring-dash-gold/50 text-dash-text hover:bg-dash-panel-soft"
                        : "hover:bg-dash-panel-soft"
                  } ${
                    isSelected
                      ? ""
                      : !inMonth
                        ? "text-dash-text-faint/40"
                        : isWeekend
                          ? "text-dash-text-faint"
                          : "text-dash-text"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-end border-t border-dash-line pt-3">
            <button type="button" onClick={clear} className={`!px-3 !py-1.5 text-xs ${secondaryButtonClass}`}>
              Leeren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
