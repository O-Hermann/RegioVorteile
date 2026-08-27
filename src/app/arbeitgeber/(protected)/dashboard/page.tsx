import { prisma } from "@/lib/prisma";
import { requireCompanyMember } from "@/lib/auth";
import { periodLabel, DATA_IMPORT_CATEGORY_LABELS } from "@/lib/data-import";
import { getCompanyMetrics } from "@/lib/company-metrics";
import { TrendingUpIcon, UploadIcon, UsersIcon, SearchIcon } from "@/components/icons";
import { AttentionList, type AttentionItem } from "@/components/dashboard/attention-list";
import { ActivityTimeline, type ActivityTimelineItem } from "@/components/dashboard/activity-timeline";
import { FindingsHero } from "@/components/dashboard/findings-hero";
import { ReviewStatusCard } from "@/components/dashboard/review-status";
import { ReviewDonut } from "@/components/dashboard/review-donut";
import { DataStatusCard } from "@/components/dashboard/data-status";
import { FindingsList } from "@/components/dashboard/findings-list";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Pagehead } from "@/components/dashboard/pagehead";
import { dashFontScopeClass, type DashAccent } from "@/components/dashboard/dash-ui";

// MVP-Stand der Effivo-Übersicht: bewusster Fokus auf die vier Fund-
// Kategorien (Doppelzahlungen/Skonto/Gutschriften/Überzahlung, siehe
// findings-list.tsx) statt der bisherigen Umsatz/Kosten-Kennzahlenuebersicht
// - Kundenvorgabe: "erstmal dem Kunden zeigen, wo Geld liegen bleibt", eine
// Umsatz/Kosten-Uebersicht kommt explizit erst spaeter. Die dafuer bisher
// gebauten, echten-Daten-basierten Komponenten (KpiGrid, AnalysisCompare,
// TrendChart, StatusHero) werden daher NICHT mehr gerendert, aber bewusst
// NICHT geloescht - inklusive der zugehoerigen, bereits korrekten
// getCompanyMetrics()-Aggregation - damit sie spaeter ohne Neubau wieder
// eingehaengt werden koennen. StatusHero (die tuerkise "Analyse
// abgeschlossen"-Verlaufskarte) wich hier data-status.tsx, weil im
// freigegebenen Mockup an dieser Stelle eine schlichte Statuszeilen-Karte
// steht statt einer grossen Verlaufskarte.
//
// Die vorherige Drei-Spalten-Seite war fest auf "100dvh - 9rem" begrenzt
// (kein Scrollen), was den grossen Teil der Layout-Fehler dieser Seite
// verursacht hat (Text-Truncation, Spalten-Fluchtung, vertikale
// Zentrierung - siehe Kommentare in den einzelnen Komponenten). Die MVP-
// Seite fliesst stattdessen natuerlich wie jede andere Seite der App und
// scrollt bei Bedarf - dadurch entfallen die meisten dieser Hacks komplett,
// statt sie fuer die neue Struktur erneut nachbauen zu muessen.
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
  const { user, company } = await requireCompanyMember();
  const now = new Date();

  const [memberships, dataImportCount, pendingMappingCount, failedImportCount, processedRowAgg, recentDataImports, recentProcessedImports, metrics] =
    await Promise.all([
      prisma.companyMembership.findMany({
        where: { companyId: company.id },
        orderBy: { invitedAt: "desc" },
        take: 10,
        include: { user: true },
      }),
      prisma.dataImport.count({ where: { companyId: company.id } }),
      prisma.dataImport.count({ where: { companyId: company.id, status: "READY_FOR_MAPPING" } }),
      prisma.dataImport.count({ where: { companyId: company.id, status: { in: ["FAILED", "VALIDATION_FAILED"] } } }),
      prisma.dataImport.aggregate({ where: { companyId: company.id, status: "PROCESSED" }, _sum: { rowCount: true } }),
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
      getCompanyMetrics(company.id),
    ]);
  const processedMonthCount = metrics.importedMonthCount;
  const processedRowCount = processedRowAgg._sum.rowCount ?? 0;

  const greetingName = user.firstName?.trim();
  const greeting = greetingName ? `Guten Tag, ${greetingName}` : "Guten Tag";
  const today = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentPeriodLabel = metrics.currentPeriod ? periodLabel(metrics.currentPeriod.periodMonth, metrics.currentPeriod.periodYear) : null;

  // Handlungsbedarf: solange kein Import existiert, auf den Upload
  // hinweisen; sobald mindestens einer wartet, auf die noch ausstehende
  // Spaltenzuordnung; zusaetzlich - sobald Daten verarbeitet sind - ein
  // Hinweis auf die neuen Fund-Faelle (Neu-Anteil aus review-donut.tsx,
  // hier als eigene Konstante gehalten statt importiert, da beide Karten
  // laut Kommentar dort bewusst unabhaengige Referenz-Demowerte tragen).
  const actionItems: AttentionItem[] = [];
  if (dataImportCount === 0) {
    actionItems.push({
      id: "no-import",
      title: "Noch keine Unternehmensdaten importiert",
      icon: UploadIcon,
      accent: ACCENT_MAP.amber,
      href: "/arbeitgeber/dashboard/datenimporte/neu",
      cta: "Import starten",
    });
  } else if (pendingMappingCount > 0) {
    actionItems.push({
      id: "pending-mapping",
      title: `${pendingMappingCount} ${pendingMappingCount === 1 ? "Datenimport wartet" : "Datenimporte warten"} auf Zuordnung`,
      icon: UploadIcon,
      accent: ACCENT_MAP.amber,
      href: "/arbeitgeber/dashboard/datenimporte",
      cta: "Ansehen",
    });
  }
  if (processedMonthCount > 0) {
    actionItems.push({
      id: "pending-findings",
      title: "16 neue Fälle warten auf Prüfung",
      subtitle: "Ø Prüfzeit 11 Minuten",
      icon: SearchIcon,
      accent: ACCENT_MAP.slate,
      href: "/arbeitgeber/dashboard/datenimporte",
      cta: "Prüfen",
      priority: true,
    });
  }

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
    // "max-w-[1360px] mx-auto" bewusst hier statt im geteilten Layout
    // (layout.tsx spannt seinen eigenen Inhaltsbereich auf max-w-[1920px]
    // fuer alle Arbeitgeber-Seiten auf) - im Mockup war die Seite auf
    // max-width:1360px zentriert, damit Kartenreihen auf sehr breiten
    // Bildschirmen nicht ueber die ganze Breite auseinandergezogen wirken;
    // andere Seiten (Kunden, Auftraege, ...) sollen das bestehende 1920px
    // weiterhin nutzen.
    <div className={`mx-auto flex w-full max-w-[1360px] flex-col gap-3 ${dashFontScopeClass}`}>
      <Pagehead
        greeting={greeting}
        companyName={company.name}
        today={today}
        currentPeriodLabel={currentPeriodLabel}
        dataStatusReady={processedMonthCount > 0}
      />

      <AttentionList items={actionItems} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.7fr_1fr] lg:items-stretch">
        <FindingsHero currentPeriodLabel={currentPeriodLabel} />
        <ReviewStatusCard />
      </div>

      <FindingsList />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-stretch">
        <ReviewDonut />
        <DataStatusCard
          processedMonthCount={processedMonthCount}
          processedRowCount={processedRowCount}
          pendingMappingCount={pendingMappingCount}
          failedImportCount={failedImportCount}
          currentPeriodLabel={currentPeriodLabel}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ActivityTimeline items={activityItems} />
        <QuickActions hint={pendingMappingCount > 0 ? `${pendingMappingCount} Datenimporte prüfen` : undefined} />
      </div>
    </div>
  );
}
