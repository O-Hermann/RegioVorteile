import Link from "next/link";
import { requireCompanyMember } from "@/lib/auth";
import { syncCases } from "@/lib/case-sync";
import { getCases, getCaseCounts } from "@/lib/cases";
import { CASE_CATEGORY_LABELS, CASE_STATUS_LABELS, caseStatusBadgeClass, isCaseCategory, type CaseStatusFilter } from "@/lib/case-labels";
import { dashCardClass, dashModuleHoverClass, dashSecondaryTextClass, dashMutedTextClass } from "@/components/dashboard/dash-ui";
import { PageNav } from "@/components/page-nav";
import { CaseStatusActions } from "@/components/case-status-actions";

// MVP-Roadmap Phase 2.2/2.3 (siehe [[effivo_mvp_roadmap]]): die Fallpruefungs-
// Arbeitsliste, auf die die "Alle Fälle prüfen"/"X Fälle ansehen"-Buttons auf
// der Effivo-Übersicht verlinken.
//
// Goldstandard-Rollout Phase 2 (2026-08-30, siehe [[effivo_mvp_roadmap]]):
// nutzt jetzt dieselben dash-*-Bausteine wie die Übersicht-Seite (vormals
// bewusst die "Standard"-App-Optik via import-ui.ts, siehe
// [[controlling_cockpit_v12_dashboard_port]] fuer die damalige Begruendung) -
// die App-weite Design-Vereinheitlichung war zu dem Zeitpunkt noch nicht
// beschlossen, ist es jetzt (Phase 2 dieser Roadmap).
//
// syncCases() wird bei jedem Aufruf erneut ausgefuehrt (wie auf der
// Übersicht-Seite) - stellt sicher, dass neu erkannte Faelle (z.B. nach
// einem frischen Datenimport) sofort hier auftauchen, ohne den
// Bearbeitungsstatus bereits vorhandener Faelle zu beruehren.
//
// Zwei unabhaengig kombinierbare Filter: "status" (Tabs, siehe STATUS_TABS)
// und "category" (kein eigenes Tab-UI, sondern nur ueber Links von den
// einzelnen Fund-Kategorien-Karten der Übersicht gesetzt - z.B. verlinkt die
// Doppelzahlungen-Karte auf ?category=DUPLICATE_PAYMENT). Ist "category"
// aktiv, zeigt die Seite einen Hinweis-Chip mit Link zum Entfernen des Filters.
const STATUS_TABS: { value: CaseStatusFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "NEW", label: "Neu" },
  { value: "IN_REVIEW", label: "In Prüfung" },
  { value: "REVIEWED", label: "Geprüft" },
  { value: "CLOSED", label: "Abgeschlossen" },
  { value: "FALSE_POSITIVE", label: "Kein echter Fund" },
];

function isCaseStatusFilter(value: string | undefined): value is CaseStatusFilter {
  return !!value && STATUS_TABS.some((t) => t.value === value);
}

function statusTabHref(status: CaseStatusFilter, category: string | undefined): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (category) params.set("category", category);
  const qs = params.toString();
  return qs ? `/arbeitgeber/dashboard/faelle?${qs}` : "/arbeitgeber/dashboard/faelle";
}

