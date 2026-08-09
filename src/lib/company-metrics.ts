import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Zentrale, serverseitige Aggregationsschicht fuer Phase 5.1 (Punkt 13):
// UI-Komponenten stellen ausschliesslich die hier berechneten Werte dar,
// keine Kennzahlenlogik direkt in Komponenten. Grundsatz: nur Werte, die sich
// eindeutig und nachvollziehbar aus tatsaechlich PROCESSED-Importen und deren
// strukturierten DataImportRecord-Zeilen ergeben - niemals aus der
// Originaldatei/Vorschau, niemals geschaetzt.

export type MonthPeriod = { periodMonth: number; periodYear: number };

export type MetricChange = { kind: "value"; percent: number } | { kind: "new" } | { kind: "none" };

export type CompanyMetrics = {
  currentPeriod: MonthPeriod | null;
  previousPeriod: MonthPeriod | null;
  importedMonthCount: number;
  openImportErrorCount: number;

  revenueCurrent: Prisma.Decimal | null;
  revenuePrevious: Prisma.Decimal | null;
  revenueChange: MetricChange | null;

  openReceivablesCurrent: Prisma.Decimal | null;
  openReceivablesPrevious: Prisma.Decimal | null;
  openReceivablesChange: MetricChange | null;

  customersWithRevenueCurrent: number | null;
  customersWithRevenuePrevious: number | null;
  customersWithRevenueChange: MetricChange | null;

  // Umsatz je verarbeitetem FINANCE-Monat, chronologisch aufsteigend - fuer
  // die "Entwicklung"-Sparkline (Punkt 10).
  revenueHistory: { period: MonthPeriod; revenue: Prisma.Decimal }[];
};

type FinanceRecordRow = {
  referenceNumber: string | null;
  name: string | null;
  status: string | null;
  netAmount: Prisma.Decimal | null;
  grossAmount: Prisma.Decimal | null;
  dataImport: { periodMonth: number; periodYear: number; processedAt: Date | null };
};

function periodKey(p: MonthPeriod): string {
  return `${p.periodYear}-${String(p.periodMonth).padStart(2, "0")}`;
}

// Sortiert absteigend (neuester Zeitraum zuerst) - rein nach tatsaechlich
// vorhandenen Perioden, NICHT nach "aktueller Kalendermonat minus 1" (Punkt 2).
function comparePeriodsDesc(a: MonthPeriod, b: MonthPeriod): number {
  if (a.periodYear !== b.periodYear) return b.periodYear - a.periodYear;
  return b.periodMonth - a.periodMonth;
}

// Dedupliziert Datensaetze eines Monats anhand der Referenz-/Rechnungsnummer
// (Punkt 15): dieselbe Rechnung darf nicht mehrfach in eine Kennzahl
// einfliessen, falls z.B. dieselbe Datei versehentlich als zweiter, separater
// Import verarbeitet wurde. Datensaetze ohne (leere) Referenznummer koennen
// nicht eindeutig identifiziert werden und werden deshalb bewusst NICHT
// zusammengefuehrt (konservativ - keine riskante automatische Zusammenlegung,
// siehe Kommentar in der Spezifikation). Bei doppelter Referenznummer bleibt
// der zuerst verarbeitete Datensatz erhalten (stabile, nachvollziehbare Regel).
function dedupeByReference(rows: FinanceRecordRow[]): FinanceRecordRow[] {
  const sorted = [...rows].sort((a, b) => {
    const at = a.dataImport.processedAt?.getTime() ?? 0;
    const bt = b.dataImport.processedAt?.getTime() ?? 0;
    return at - bt;
  });
  const seenReferences = new Set<string>();
  const result: FinanceRecordRow[] = [];
  for (const row of sorted) {
    const ref = row.referenceNumber?.trim();
    if (!ref) {
      result.push(row);
      continue;
    }
    const key = ref.toLowerCase();
    if (seenReferences.has(key)) continue;
    seenReferences.add(key);
    result.push(row);
  }
  return result;
}

function normalizeCustomerName(name: string): string {
  return name.trim().toLowerCase();
}

