// Gemeinsame Datumsformat-Helfer fuer den neuen DatePicker (Phase 6.2.2,
// Punkt 12/13) - bewusst in einer eigenen, NICHT "use client"-markierten
// Datei, damit sowohl Server-Komponenten (defaultValue-Aufbereitung) als
// auch die Client-Komponente DatePicker dieselbe Logik verwenden koennen.
// Alle Funktionen arbeiten konsequent mit lokaler Mitternacht (kein UTC-
// Versatz), exakt wie die bestehende parseDateInput() in actions/orders.ts.

export function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDateString(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateDe(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}
