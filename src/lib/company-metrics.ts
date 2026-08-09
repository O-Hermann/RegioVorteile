import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { MonthPeriod, MetricChange } from "@/lib/finance-format";

// Zentrale, serverseitige Aggregationsschicht fuer Phase 5.1/5.2 (Punkt 13):
// UI-Komponenten stellen ausschliesslich die hier berechneten Werte dar,
// keine Kennzahlenlogik direkt in Komponenten. Grundsatz: nur Werte, die sich
// eindeutig und nachvollziehbar aus tatsaechlich PROCESSED-Importen und deren
// strukturierten DataImportRecord-Zeilen ergeben - niemals aus der
// Originaldatei/Vorschau, niemals geschaetzt.
//
// Reine Formatierungshilfen (formatEuro*, formatChange, ...) leben in
// lib/finance-format.ts (kein "server-only", kein Prisma-Import), damit
// Client-Komponenten (Chart, Rechnungstabelle) sie direkt importieren
// koennen - ein Named-Import aus DIESEM Modul wuerde in einer Client-
// Komponente immer am "server-only"-Guard scheitern, unabhaengig davon,
// welcher konkrete Export genutzt wird. Hier werden sie fuer bestehende
// serverseitige Importe (Dashboard) unveraendert weiter re-exportiert.
// computeChange bleibt bewusst HIER (nicht in finance-format.ts): es
// rechnet praezise mit Prisma.Decimal und wird ausschliesslich serverseitig
// aufgerufen.
export { formatEuroCompact, formatEuroDetailed, formatChange, changeTone, formatPercentShare, shortMonthLabel } from "@/lib/finance-format";
export type { MonthPeriod, MetricChange } from "@/lib/finance-format";

// Punkt 9 (Phase 5.1): robuste Prozentberechnung ohne Division durch 0.
// Vorheriger Wert 0 und aktueller Wert > 0 => "Neu". Beide 0 => "Kein
// Vergleichswert".
export function computeChange(current: Prisma.Decimal | number, previous: Prisma.Decimal | number): MetricChange {
  const c = new Prisma.Decimal(current);
  const p = new Prisma.Decimal(previous);
  if (p.isZero()) {
    return c.isZero() ? { kind: "none" } : { kind: "new" };
  }
  return { kind: "value", percent: c.minus(p).dividedBy(p).times(100).toNumber() };
}

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
  id: string;
  referenceNumber: string | null;
  name: string | null;
  status: string | null;
  statusRaw: string | null;
  netAmount: Prisma.Decimal | null;
  grossAmount: Prisma.Decimal | null;
  primaryDate: Date | null;
  dueDate: Date | null;
  dataImport: { periodMonth: number; periodYear: number; processedAt: Date | null };
};

// Phase 5.2: Detailwerte fuer einen einzelnen Finanzmonat (Finanzübersicht-
// Seite). Nutzt bewusst dieselbe Zeilenbasis/Dedup-/Filterlogik wie
// getCompanyMetrics (computeMonthAggregate), damit Dashboard und
// Finanzübersicht fuer denselben Monat garantiert auf identische Summen
// kommen (Punkt 15), statt eine zweite, parallele Berechnung zu pflegen.

export type ReceivablesBucket = { count: number; amount: Prisma.Decimal };

export type CustomerRevenue = { customer: string; revenue: Prisma.Decimal; sharePercent: number };

export type InvoiceRow = {
  id: string;
  referenceNumber: string | null;
  invoiceDate: Date | null;
  customer: string | null;
  netAmount: Prisma.Decimal | null;
  grossAmount: Prisma.Decimal | null;
  status: string | null;
  statusRaw: string | null;
  dueDate: Date | null;
};

