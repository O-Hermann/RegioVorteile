import Link from "next/link";
import { requireCompanyMember } from "@/lib/auth";
import { syncCases } from "@/lib/case-sync";
import { getCases, getCaseCounts } from "@/lib/cases";
import { CASE_CATEGORY_LABELS, CASE_STATUS_LABELS, caseStatusBadgeClass, isCaseCategory, type CaseStatusFilter } from "@/lib/case-labels";
import { importPanelClass, importSecondaryTextClass } from "@/lib/import-ui";
import { PageNav } from "@/components/page-nav";
import { CaseStatusActions } from "@/components/case-status-actions";

// MVP-Roadmap Phase 2.2/2.3 (siehe [[effivo_mvp_roadmap]]): die Fallpruefungs-
// Arbeitsliste, auf die die "Alle Fälle prüfen"/"X Fälle ansehen"-Buttons auf
// der Effivo-Übersicht verlinken. Bewusst mit der STANDARD-App-Optik
// (importPanelClass etc., wie Kunden/Aufträge/Datenimporte) statt des
// Dashboard-eigenen dash-scope (Libre Franklin/Teal) - die dash-scope-
// Behandlung war explizit als "nur diese eine Seite" (Effivo-Übersicht)
// entschieden, siehe [[controlling_cockpit_v12_dashboard_port]]; diese Seite
// ist eher eine operative Listenseite wie die anderen und folgt daher deren
// etabliertem Muster statt einer neuen, ungefragten Ausweitung des dash-scope.
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

export default async function FaellePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>;
}) {
  const { company } = await requireCompanyMember();
  const { status, category } = await searchParams;
  const statusFilter: CaseStatusFilter = isCaseStatusFilter(status) ? status : "all";
  const categoryFilter = isCaseCategory(category) ? category : "all";

  await syncCases(company.id);
  const [cases, counts] = await Promise.all([getCases(company.id, statusFilter, categoryFilter), getCaseCounts(company.id)]);

  return (
    <div>
      <PageNav backHref="/arbeitgeber/dashboard" backLabel="Zurück zur Übersicht" />
      <div className="mt-2">
        <h1 className="font-display text-3xl font-semibold text-sand-900">Fallprüfung</h1>
        <p className={`mt-2 max-w-xl ${importSecondaryTextClass}`}>
          Alle automatisch erkannten Fälle (Doppelzahlungen, verpasste Skonti, offene Gutschriften, mögliche Überzahlungen) an einem Ort.
        </p>
      </div>

      {categoryFilter !== "all" && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={importSecondaryTextClass}>Gefiltert nach:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-700 dark:bg-white/10 dark:text-cockpit-text">
            {CASE_CATEGORY_LABELS[categoryFilter]}
            <Link href={statusTabHref(statusFilter, undefined)} aria-label="Kategorie-Filter entfernen" className="hover:text-ink-900 dark:hover:text-white">
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
                ? "border-ink-600 bg-ink-600 text-white"
                : "border-card-border bg-card text-sand-700 hover:bg-sand-100 dark:text-cockpit-text-secondary dark:hover:bg-white/5"
            }`}
          >
            {tab.label}
            <span className={statusFilter === tab.value ? "text-white/80" : "text-sand-400 dark:text-cockpit-text-weak"}>{counts[tab.value]}</span>
          </Link>
        ))}
      </div>

      {cases.length === 0 ? (
        <div className={`mt-8 !p-10 text-center ${importPanelClass}`}>
          <p className={importSecondaryTextClass}>Keine Fälle in diesem Status.</p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {cases.map((c) => (
            <div key={c.id} className={`flex flex-wrap items-center justify-between gap-4 !p-4 ${importPanelClass}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-semibold text-sand-600 dark:bg-white/5 dark:text-cockpit-text-secondary">
                    {CASE_CATEGORY_LABELS[c.category]}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${caseStatusBadgeClass(c.status)}`}>
                    {CASE_STATUS_LABELS[c.status]}
                  </span>
                </div>
                <p className="mt-1.5 font-semibold text-sand-900 dark:text-cockpit-text">{c.who}</p>
                <p className={`text-sm ${importSecondaryTextClass}`}>{c.what}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="font-display text-lg font-bold text-sand-900 dark:text-cockpit-text">{c.amount}</span>
                <CaseStatusActions caseId={c.id} status={c.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
