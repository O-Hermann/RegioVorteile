import { prisma } from "@/lib/prisma";
import { requireCompanyMember } from "@/lib/auth";
import { COMPANY_ROLE_LABELS } from "@/lib/company";
import { periodLabel, DATA_IMPORT_CATEGORY_LABELS } from "@/lib/data-import";
import { getCompanyMetrics, formatEuroCompact } from "@/lib/company-metrics";
import {
  TrendingUpIcon,
  TagIcon,
  ActivityIcon,
  FileTextIcon,
  BriefcaseIcon,
  UsersIcon,
  UploadIcon,
  AlertTriangleIcon,
} from "@/components/icons";
import { StatusHero } from "@/components/dashboard/status-hero";
import { KpiGrid, type KpiTile } from "@/components/dashboard/kpi-grid";
import { AttentionList, type AttentionItem } from "@/components/dashboard/attention-list";
import { ActivityTimeline, type ActivityTimelineItem } from "@/components/dashboard/activity-timeline";
import { AnalysisCompare } from "@/components/dashboard/analysis-compare";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ReviewDonut } from "@/components/dashboard/review-donut";
import { FindingsList } from "@/components/dashboard/findings-list";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Pagehead } from "@/components/dashboard/pagehead";
import type { DashAccent } from "@/components/dashboard/dash-ui";

// V12-Stand der Effivo-Übersicht (freigegebene Designreferenz
// "Effivo_V12_Dashboard_Final.html"). Jedes V12-Modul lebt als eigene,
// einzeln verantwortliche Komponente unter components/dashboard/ - bewusst
// KEINE gestapelten CSS-Versionsebenen wie im Referenz-HTML selbst (dort
// ueberschreiben sich ca. 12 "V2 fix"/"V11.11 fix"-Bloecke gegenseitig).
// Datenermittlung unveraendert gegenueber dem bisherigen Stand: nur die
// Darstellung wurde auf V12 portiert, keine echte Logik durch Platzhalter-
// werte aus der Referenz ersetzt (siehe Kommentare in den einzelnen
// Komponenten fuer die Stellen, an denen es noch kein echtes Datenmodell
// gibt - Faelle/Funde/Pruefung, siehe ReviewDonut/FindingsList).
const ACCENT_MAP: Record<string, DashAccent> = {
  sky: "blue",
  emerald: "green",
  ink: "teal",
  amber: "orange",
  violet: "purple",
  rose: "red",
  slate: "blue",
};

