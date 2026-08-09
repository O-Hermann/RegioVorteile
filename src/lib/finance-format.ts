import { MONTH_LABELS_DE } from "@/lib/data-import";

// Reine, browser-sichere Formatierungshilfen fuer Finanzkennzahlen - bewusst
// OHNE "server-only" und OHNE Import aus dem generierten Prisma-Client
// (selbst ein reiner Typ-/Decimal-Import von dort zieht beim Client-Bundling
// Node-spezifischen Code hinein, den Turbopack nicht chunken kann), damit
// sowohl serverseitige Seiten (company-metrics.ts re-exportiert diese
// Funktionen) als auch Client-Komponenten (Chart, Rechnungstabelle) sie
// direkt importieren koennen. Geldwerte werden hier daher als "number oder
// Decimal-artiges Objekt" akzeptiert (Duck-Typing ueber toNumber()) statt den
// konkreten Prisma.Decimal-Typ zu referenzieren - die eigentliche
// Decimal-PRAEZISE Aggregation (Summenbildung) passiert ausschliesslich in
// company-metrics.ts, hier wird nur noch ein bereits fertig berechneter
// Wert fuer die Anzeige formatiert.

export type MonthPeriod = { periodMonth: number; periodYear: number };

export type MetricChange = { kind: "value"; percent: number } | { kind: "new" } | { kind: "none" };

type DecimalLike = { toNumber(): number };

function isDecimalLike(value: unknown): value is DecimalLike {
  return typeof value === "object" && value !== null && typeof (value as DecimalLike).toNumber === "function";
}

function toPlainNumber(value: number | DecimalLike): number {
  return typeof value === "number" ? value : value.toNumber();
}

export function formatEuroCompact(value: number | DecimalLike | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = isDecimalLike(value) ? value.toNumber() : toPlainNumber(value);
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(num);
}

export function formatEuroDetailed(value: number | DecimalLike | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const num = isDecimalLike(value) ? value.toNumber() : toPlainNumber(value);
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatChange(change: MetricChange | null | undefined): string {
  if (!change) return "—";
  if (change.kind === "none") return "Kein Vergleichswert";
  if (change.kind === "new") return "Neu";
  const formatted = new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(change.percent);
  return `${formatted} %`;
}

// Nicht jede Erhoehung ist positiv: bei offenen Forderungen ist ein
// Rueckgang die gute Richtung, bei Umsatz/Kunden ein Anstieg.
export function changeTone(change: MetricChange | null | undefined, direction: "up-good" | "down-good"): "positive" | "negative" | "neutral" {
  if (!change || change.kind === "none") return "neutral";
  if (change.kind === "new") return direction === "up-good" ? "positive" : "negative";
  if (change.percent === 0) return "neutral";
  const isIncrease = change.percent > 0;
  const isGood = direction === "up-good" ? isIncrease : !isIncrease;
  return isGood ? "positive" : "negative";
}

export function formatPercentShare(sharePercent: number): string {
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(sharePercent)} %`;
}

export function shortMonthLabel(period: MonthPeriod): string {
  const month = MONTH_LABELS_DE[period.periodMonth - 1]?.slice(0, 3) ?? String(period.periodMonth);
  return `${month} ${String(period.periodYear).slice(-2)}`;
}
