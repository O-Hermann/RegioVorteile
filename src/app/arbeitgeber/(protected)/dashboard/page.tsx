import { prisma } from "@/lib/prisma";
import { requireCompanyMember } from "@/lib/auth";
import { periodLabel, DATA_IMPORT_CATEGORY_LABELS } from "@/lib/data-import";
import { getCompanyMetrics } from "@/lib/company-metrics";
import { syncCases } from "@/lib/case-sync";
import { getCaseCounts, getLastReviewedAt } from "@/lib/cases";
import { TrendingUpIcon, UploadIcon, UsersIcon, SearchIcon } from "@/components/icons";
import { AttentionList, type AttentionItem } from "@/components/dashboard/attention-list";
import { ActivityTimeline, type ActivityTimelineItem } from "@/components/dashboard/activity-timeline";
import { FindingsHero } from "@/components/dashboard/findings-hero";
import { ReviewStatusCard } from "@/components/dashboard/review-status";
import { ReviewDonut } from "@/components/dashboard/review-donut";
import { DataStatusCard } from "@/components/dashboard/data-status";
import { FindingsList, buildFindings, getFindingsSummary } from "@/components/dashboard/findings-list";
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

  const [memberships, dataImportCount, pendingMappingCount, failedImportCount, processedRowAgg, recentDataImports, recentProcessedImports, metrics, syncedFindings] =
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
      syncCases(company.id),
    ]);
  const processedMonthCount = metrics.importedMonthCount;
  const processedRowCount = processedRowAgg._sum.rowCount ?? 0;
  // Alle vier Fund-Kategorien sind echt (siehe [[effivo_mvp_roadmap]] Phase
  // 1, abgeschlossen 2026-08-29) - duplicate-payment-detection.ts /
  // open-credit-note-detection.ts / overpayment-detection.ts /
  // discount-detection.ts. syncCases() (Phase 2) fuehrt diese vier
  // Erkennungen aus UND gleicht sie mit der persistenten Case-Tabelle ab,
  // damit ein bereits geprueftes Fall seinen Status behaelt.
  const { duplicatePayments, openCreditNotes, overpayments, missedDiscounts } = syncedFindings;
  const findings = buildFindings(duplicatePayments, openCreditNotes, overpayments, missedDiscounts);
  // FindingsHero ist ein Client Component (Count-up-Animation) - bekommt
  // deshalb nur Primitives, nicht die volle findings-Liste (die enthaelt
  // Icon-Komponenten/Funktionen, die sich nicht ueber die Server/Client-
  // Grenze serialisieren lassen).
  const { totalAmount: heroTotalAmount, totalCount: heroTotalCount } = getFindingsSummary(findings);
  const heroCategoryList = findings.map((f) => f.name).join(", ");

  // MVP-Roadmap Phase 3 (siehe [[effivo_mvp_roadmap]]): erst NACH
  // syncCases() (oben, bereits awaited) abfragen, sonst Race Condition -
  // eine parallele Abfrage koennte laufen, bevor frisch erkannte Faelle in
  // der Case-Tabelle upserted sind, und veraltete Zahlen zeigen. Die beiden
  // Abfragen selbst duerfen parallel zueinander laufen.
  const [caseCounts, lastReviewedAt] = await Promise.all([getCaseCounts(company.id), getLastReviewedAt(company.id)]);

  const greetingName = user.firstName?.trim();
  const greeting = greetingName ? `Guten Tag, ${greetingName}` : "Guten Tag";
  const today = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentPeriodLabel = metrics.currentPeriod ? periodLabel(metrics.currentPeriod.periodMonth, metrics.currentPeriod.periodYear) : null;
  const lastUpdated = `heute, ${now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`;

  // Handlungsbedarf: solange kein Import existiert, auf den Upload
  // hinweisen; sobald mindestens einer wartet, auf die noch ausstehende
  // Spaltenzuordnung; zusaetzlich - sobald es tatsaechlich neue (Status
  // NEW) Faelle gibt - ein Hinweis darauf, verlinkt direkt gefiltert auf
  // die Fallpruefungs-Arbeitsliste (MVP-Roadmap Phase 3, siehe
  // [[effivo_mvp_roadmap]] - vorher hartcodiert "16 neue Fälle" mit falschem
  // Link auf /datenimporte statt /faelle).
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
  if (caseCounts.NEW > 0) {
    actionItems.push({
      id: "pending-findings",
      title: `${caseCounts.NEW} ${caseCounts.NEW === 1 ? "neuer Fall wartet" : "neue Fälle warten"} auf Prüfung`,
      subtitle: "Ø Prüfzeit 11 Minuten",
      icon: SearchIcon,
      accent: ACCENT_MAP.slate,
      href: "/arbeitgeber/dashboard/faelle?status=NEW",
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
  const activityItems: ActivityTimelineItem[] = recentActivity.map((a) => ({
    id: a.id,
    category: a.category,
    title: a.label,
    detail: a.detail,
    createdAt: a.createdAt,
    icon: a.icon,
    accent: ACCENT_MAP[a.color] ?? "teal",
  }));

  return (
    // "max-w-[1280px] mx-auto" bewusst hier statt im geteilten Layout
    // (layout.tsx spannt seinen eigenen Inhaltsbereich auf max-w-[1920px]
    // fuer alle Arbeitgeber-Seiten auf) - Design-Spezifikation gibt
    // "Max Content Width: 1280px" explizit vor (vormals 1360px aus dem
    // V12-Mockup); andere Seiten (Kunden, Auftraege, ...) nutzen weiterhin
    // 1920px.
    <div className={`relative mx-auto flex w-full max-w-[1280px] flex-col gap-6 ${dashFontScopeClass}`}>
      {/* Seiten-eigenes Ambient-Glow (Gold oben links / dezentes Blau unten
          rechts), 1:1 aus dem "Goldstandard"-Mockup (siehe
          [[effivo_mvp_roadmap]]) - bewusst asymmetrisch statt der frueheren
          Teal/Gold-Kombination in beiden oberen Ecken, nach mehreren
          Iterationsrunden mit dem Nutzer so freigegeben. Bewusst NICHT im
          geteilten layout.tsx (das hat bereits eigene, app-weite Blur-Orbs
          fuer alle Arbeitgeber-Seiten). Nur in dem Modus sichtbar, in dem
          --color-dash-* aktiv ist (beide Modi haben jetzt ein Gegenstueck,
          daher kein dark:-Filter mehr noetig wie bei der alten Teal-Version). */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-4 -z-10 h-[600px] overflow-hidden">
        <div className="absolute -top-40 left-[2%] h-[480px] w-[760px] rounded-full bg-dash-gold/[0.06] blur-[120px]" />
        <div className="absolute top-40 right-[-4%] h-[480px] w-[700px] rounded-full bg-dash-status-active/[0.04] blur-[120px]" />
      </div>
      <Pagehead
        greeting={greeting}
        companyName={company.name}
        today={today}
        currentPeriodLabel={currentPeriodLabel}
        dataStatusReady={processedMonthCount > 0}
      />

      <AttentionList items={actionItems} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-stretch">
        <FindingsHero
          totalAmount={heroTotalAmount}
          totalCount={heroTotalCount}
          categoryList={heroCategoryList}
          currentPeriodLabel={currentPeriodLabel}
          lastUpdated={lastUpdated}
        />
        <ReviewStatusCard findings={findings} lastReviewedAt={lastReviewedAt} />
      </div>

      <FindingsList findings={findings} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        <ReviewDonut counts={caseCounts} />
        <DataStatusCard
          processedMonthCount={processedMonthCount}
          processedRowCount={processedRowCount}
          pendingMappingCount={pendingMappingCount}
          failedImportCount={failedImportCount}
          currentPeriodLabel={currentPeriodLabel}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityTimeline items={activityItems} />
        <QuickActions
          hint={pendingMappingCount > 0 ? `${pendingMappingCount} ${pendingMappingCount === 1 ? "Datenimport" : "Datenimporte"} prüfen` : undefined}
        />
      </div>
    </div>
  );
}