export default async function ArbeitgeberDashboardPage() {
  const { user, company, membership } = await requireCompanyMember();
  const now = new Date();

  const [memberships, dataImportCount, pendingMappingCount, recentDataImports, recentProcessedImports, metrics] = await Promise.all([
    prisma.companyMembership.findMany({
      where: { companyId: company.id },
      orderBy: { invitedAt: "desc" },
      take: 10,
      include: { user: true },
    }),
    prisma.dataImport.count({ where: { companyId: company.id } }),
    prisma.dataImport.count({ where: { companyId: company.id, status: "READY_FOR_MAPPING" } }),
    prisma.dataImport.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.dataImport.findMany({
      where: { companyId: company.id, status: "PROCESSED" },
      orderBy: { processedAt: "desc" },
      take: 5,
    }),
    // Phase 5.1: zentrale, company-gescopte Kennzahlenaggregation - "Importierte
    // Monate" lebt hier (unveraendert gegenueber dem bisherigen Stand).
    getCompanyMetrics(company.id),
  ]);
  const processedMonthCount = metrics.importedMonthCount;

  const greetingName = user.firstName?.trim();
  const greeting = greetingName ? `Guten Tag, ${greetingName}` : "Guten Tag";
  const avatarInitial = (greetingName ?? user.email).charAt(0).toUpperCase();
  const roleLabel = COMPANY_ROLE_LABELS[membership.role];
  const today = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentPeriodLabel = metrics.currentPeriod ? periodLabel(metrics.currentPeriod.periodMonth, metrics.currentPeriod.periodYear) : null;

  // Acht echte Kennzahlen (Kosten/Ergebnis/Offene Aufträge bleiben "—", da
  // dafuer weiterhin keine verlaessliche Datenquelle existiert - Ergebnis !=
  // Umsatz, offene Rechnungen != offene Auftraege). Veraenderungswerte nur,
  // wo eine echte Vormonatsberechnung existiert. Jede Kennzahl hat ihre
  // eigene Kachel (kein Zusammenfassen, keine breite Sonderkachel) - festes
  // 2x4-Raster in der Reihenfolge Umsatz/Kosten, Ergebnis/Offene
  // Forderungen, Offene Aufträge/Kunden mit Umsatz, Importierte Monate/
  // Offene Datenfehler.
  const kpiTiles: KpiTile[] = [
    {
      key: "revenue",
      label: "Umsatz",
      value: formatEuroCompact(metrics.revenueCurrent),
      icon: TrendingUpIcon,
      accent: "highlight",
      change: metrics.revenueChange,
      changeDirection: "up-good",
      changeContext: "vs. Vormonat",
    },
    { key: "costs", label: "Kosten", value: "—", icon: TagIcon, accent: "teal" },
    { key: "result", label: "Ergebnis", value: "—", icon: ActivityIcon, accent: "purple" },
    {
      key: "receivables",
      label: "Offene Forderungen",
      value: formatEuroCompact(metrics.openReceivablesCurrent),
      icon: FileTextIcon,
      accent: "orange",
      change: metrics.openReceivablesChange,
      changeDirection: "down-good",
      changeContext: "vs. Vormonat",
    },
    { key: "orders", label: "Offene Aufträge", value: "—", icon: BriefcaseIcon, accent: "blue" },
    {
      key: "customers",
      label: "Kunden mit Umsatz",
      value: metrics.customersWithRevenueCurrent === null ? "—" : String(metrics.customersWithRevenueCurrent),
      icon: UsersIcon,
      accent: "green",
      change: metrics.customersWithRevenueChange,
      changeDirection: "up-good",
      changeContext: "vs. Vormonat",
    },
    {
      key: "months",
      label: "Importierte Monate",
      value: processedMonthCount > 0 ? String(processedMonthCount) : "—",
      icon: UploadIcon,
      accent: "teal",
    },
    {
      key: "errors",
      label: "Offene Datenfehler",
      value: String(metrics.openImportErrorCount),
      icon: AlertTriangleIcon,
      accent: "orange",
      detailsLabel: "Details ansehen →",
    },
  ];

  // Handlungsbedarf: solange kein Import existiert, auf den Upload
  // hinweisen; sobald mindestens einer wartet, auf die noch ausstehende
  // Spaltenzuordnung - beides aus echten DataImport-Zahlen abgeleitet.
  const actionItems: AttentionItem[] =
    dataImportCount === 0
      ? [
          {
            id: "no-import",
            title: "Noch keine Unternehmensdaten importiert",
            icon: UploadIcon,
            accent: ACCENT_MAP.amber,
            href: "/arbeitgeber/dashboard/datenimporte/neu",
            cta: "Import starten",
          },
        ]
      : pendingMappingCount > 0
        ? [
            {
              id: "pending-mapping",
              title: `${pendingMappingCount} ${pendingMappingCount === 1 ? "Datenimport wartet" : "Datenimporte warten"} auf Zuordnung`,
              icon: UploadIcon,
              accent: ACCENT_MAP.amber,
              href: "/arbeitgeber/dashboard/datenimporte",
              cta: "Ansehen",
            },
          ]
        : [];

  type ActivityItem = {
    id: string;
    label: string;
    category: string;
    detail: string;
    createdAt: Date;
    icon: typeof UsersIcon;
    color: string;
  };
  const activity: ActivityItem[] = [];
  for (const m of memberships) {
    const name = [m.user.firstName, m.user.lastName].filter(Boolean).join(" ") || m.user.email;
    activity.push({
      id: `invited-${m.id}`,
      label: "Benutzer eingeladen",
      category: "Einladung",
      detail: name,
      createdAt: m.invitedAt,
      icon: UsersIcon,
      color: "sky",
    });
    if (m.activatedAt) {
      activity.push({
        id: `activated-${m.id}`,
        label: "Benutzer aktiviert",
        category: "Aktivierung",
        detail: name,
        createdAt: m.activatedAt,
        icon: UsersIcon,
        color: "emerald",
      });
    }
  }
  for (const i of recentDataImports) {
    activity.push({
      id: `import-${i.id}`,
      label: "Datenimport hochgeladen",
      category: "Import",
      detail: `${DATA_IMPORT_CATEGORY_LABELS[i.category]} · ${periodLabel(i.periodMonth, i.periodYear)}`,
      createdAt: i.createdAt,
      icon: UploadIcon,
      color: "ink",
    });
  }
  for (const i of recentProcessedImports) {
    if (!i.processedAt) continue;
    activity.push({
      id: `processed-${i.id}`,
      label: "Datenimport verarbeitet",
      category: "Verarbeitung",
      detail: `${DATA_IMPORT_CATEGORY_LABELS[i.category]} · ${periodLabel(i.periodMonth, i.periodYear)}`,
      createdAt: i.processedAt,
      icon: TrendingUpIcon,
      color: "emerald",
    });
  }
  const recentActivity = activity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4);
  const firstPositiveIndex = recentActivity.findIndex((a) => a.color === "emerald");
  const activityItems: ActivityTimelineItem[] = recentActivity.map((a, index) => ({
    id: a.id,
    category: a.category,
    title: a.label,
    detail: a.detail,
    createdAt: a.createdAt,
    icon: a.icon,
    accent: ACCENT_MAP[a.color] ?? "teal",
    highlight: index === firstPositiveIndex,
  }));

  return (
    <div className="flex flex-col gap-3 min-[1400px]:h-[calc(100dvh-9rem)]">
      <Pagehead
        today={today}
        currentPeriodLabel={currentPeriodLabel}
        dataStatusReady={processedMonthCount > 0}
        pendingMappingCount={pendingMappingCount}
      />

      <div className="grid grid-cols-1 gap-3 min-[1400px]:min-h-0 min-[1400px]:flex-1 min-[901px]:grid-cols-2 min-[1536px]:grid-cols-[1.08fr_1.52fr_.96fr] min-[1536px]:items-stretch">
        {/* Linke Spalte: Begrüßung, Datenstatus, KPI-Kacheln */}
        <div className="flex min-w-0 flex-col rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-3 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.032),0_15px_34px_rgba(0,0,0,0.18)] min-[1400px]:min-h-0">
          <div className="mb-2.5 flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 dark:bg-[radial-gradient(circle_at_28%_20%,rgba(218,255,252,0.2),transparent_36%),linear-gradient(145deg,#31cfc6,#117d7a_72%)] font-display text-base font-bold text-white shadow-md shadow-ink-900/20 dark:border dark:border-[rgba(118,241,233,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_18px_rgba(4,94,91,0.17)]">
              {avatarInitial}
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-card bg-emerald-400 shadow-[0_0_8px_rgba(88,227,166,0.42)] dark:border-[#0e223b] dark:bg-[#58e3a6]" />
            </div>
            <div className="min-w-0">
              <b className="block truncate font-display text-[15px] font-bold tracking-tight text-sand-900 dark:text-dash-text">{greeting}</b>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[9px] font-bold text-gold-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:bg-[linear-gradient(180deg,rgba(45,69,95,0.92),rgba(34,54,78,0.92))] dark:text-[#f2f7fb] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] dark:border dark:border-[rgba(113,150,181,0.13)]">
                  {roleLabel}
                </span>
                <span className="truncate text-[10px] text-sand-500 dark:text-[#9eb8cf]">{company.name}</span>
              </div>
            </div>
          </div>

          <StatusHero
            dataImportCount={dataImportCount}
            processedMonthCount={processedMonthCount}
            currentPeriodLabel={currentPeriodLabel ?? ""}
          />

          <KpiGrid tiles={kpiTiles} />
        </div>

        {/* Mittlere Spalte: Analysevergleich/Entwicklung, Prüfübersicht/Funde, Schnellaktion */}
        <div className="flex min-w-0 flex-col gap-3 min-[1400px]:min-h-0">
          <div className="grid min-h-0 grid-cols-1 gap-3 sm:grid-cols-[1.15fr_.85fr] min-[1400px]:flex-[0.84_0.84_0%]">
            <AnalysisCompare
              currentPeriod={metrics.currentPeriod}
              previousPeriod={metrics.previousPeriod}
              revenueCurrent={metrics.revenueCurrent}
              revenuePrevious={metrics.revenuePrevious}
              revenueChange={metrics.revenueChange}
              openReceivablesCurrent={metrics.openReceivablesCurrent}
              openReceivablesPrevious={metrics.openReceivablesPrevious}
              openReceivablesChange={metrics.openReceivablesChange}
              customersWithRevenueCurrent={metrics.customersWithRevenueCurrent}
              customersWithRevenuePrevious={metrics.customersWithRevenuePrevious}
              customersWithRevenueChange={metrics.customersWithRevenueChange}
            />
            <TrendChart history={metrics.revenueHistory} />
          </div>
          <div className="grid min-h-0 grid-cols-1 gap-3 sm:grid-cols-2 min-[1400px]:flex-[0.9_0.9_0%]">
            <ReviewDonut />
            <FindingsList />
          </div>
          <QuickActions hint={pendingMappingCount > 0 ? `${pendingMappingCount} Datenimporte prüfen` : undefined} />
        </div>

        {/* Rechte Spalte: Handlungsbedarf + Letzte Aktivitäten, fest 50/50.
            Ab 1536px eigene dritte Spalte (untereinander gestapelt) - im
            mittleren Breitenbereich (768–1535px, wie in der V12-Referenz)
            stattdessen volle Breite unterhalb von links/mitte, dafuer intern
            nebeneinander, damit auf schmaleren Laptop-Breiten kein
            erzwungener dritter Spaltenblock die Lesbarkeit verschlechtert. */}
        <div className="flex min-w-0 flex-col gap-3 min-[901px]:col-span-2 min-[901px]:flex-row min-[1536px]:col-span-1 min-[1536px]:flex-col min-[1400px]:min-h-0">
          <AttentionList items={actionItems} />
          <ActivityTimeline items={activityItems} />
        </div>
      </div>
    </div>
  );
}
