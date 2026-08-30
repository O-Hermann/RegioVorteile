import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember } from "@/lib/auth";
import { getCaseWithSource } from "@/lib/case-detail";
import { CASE_CATEGORY_LABELS, CASE_STATUS_LABELS, caseStatusBadgeClass } from "@/lib/case-labels";
import { formatEuroDetailed } from "@/lib/finance-format";
import { dashCardClass, dashSecondaryTextClass, dashMutedTextClass } from "@/components/dashboard/dash-ui";
import { PageNav } from "@/components/page-nav";
import { CaseStatusActions } from "@/components/case-status-actions";

// MVP-Roadmap Phase 5 (siehe [[effivo_mvp_roadmap]]): Case-Detail-Ansicht -
// beantwortet "warum wurde dieser Fall markiert?", indem sie die
// tatsaechlichen DataImportRecord-Rohdaten zeigt, die zum Fund gefuehrt
// haben (siehe case-detail.ts). Bewusst KEINE eigene Bearbeitungslogik
// (CaseStatusActions ist dieselbe Komponente wie auf der Arbeitsliste) -
// diese Seite ist ein zusaetzlicher, tieferer Blick auf einen bereits
// bekannten Fall, kein Ersatz fuer die Liste.
export default async function FallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { company } = await requireCompanyMember();
  const { id } = await params;

  const result = await getCaseWithSource(company.id, id);
  if (!result) notFound();
  const { caseItem, sourceRows } = result;

  const reviewerName = caseItem.reviewedByUser
    ? [caseItem.reviewedByUser.firstName, caseItem.reviewedByUser.lastName].filter(Boolean).join(" ") || caseItem.reviewedByUser.email
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageNav backHref="/arbeitgeber/dashboard/faelle" backLabel="Zurück zur Fallprüfung" />

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-dash-panel-soft px-2.5 py-0.5 text-xs font-semibold text-dash-text-secondary">
              {CASE_CATEGORY_LABELS[caseItem.category]}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${caseStatusBadgeClass(caseItem.status)}`}>
              {CASE_STATUS_LABELS[caseItem.status]}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-dash-text">{caseItem.who}</h1>
          <p className={`mt-1 ${dashSecondaryTextClass}`}>{caseItem.what}</p>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-bold text-dash-text">{formatEuroDetailed(caseItem.amount)}</span>
        </div>
      </div>

      <div className={`mt-6 flex flex-wrap items-center justify-between gap-4 p-5 ${dashCardClass}`}>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className={dashMutedTextClass}>Erkannt am</dt>
            <dd className="font-medium text-dash-text">{caseItem.createdAt.toLocaleDateString("de-DE")}</dd>
          </div>
          <div>
            <dt className={dashMutedTextClass}>Zuletzt geprüft</dt>
            <dd className="font-medium text-dash-text">
              {caseItem.reviewedAt ? `${caseItem.reviewedAt.toLocaleDateString("de-DE")}${reviewerName ? ` · ${reviewerName}` : ""}` : "Noch keine Prüfung"}
            </dd>
          </div>
        </dl>
        <CaseStatusActions caseId={caseItem.id} status={caseItem.status} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-dash-text">
          {sourceRows.length === 0
            ? "Rohdaten"
            : sourceRows.length === 1
              ? "Woher stammt dieser Fund?"
              : `Woher stammt dieser Fund? (${sourceRows.length} Belege)`}
        </h2>
        {sourceRows.length === 0 ? (
          <div className={`mt-3 p-6 text-center ${dashCardClass}`}>
            <p className={dashSecondaryTextClass}>
              Keine Rohdaten mehr verfügbar - der zugehörige Datenimport wurde möglicherweise gelöscht oder erneut verarbeitet.
            </p>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {sourceRows.map((row) => (
              <div key={row.recordId} className={`p-5 ${dashCardClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dash-line pb-3">
                  <Link
                    href={`/arbeitgeber/dashboard/datenimporte/${row.dataImportId}`}
                    className="text-sm font-semibold text-dash-gold hover:text-dash-gold-deep"
                  >
                    {row.dataImportFileName} →
                  </Link>
                  <span className={`text-xs ${dashMutedTextClass}`}>{row.dataImportPeriodLabel} · Zeile {row.fields.find((f) => f.label === "Zeile in Originaldatei")?.value}</span>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
                  {row.fields
                    .filter((f) => f.label !== "Zeile in Originaldatei")
                    .map((f) => (
                      <div key={f.label} className="flex justify-between gap-3 border-b border-dash-line/50 pb-1.5">
                        <dt className={dashMutedTextClass}>{f.label}</dt>
                        <dd className="text-right font-medium text-dash-text">{f.value}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
