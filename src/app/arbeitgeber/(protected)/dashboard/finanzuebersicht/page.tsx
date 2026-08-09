import Link from "next/link";
import { requireCompanyMember } from "@/lib/auth";
import { COMPANY_IMPORT_UPLOAD_ROLES } from "@/lib/company";
import { periodLabel } from "@/lib/data-import";
import {
  getAvailableFinanceMonths,
  getMonthFinanceDetail,
  getCompanyMetrics,
  formatEuroCompact,
  formatEuroDetailed,
  formatChange,
  changeTone,
  type MonthPeriod,
} from "@/lib/company-metrics";
import { monthParamValue } from "@/lib/finance-format";
import { importPanelClass, importSecondaryTextClass } from "@/lib/import-ui";
import { primaryButtonClass } from "@/lib/ui";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { RevenueLineChart, type RevenueHistoryPoint } from "@/components/finance/revenue-line-chart";
import { CustomerRevenueList, type CustomerRevenueView } from "@/components/finance/customer-revenue-list";
import { InvoiceTable, type InvoiceRowView } from "@/components/finance/invoice-table";
import { MonthSelect } from "@/components/finance/month-select";
import { TrendingUpIcon, FileTextIcon, UsersIcon, ActivityIcon } from "@/components/icons";

const CHANGE_TONE_CLASSES: Record<"positive" | "negative" | "neutral", string> = {
  positive: "text-emerald-600 dark:text-emerald-300",
  negative: "text-rose-600 dark:text-rose-300",
  neutral: importSecondaryTextClass,
};

// Gleiche Akzentfarben-Konvention wie die Effivo-Übersicht (Punkt 17: soll
// eindeutig zum bestehenden Design gehoeren) - hier lokal, da die
// Dashboard-Seite bewusst unveraendert bleiben soll.
const KPI_ACCENT_CLASSES: Record<string, string> = {
  emerald:
    "bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 text-emerald-600 dark:text-emerald-200 border border-emerald-400/30 dark:border-emerald-300/25 ring-1 ring-inset ring-white/10 shadow-md shadow-emerald-500/10 dark:shadow-emerald-400/20",
  rose: "bg-gradient-to-br from-rose-400/35 to-rose-500/10 text-rose-600 dark:text-rose-200 border border-rose-400/35 dark:border-rose-300/30 ring-1 ring-inset ring-white/10 shadow-md shadow-rose-500/15 dark:shadow-rose-400/25",
  sky: "bg-gradient-to-br from-sky-400/30 to-sky-500/10 text-sky-600 dark:text-sky-200 border border-sky-400/30 dark:border-sky-300/25 ring-1 ring-inset ring-white/10 shadow-md shadow-sky-500/10 dark:shadow-sky-400/20",
  violet:
    "bg-gradient-to-br from-violet-400/30 to-violet-500/10 text-violet-600 dark:text-violet-200 border border-violet-400/30 dark:border-violet-300/25 ring-1 ring-inset ring-white/10 shadow-md shadow-violet-500/10 dark:shadow-violet-400/20",
};

// "YYYY-MM" aus dem Query-Parameter - bewusst tolerant: ein fehlendes oder
// ungueltiges Format faellt in der Seite selbst auf den neuesten verfuegbaren
// Monat zurueck, nie auf einen Fehler oder gar Daten eines anderen Monats.
function parseMonthParam(value: string | undefined): MonthPeriod | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{1,2})$/.exec(value);
  if (!match) return null;
  const periodYear = Number(match[1]);
  const periodMonth = Number(match[2]);
  if (!Number.isInteger(periodMonth) || periodMonth < 1 || periodMonth > 12) return null;
  return { periodYear, periodMonth };
}

function sameMonth(a: MonthPeriod, b: MonthPeriod): boolean {
  return a.periodMonth === b.periodMonth && a.periodYear === b.periodYear;
}

