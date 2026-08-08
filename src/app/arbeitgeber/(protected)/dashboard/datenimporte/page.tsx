import Link from "next/link";
import { requireCompanyMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COMPANY_IMPORT_UPLOAD_ROLES } from "@/lib/company";
import {
  DATA_IMPORT_CATEGORY_LABELS,
  DATA_IMPORT_STATUS_LABELS,
  dataImportStatusBadgeClass,
  periodLabel,
  formatFileSize,
} from "@/lib/data-import";
import { importPanelClass, importSecondaryTextClass, importIconGlowClass } from "@/lib/import-ui";
import { primaryButtonClass } from "@/lib/ui";
import { UploadIcon, EyeIcon } from "@/components/icons";

export default async function DatenimportePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { company, membership } = await requireCompanyMember();
  const { error } = await searchParams;
  const canUpload = COMPANY_IMPORT_UPLOAD_ROLES.includes(membership.role);

  const imports = await prisma.dataImport.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    include: { uploadedByUser: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">Datenimporte</h1>
          <p className={`mt-2 max-w-xl ${importSecondaryTextClass}`}>
            Verwalten Sie Ihre hochgeladenen Unternehmensdaten und verfolgen Sie deren Verarbeitungsstatus.
          </p>
        </div>
        {canUpload && (
          <Link href="/arbeitgeber/dashboard/datenimporte/neu" className={primaryButtonClass}>
            + Neuer Datenimport
          </Link>
        )}
      </div>

      {error === "forbidden" && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          Für den Datenimport-Upload fehlt Ihnen die notwendige Berechtigung.
        </p>
      )}

      {imports.length === 0 ? (
        <div className={`relative mx-auto mt-10 max-w-[820px] overflow-hidden !p-10 text-center ${importPanelClass}`}>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cockpit-accent-light/10 blur-3xl opacity-0 dark:opacity-100"
          />
          <span className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full ${importIconGlowClass}`}>
            <UploadIcon className="h-7 w-7" />
          </span>
          <h2 className="relative mt-5 font-display text-xl font-semibold text-sand-900">Noch keine Datenimporte</h2>
          <p className={`relative mx-auto mt-2 max-w-md text-sm leading-relaxed ${importSecondaryTextClass}`}>
            {canUpload
              ? "Laden Sie Ihre erste Excel- oder CSV-Datei hoch. Effivo zeigt Ihnen zunächst eine Vorschau und bereitet die Daten anschließend für die Zuordnung vor."
              : "Sobald ein Datenimport hochgeladen wurde, erscheint er hier mit Zeitraum, Kategorie und Status."}
          </p>
          {canUpload && (
            <Link href="/arbeitgeber/dashboard/datenimporte/neu" className={`relative mt-5 inline-flex ${primaryButtonClass}`}>
              Ersten Datenimport starten
            </Link>
          )}
          <p className={`relative mt-4 text-xs ${importSecondaryTextClass}`}>XLSX und CSV · maximal 10 MB</p>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold text-sand-900">Importhistorie</h2>
          <div className={`mt-3 overflow-x-auto !p-0 ${importPanelClass}`}>
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-sand-50 dark:bg-white/5">
                <tr className="text-xs uppercase tracking-wide text-sand-500 dark:text-cockpit-text-weak">
                  <th className="px-4 py-3 font-semibold">Zeitraum</th>
                  <th className="px-4 py-3 font-semibold">Kategorie</th>
                  <th className="px-4 py-3 font-semibold">Dateiname</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Hochgeladen von</th>
                  <th className="px-4 py-3 font-semibold">Datum</th>
                  <th className="px-4 py-3 font-semibold">Größe</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {imports.map((i) => {
                  const uploaderName =
                    [i.uploadedByUser.firstName, i.uploadedByUser.lastName].filter(Boolean).join(" ") ||
                    i.uploadedByUser.email;
                  return (
                    <tr
                      key={i.id}
                      className="border-t border-card-border/70 transition-colors hover:bg-sand-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-sand-900 dark:text-cockpit-text">
                        {periodLabel(i.periodMonth, i.periodYear)}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3.5 ${importSecondaryTextClass}`}>
                        {DATA_IMPORT_CATEGORY_LABELS[i.category]}
                      </td>
                      <td className={`max-w-[220px] truncate px-4 py-3.5 ${importSecondaryTextClass}`}>{i.fileName}</td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${dataImportStatusBadgeClass(i.status)}`}>
                          {DATA_IMPORT_STATUS_LABELS[i.status]}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3.5 ${importSecondaryTextClass}`}>{uploaderName}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sand-500 dark:text-cockpit-text-weak">
                        {i.createdAt.toLocaleDateString("de-DE")} ·{" "}
                        {i.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sand-500 dark:text-cockpit-text-weak">
                        {formatFileSize(i.fileSize)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <Link
                          href={`/arbeitgeber/dashboard/datenimporte/${i.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-card-border dark:border-white/15 px-3 py-1.5 text-xs font-semibold text-sand-800 dark:text-cockpit-text hover:border-ink-400 dark:hover:border-cockpit-accent-light/50 hover:text-ink-700 dark:hover:text-cockpit-accent-light transition-colors"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                          Ansehen
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