export type MonthFinanceDetail = {
  period: MonthPeriod;
  previousPeriod: MonthPeriod | null;

  revenue: Prisma.Decimal;
  revenueChange: MetricChange | null;

  receivablesOpen: ReceivablesBucket;
  receivablesOverdue: ReceivablesBucket;
  receivablesTotal: Prisma.Decimal;
  receivablesChange: MetricChange | null;

  customersWithRevenue: number;
  customersWithRevenueChange: MetricChange | null;

  invoiceCount: number;

  // Alle Kunden mit Umsatz im Monat, absteigend sortiert - die UI zeigt
  // standardmaessig nur die ersten 5 (Punkt 6), die vollstaendige Liste steht
  // fuer "Alle anzeigen" bereit.
  customerRevenue: CustomerRevenue[];

  // Alle deduplizierten Datensaetze des Monats INKLUSIVE stornierter (fuer
  // die Rechnungstabelle, Punkt 8 - "Storniert" ist dort ein regulaerer
  // Badge-Zustand), absteigend nach Rechnungsdatum sortiert.
  invoices: InvoiceRow[];
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

type MonthAggregate = {
  dedupedRows: FinanceRecordRow[];
  revenue: Prisma.Decimal;
  receivablesOpen: ReceivablesBucket;
  receivablesOverdue: ReceivablesBucket;
  customerRevenue: Map<string, { displayName: string; revenue: Prisma.Decimal }>;
  invoiceCount: number;
};

// Gemeinsame Aggregationsfunktion fuer genau EINEN Monat - wird sowohl von
// getCompanyMetrics (Dashboard) als auch von getMonthFinanceDetail
// (Finanzübersicht) verwendet, damit beide Seiten fuer denselben Monat immer
// exakt dieselben Summen liefern (Punkt 15).
function computeMonthAggregate(rows: FinanceRecordRow[]): MonthAggregate {
  const dedupedRows = dedupeByReference(rows);
  // Punkt 3: stornierte Datensaetze zaehlen nicht zum Umsatz.
  const nonCanceled = dedupedRows.filter((r) => r.status !== "CANCELED");
  const revenue = sumDecimal(nonCanceled.map((r) => r.netAmount));

  // Punkt 4/7: offene Forderungen = Bruttobetrag getrennt nach OPEN/OVERDUE.
  // PARTIALLY_PAID wird bewusst NICHT als voller Bruttobetrag gezaehlt, da
  // kein gemapptes Feld fuer den tatsaechlichen offenen Restbetrag existiert.
  // Der vorhandene Status (aus der Phase-4-Normalisierung) wird hier nur
  // gelesen, NIE anhand des Faelligkeitsdatums nachtraeglich umklassifiziert -
  // ein als OPEN importierter, inzwischen ueberfaelliger Datensatz bleibt
  // bewusst OPEN, damit die Datenquelle nachvollziehbar bleibt (Punkt 7).
  const openRows = dedupedRows.filter((r) => r.status === "OPEN");
  const overdueRows = dedupedRows.filter((r) => r.status === "OVERDUE");
  const receivablesOpen = { count: openRows.length, amount: sumDecimal(openRows.map((r) => r.grossAmount)) };
  const receivablesOverdue = { count: overdueRows.length, amount: sumDecimal(overdueRows.map((r) => r.grossAmount)) };

  // Punkt 5/6: eindeutige, nicht stornierte Kunden - Normalisierung nur
  // trim + Kleinschreibung, keine unsichere Fuzzy-Zusammenfuehrung. Gleich
  // aggregiert nach Umsatz je Kunde fuer das "Umsatz nach Kunden"-Modul.
  const customerRevenue = new Map<string, { displayName: string; revenue: Prisma.Decimal }>();
  for (const r of nonCanceled) {
    const raw = r.name?.trim();
    if (!raw) continue;
    const key = normalizeCustomerName(raw);
    const amount = r.netAmount ?? new Prisma.Decimal(0);
    const existing = customerRevenue.get(key);
    if (existing) existing.revenue = existing.revenue.plus(amount);
    else customerRevenue.set(key, { displayName: raw, revenue: amount });
  }

  return { dedupedRows, revenue, receivablesOpen, receivablesOverdue, customerRevenue, invoiceCount: nonCanceled.length };
}

function computeMonthMetrics(rows: FinanceRecordRow[]) {
  const agg = computeMonthAggregate(rows);
  return {
    revenue: agg.revenue,
    openReceivables: agg.receivablesOpen.amount.plus(agg.receivablesOverdue.amount),
    customerCount: agg.customerRevenue.size,
  };
}

export async function getCompanyMetrics(companyId: string): Promise<CompanyMetrics> {
  const [financeRecords, importedMonthGroups, openImportErrorCount] = await Promise.all([
    // Ausschliesslich Records aus PROCESSED FINANCE-Importen - nie aus der
    // Originaldatei/Vorschau, nie aus nicht abgeschlossenen Imports.
    prisma.dataImportRecord.findMany({
      where: { companyId, dataImport: { status: "PROCESSED", category: "FINANCE" } },
      select: {
        id: true,
        referenceNumber: true,
        name: true,
        status: true,
        statusRaw: true,
        netAmount: true,
        grossAmount: true,
        primaryDate: true,
        dueDate: true,
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

// Alle tatsaechlich vorhandenen PROCESSED-FINANCE-Zeitraeume eines
// Unternehmens, absteigend sortiert (neuester zuerst) - Grundlage fuer den
// Monatswaehler der Finanzübersicht (Punkt 3). Nie Monate anbieten, fuer die
// keine verarbeiteten Finanzdaten existieren.
export async function getAvailableFinanceMonths(companyId: string): Promise<MonthPeriod[]> {
  const groups = await prisma.dataImport.groupBy({
    by: ["periodMonth", "periodYear"],
    where: { companyId, status: "PROCESSED", category: "FINANCE" },
  });
  return groups.map((g) => ({ periodMonth: g.periodMonth, periodYear: g.periodYear })).sort(comparePeriodsDesc);
}

// Detailwerte fuer genau EINEN vom Benutzer gewaehlten Finanzmonat (Punkt 4-8
// der Finanzübersicht). "period" muss ein tatsaechlich vorhandener PROCESSED-
// FINANCE-Zeitraum sein (siehe getAvailableFinanceMonths) - fuer einen nicht
// vorhandenen Zeitraum liefert diese Funktion einfach leere/Null-Werte
// zurueck, nie Daten eines anderen Unternehmens (companyId filtert immer mit).
export async function getMonthFinanceDetail(companyId: string, period: MonthPeriod): Promise<MonthFinanceDetail> {
  const availableMonths = await getAvailableFinanceMonths(companyId);
  const indexInAvailable = availableMonths.findIndex(
    (m) => m.periodMonth === period.periodMonth && m.periodYear === period.periodYear,
  );
  const previousPeriod = indexInAvailable >= 0 ? (availableMonths[indexInAvailable + 1] ?? null) : null;

  const periodFilters = [period, ...(previousPeriod ? [previousPeriod] : [])].map((p) => ({
    periodMonth: p.periodMonth,
    periodYear: p.periodYear,
  }));

  const records: FinanceRecordRow[] =
    periodFilters.length === 0
      ? []
      : await prisma.dataImportRecord.findMany({
          where: { companyId, dataImport: { status: "PROCESSED", category: "FINANCE", OR: periodFilters } },
          select: {
            id: true,
            referenceNumber: true,
            name: true,
            status: true,
            statusRaw: true,
            netAmount: true,
            grossAmount: true,
            primaryDate: true,
            dueDate: true,
            dataImport: { select: { periodMonth: true, periodYear: true, processedAt: true } },
          },
        });

  const currentRows = records.filter((r) => r.dataImport.periodMonth === period.periodMonth && r.dataImport.periodYear === period.periodYear);
  const previousRows = previousPeriod
    ? records.filter((r) => r.dataImport.periodMonth === previousPeriod.periodMonth && r.dataImport.periodYear === previousPeriod.periodYear)
    : [];

  const current = computeMonthAggregate(currentRows);
  const previous = previousPeriod ? computeMonthAggregate(previousRows) : null;

  const receivablesTotal = current.receivablesOpen.amount.plus(current.receivablesOverdue.amount);
  const previousReceivablesTotal = previous ? previous.receivablesOpen.amount.plus(previous.receivablesOverdue.amount) : null;

  const customerRevenue: CustomerRevenue[] = [...current.customerRevenue.values()]
    .sort((a, b) => b.revenue.comparedTo(a.revenue))
    .map((c) => ({
      customer: c.displayName,
      revenue: c.revenue,
      sharePercent: current.revenue.isZero() ? 0 : c.revenue.dividedBy(current.revenue).times(100).toNumber(),
    }));

  const invoices: InvoiceRow[] = current.dedupedRows
    .map((r) => ({
      id: r.id,
      referenceNumber: r.referenceNumber,
      invoiceDate: r.primaryDate,
      customer: r.name,
      netAmount: r.netAmount,
      grossAmount: r.grossAmount,
      status: r.status,
      statusRaw: r.statusRaw,
      dueDate: r.dueDate,
    }))
    .sort((a, b) => (b.invoiceDate?.getTime() ?? 0) - (a.invoiceDate?.getTime() ?? 0));

  return {
    period,
    previousPeriod,
    revenue: current.revenue,
    revenueChange: previous ? computeChange(current.revenue, previous.revenue) : null,
    receivablesOpen: current.receivablesOpen,
    receivablesOverdue: current.receivablesOverdue,
    receivablesTotal,
    receivablesChange: previous ? computeChange(receivablesTotal, previousReceivablesTotal!) : null,
    customersWithRevenue: current.customerRevenue.size,
    customersWithRevenueChange: previous ? computeChange(current.customerRevenue.size, previous.customerRevenue.size) : null,
    invoiceCount: current.invoiceCount,
    customerRevenue,
    invoices,
  };
}