function pageHref(status: CaseStatusFilter, category: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/arbeitgeber/dashboard/faelle?${qs}` : "/arbeitgeber/dashboard/faelle";
}

export default async function FaellePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; page?: string }>;
}) {
  const { company } = await requireCompanyMember();
  const { status, category, page } = await searchParams;
  const statusFilter: CaseStatusFilter = isCaseStatusFilter(status) ? status : "all";
  const categoryFilter = isCaseCategory(category) ? category : "all";
  const pageNum = Number(page) > 0 ? Number(page) : 1;

  await syncCases(company.id);
  const [result, counts] = await Promise.all([getCases(company.id, statusFilter, categoryFilter, pageNum), getCaseCounts(company.id)]);
  const cases = result.items;

  return (
    <div>
      <PageNav backHref="/arbeitgeber/dashboard" backLabel="Zurück zur Übersicht" />
      <div className="mt-2">
        <h1 className="text-3xl font-semibold text-dash-text">Fallprüfung</h1>
        <p className={`mt-2 max-w-xl ${dashSecondaryTextClass}`}>
          Alle automatisch erkannten Fälle (Doppelzahlungen, verpasste Skonti, offene Gutschriften, mögliche Überzahlungen) an einem Ort.
        </p>
      </div>

      {categoryFilter !== "all" && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={dashSecondaryTextClass}>Gefiltert nach:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-dash-gold-glow px-2.5 py-1 text-xs font-semibold text-dash-gold">
            {CASE_CATEGORY_LABELS[categoryFilter]}
            <Link href={statusTabHref(statusFilter, undefined)} aria-label="Kategorie-Filter entfernen" className="hover:text-dash-gold-deep">
              ×
            </Link>
          </span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={statusTabHref(tab.value, category)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "border-dash-gold/50 bg-dash-panel-soft text-dash-gold shadow-[inset_0_0_0_1px_rgba(226,188,107,0.12)]"
                : "border-dash-line bg-dash-panel text-dash-text-secondary hover:bg-dash-panel-soft"
            }`}
          >
            {tab.label}
            <span className={statusFilter === tab.value ? "text-dash-gold/70" : "text-dash-text-faint"}>{counts[tab.value]}</span>
          </Link>
        ))}
      </div>

      {cases.length === 0 ? (
        <div className={`mt-8 p-10 text-center ${dashCardClass}`}>
          <p className={dashSecondaryTextClass}>Keine Fälle in diesem Status.</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {cases.map((c) => (
            <div
              key={c.id}
              className={`relative flex flex-col items-stretch gap-4 p-4 sm:flex-row sm:items-start sm:justify-between ${dashCardClass} ${dashModuleHoverClass}`}
            >
              {/* Stretched-Link-Muster (siehe Kunden-/Auftraege-Tabellen):
                  die gesamte Karte ist klickbar zur Case-Detail-Ansicht
                  (Phase 5, siehe [[effivo_mvp_roadmap]]), die
                  Status-Aktionsbuttons rechts bleiben ueber "relative z-10"
                  unabhaengig klickbar. */}
              <Link href={`/arbeitgeber/dashboard/faelle/${c.id}`} className="absolute inset-0 z-0" aria-label={`Fall ${c.who} ansehen`} />
              <div className="relative min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-dash-panel-soft px-2.5 py-0.5 text-xs font-semibold text-dash-text-secondary">
                    {CASE_CATEGORY_LABELS[c.category]}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${caseStatusBadgeClass(c.status)}`}>
                    {CASE_STATUS_LABELS[c.status]}
                  </span>
                </div>
                <p title={c.who} className="mt-1.5 truncate font-semibold text-dash-text">
                  {c.who}
                </p>
                <p title={c.what} className={`truncate text-sm ${dashMutedTextClass}`}>
                  {c.what}
                </p>
              </div>
              <div className="relative z-10 flex shrink-0 items-center gap-4">
                <span className="text-lg font-bold text-dash-text">{c.amount}</span>
                <CaseStatusActions caseId={c.id} status={c.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {result.pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href={pageHref(statusFilter, category, result.page - 1)}
            aria-disabled={result.page <= 1}
            className={`rounded-full border border-dash-line px-4 py-2 text-xs font-semibold text-dash-text transition-colors ${
              result.page <= 1 ? "pointer-events-none opacity-40" : "hover:border-dash-gold/40 hover:text-dash-gold"
            }`}
          >
            Zurück
          </Link>
          <span className={`text-xs ${dashSecondaryTextClass}`}>
            Seite {result.page} von {result.pageCount}
          </span>
          <Link
            href={pageHref(statusFilter, category, result.page + 1)}
            aria-disabled={result.page >= result.pageCount}
            className={`rounded-full border border-dash-line px-4 py-2 text-xs font-semibold text-dash-text transition-colors ${
              result.page >= result.pageCount ? "pointer-events-none opacity-40" : "hover:border-dash-gold/40 hover:text-dash-gold"
            }`}
          >
            Weiter
          </Link>
        </div>
      )}
    </div>
  );
}