function sumDecimal(values: (Prisma.Decimal | null)[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>((sum, v) => (v ? sum.plus(v) : sum), new Prisma.Decimal(0));
}

// Punkt 9: robuste Prozentberechnung ohne Division durch 0. Vorheriger Wert
// 0 und aktueller Wert > 0 => "Neu" (es gibt jetzt erstmals einen Wert, wo
// vorher keiner war). Beide 0 => "Kein Vergleichswert" (nichts veraendert
// sich, ein Prozentwert waere bedeutungslos).
export function computeChange(current: Prisma.Decimal | number, previous: Prisma.Decimal | number): MetricChange {
  const c = new Prisma.Decimal(current);
  const p = new Prisma.Decimal(previous);
  if (p.isZero()) {
    return c.isZero() ? { kind: "none" } : { kind: "new" };
  }
  return { kind: "value", percent: c.minus(p).dividedBy(p).times(100).toNumber() };
}

function computeMonthMetrics(rows: FinanceRecordRow[]) {
  const deduped = dedupeByReference(rows);
  // Punkt 3: stornierte Datensaetze zaehlen nicht zum Umsatz.
  const nonCanceled = deduped.filter((r) => r.status !== "CANCELED");
  const revenue = sumDecimal(nonCanceled.map((r) => r.netAmount));
  // Punkt 4: offene Forderungen = Bruttobetrag nur bei OPEN/OVERDUE.
  // PARTIALLY_PAID wird bewusst NICHT als voller Bruttobetrag gezaehlt, da
  // kein gemapptes Feld fuer den tatsaechlichen offenen Restbetrag existiert.
  const openReceivables = sumDecimal(
    deduped.filter((r) => r.status === "OPEN" || r.status === "OVERDUE").map((r) => r.grossAmount),
  );
  // Punkt 5: eindeutige, nicht stornierte Kunden - Normalisierung nur
  // trim + Kleinschreibung, keine unsichere Fuzzy-Zusammenfuehrung.
  const customers = new Set(
    nonCanceled
      .map((r) => r.name?.trim())
      .filter((n): n is string => !!n)
      .map(normalizeCustomerName),
  );
  return { revenue, openReceivables, customerCount: customers.size };
}

export async function getCompanyMetrics(companyId: string): Promise<CompanyMetrics> {
  const [financeRecords, importedMonthGroups, openImportErrorCount] = await Promise.all([
    // Ausschliesslich Records aus PROCESSED FINANCE-Importen - nie aus der
    // Originaldatei/Vorschau, nie aus nicht abgeschlossenen Imports.
    prisma.dataImportRecord.findMany({
      where: { companyId, dataImport: { status: "PROCESSED", category: "FINANCE" } },
      select: {
        referenceNumber: true,
        name: true,
        status: true,
        netAmount: true,
        grossAmount: true,
        dataImport: { select: { periodMonth: true, periodYear: true, processedAt: true } },
      },
    }),
    // "Importierte Monate" bleibt kategorieunabhaengig (Punkt 7) - unveraendert
    // gegenueber Phase 4, hier nur zentralisiert statt inline in der Seite.
    prisma.dataImport.groupBy({ by: ["periodMonth", "periodYear"], where: { companyId, status: "PROCESSED" } }),
    prisma.dataImport.count({ where: { companyId, status: { in: ["FAILED", "VALIDATION_FAILED"] } } }),
  ]);

  const byPeriod = new Map<string, FinanceRecordRow[]>();
  for (const r of financeRecords) {
    const key = periodKey(r.dataImport);
    const list = byPeriod.get(key);
    if (list) list.push(r);
    else byPeriod.set(key, [r]);
  }

  const financePeriods = [...byPeriod.values()]
    .map((rows) => ({ period: { periodYear: rows[0].dataImport.periodYear, periodMonth: rows[0].dataImport.periodMonth }, rows }))
    .sort((a, b) => comparePeriodsDesc(a.period, b.period));

  const currentPeriod = financePeriods[0]?.period ?? null;
  const previousPeriod = financePeriods[1]?.period ?? null;
  const currentMetrics = financePeriods[0] ? computeMonthMetrics(financePeriods[0].rows) : null;
  const previousMetrics = financePeriods[1] ? computeMonthMetrics(financePeriods[1].rows) : null;

  const revenueHistory = [...financePeriods]
    .sort((a, b) => comparePeriodsDesc(b.period, a.period)) // aufsteigend
    .map(({ period, rows }) => ({ period, revenue: computeMonthMetrics(rows).revenue }));

  return {
    currentPeriod,
    previousPeriod,
    importedMonthCount: importedMonthGroups.length,
    openImportErrorCount,

    revenueCurrent: currentMetrics?.revenue ?? null,
    revenuePrevious: previousMetrics?.revenue ?? null,
    revenueChange: currentMetrics && previousMetrics ? computeChange(currentMetrics.revenue, previousMetrics.revenue) : null,

    openReceivablesCurrent: currentMetrics?.openReceivables ?? null,
    openReceivablesPrevious: previousMetrics?.openReceivables ?? null,
    openReceivablesChange:
      currentMetrics && previousMetrics ? computeChange(currentMetrics.openReceivables, previousMetrics.openReceivables) : null,

    customersWithRevenueCurrent: currentMetrics?.customerCount ?? null,
    customersWithRevenuePrevious: previousMetrics?.customerCount ?? null,
    customersWithRevenueChange:
      currentMetrics && previousMetrics
        ? computeChange(currentMetrics.customerCount, previousMetrics.customerCount)
        : null,

    revenueHistory,
  };
}

export function formatEuroCompact(value: Prisma.Decimal | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value.toNumber());
}

export function formatEuroDetailed(value: Prisma.Decimal | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value.toNumber());
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

// Nicht jede Erhoehung ist positiv (Punkt 8/9): bei offenen Forderungen ist
// ein Rueckgang die gute Richtung, bei Umsatz/Kunden ein Anstieg.
export function changeTone(change: MetricChange | null | undefined, direction: "up-good" | "down-good"): "positive" | "negative" | "neutral" {
  if (!change || change.kind === "none") return "neutral";
  if (change.kind === "new") return direction === "up-good" ? "positive" : "negative";
  if (change.percent === 0) return "neutral";
  const isIncrease = change.percent > 0;
  const isGood = direction === "up-good" ? isIncrease : !isIncrease;
  return isGood ? "positive" : "negative";
}