export default async function FinanzuebersichtPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { company, membership } = await requireCompanyMember();
  const { month: monthParam } = await searchParams;
  const canUpload = COMPANY_IMPORT_UPLOAD_ROLES.includes(membership.role);

  const availableMonths = await getAvailableFinanceMonths(company.id);

  if (availableMonths.length === 0) {
    return (
      <ModulePlaceholder
        icon={FileTextIcon}
        title="Finanzübersicht"
        description="Noch keine verarbeiteten Finanzdaten vorhanden."
        showImportCta={canUpload}
      />
    );
  }

  const requested = parseMonthParam(monthParam);
  const selectedPeriod = requested && availableMonths.some((m) => sameMonth(m, requested)) ? requested : availableMonths[0];

  const [detail, companyMetrics] = await Promise.all([
    getMonthFinanceDetail(company.id, selectedPeriod),
    // Fuer die vollstaendige Umsatzhistorie ueber ALLE verarbeiteten Monate
    // (Punkt 5) - bewusst die bestehende Aggregation wiederverwendet statt
    // einer zweiten, parallelen Berechnung (Punkt 12).
    getCompanyMetrics(company.id),
  ]);

  // Phase 5.2.2: die Umsatzentwicklung zeigt die Historie NUR bis einschliesslich
  // des ausgewaehlten Zeitraums - niemals spaeter verarbeitete Monate (Punkt
  // "Keine zukuenftigen Monate"). "period <= selectedPeriod" wird als
  // "YYYY-MM"-String verglichen (lexikographisch chronologisch korrekt, auch
  // ueber Jahreswechsel hinweg, z.B. "2026-12" < "2027-01"). Der
  // Monatsvergleich (KPI-Karten oben) bleibt davon unberuehrt - der basiert
  // weiterhin auf detail.revenueChange/detail.previousPeriod aus
  // getMonthFinanceDetail, nicht auf dieser History.
  const revenueHistory: RevenueHistoryPoint[] = companyMetrics.revenueHistory
    .filter((h) => monthParamValue(h.period) <= monthParamValue(selectedPeriod))
    .map((h) => ({
      period: h.period,
      revenue: h.revenue.toNumber(),
    }));

  const customerRevenueView: CustomerRevenueView[] = detail.customerRevenue.map((c) => ({
    customer: c.customer,
    revenue: c.revenue.toNumber(),
    sharePercent: c.sharePercent,
  }));

  const invoicesView: InvoiceRowView[] = detail.invoices.map((i) => ({
    id: i.id,
    referenceNumber: i.referenceNumber,
    invoiceDate: i.invoiceDate,
    customer: i.customer,
    netAmount: i.netAmount ? i.netAmount.toNumber() : null,
    grossAmount: i.grossAmount ? i.grossAmount.toNumber() : null,
    status: i.status,
    statusRaw: i.statusRaw,
    dueDate: i.dueDate,
    displayStatus: i.displayStatus,
  }));

  const kpis = [
    {
      key: "revenue",
      icon: TrendingUpIcon,
      color: "emerald",
      label: "Umsatz",
      value: formatEuroCompact(detail.revenue),
      change: detail.revenueChange,
      direction: "up-good" as const,
    },
    {
      key: "receivables",
      icon: FileTextIcon,
      color: "rose",
      label: "Offene Forderungen",
      value: formatEuroDetailed(detail.receivablesTotal),
      change: detail.receivablesChange,
      direction: "down-good" as const,
    },
    {
      key: "customers",
      icon: UsersIcon,
      color: "sky",
      label: "Kunden mit Umsatz",
      value: String(detail.customersWithRevenue),
      change: detail.customersWithRevenueChange,
      direction: "up-good" as const,
    },
    {
      key: "invoices",
      icon: ActivityIcon,
      color: "violet",
      label: "Rechnungen",
      value: String(detail.invoiceCount),
      change: null,
      direction: "up-good" as const,
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">Finanzübersicht</h1>
          <p className={`mt-2 max-w-xl ${importSecondaryTextClass}`}>
            Ihre wichtigsten Finanzkennzahlen und deren Entwicklung im Überblick.
          </p>
        </div>
        <MonthSelect availableMonths={availableMonths} selectedPeriod={selectedPeriod} />
      </div>

      {/* Oberste KPI-Zeile (Punkt 4) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const tone = kpi.change ? changeTone(kpi.change, kpi.direction) : "neutral";
          return (
            <div key={kpi.key} className={`!p-4 ${importPanelClass}`}>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${KPI_ACCENT_CLASSES[kpi.color]}`}>
                <kpi.icon className="h-4 w-4" />
              </span>
              <p className="mt-2.5 font-display text-2xl font-extrabold leading-none tracking-tight text-sand-900 dark:text-cockpit-heading">
                {kpi.value}
              </p>
              <p className={`mt-1 text-sm ${importSecondaryTextClass}`}>{kpi.label}</p>
              {kpi.change && (
                <p className={`mt-1.5 text-xs font-medium ${CHANGE_TONE_CLASSES[tone]}`}>
                  {formatChange(kpi.change)} ggü. {detail.previousPeriod ? periodLabel(detail.previousPeriod.periodMonth, detail.previousPeriod.periodYear) : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!detail.previousPeriod && (
        <p className={`-mt-2 text-xs ${importSecondaryTextClass}`}>Kein vorheriger Vergleichsmonat vorhanden.</p>
      )}

      {/* Umsatzentwicklung + Umsatz nach Kunden (Punkt 5/6) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className={`!p-5 ${importPanelClass}`}>
          <h2 className="font-display text-lg font-semibold text-sand-900 dark:text-cockpit-heading">Umsatzentwicklung</h2>
          <p className={`mt-1 text-sm ${importSecondaryTextClass}`}>Umsatz je verarbeitetem Monat.</p>
          {revenueHistory.length >= 2 ? (
            <div className="mt-4">
              <RevenueLineChart history={revenueHistory} selectedPeriod={selectedPeriod} />
            </div>
          ) : (
            <div className="mt-6">
              <p className={`text-sm ${importSecondaryTextClass}`}>
                Für die Umsatzentwicklung sind weitere verarbeitete Monate erforderlich.
              </p>
              <p className="mt-2 text-sm font-semibold text-sand-900 dark:text-cockpit-heading">
                {periodLabel(selectedPeriod.periodMonth, selectedPeriod.periodYear)} · {formatEuroCompact(detail.revenue)}
              </p>
            </div>
          )}
        </div>

        <div className={`!p-5 ${importPanelClass}`}>
          <h2 className="font-display text-lg font-semibold text-sand-900 dark:text-cockpit-heading">Umsatz nach Kunden</h2>
          <p className={`mt-1 text-sm ${importSecondaryTextClass}`}>
            {periodLabel(selectedPeriod.periodMonth, selectedPeriod.periodYear)}
          </p>
          <div className="mt-3">
            <CustomerRevenueList customers={customerRevenueView} />
          </div>
        </div>
      </div>

      {/* Forderungsübersicht (Punkt 7) */}
      <div className={`!p-5 ${importPanelClass}`}>
        <h2 className="font-display text-lg font-semibold text-sand-900 dark:text-cockpit-heading">Offene Forderungen</h2>
        <p className={`mt-1 text-sm ${importSecondaryTextClass}`}>Noch nicht bezahlte Rechnungen des ausgewählten Monats.</p>
        <p className="mt-0.5 text-xs text-sand-400 dark:text-cockpit-text-weak">
          Überfällige Rechnungen werden anhand ihres Fälligkeitsdatums hervorgehoben.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-card-border/70 p-4 dark:border-white/10">
            <p className={`text-sm ${importSecondaryTextClass}`}>Offen</p>
            <p className="mt-1 font-display text-xl font-bold text-sand-900 dark:text-cockpit-heading">
              {formatEuroDetailed(detail.receivablesOpen.amount)}
            </p>
            <p className={`mt-0.5 text-xs ${importSecondaryTextClass}`}>
              {detail.receivablesOpen.count} {detail.receivablesOpen.count === 1 ? "Rechnung" : "Rechnungen"}
            </p>
          </div>
          <div className="rounded-xl border border-card-border/70 p-4 dark:border-white/10">
            <p className={`text-sm ${importSecondaryTextClass}`}>Überfällig</p>
            <p className="mt-1 font-display text-xl font-bold text-rose-600 dark:text-rose-300">
              {formatEuroDetailed(detail.receivablesOverdue.amount)}
            </p>
            <p className={`mt-0.5 text-xs ${importSecondaryTextClass}`}>
              {detail.receivablesOverdue.count} {detail.receivablesOverdue.count === 1 ? "Rechnung" : "Rechnungen"}
            </p>
          </div>
        </div>
      </div>

      {/* Rechnungsliste (Punkt 8/9) */}
      <div>
        <h2 className="font-display text-lg font-semibold text-sand-900 dark:text-cockpit-heading">
          Rechnungen im {periodLabel(selectedPeriod.periodMonth, selectedPeriod.periodYear)}
        </h2>
        <div className="mt-3">
          <InvoiceTable invoices={invoicesView} />
        </div>
      </div>

      {canUpload && (
        <div className="pt-2">
          <Link href="/arbeitgeber/dashboard/datenimporte" className={primaryButtonClass}>
            Weiteren Datenimport starten
          </Link>
        </div>
      )}
    </div>
  );
}
