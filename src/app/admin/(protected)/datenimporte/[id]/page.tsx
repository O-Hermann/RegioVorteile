import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStoredImportPreview } from "@/lib/import-parse-excel";
import { findFieldDefinition, IGNORE_FIELD_KEY } from "@/lib/import-fields";
import type { MappingColumnDef } from "@/lib/import-process";
import {
  DATA_IMPORT_CATEGORY_LABELS,
  DATA_IMPORT_STATUS_LABELS,
  dataImportStatusBadgeClass,
  periodLabel,
  formatFileSize,
} from "@/lib/data-import";
import { importPanelClass, importSecondaryTextClass, importIconBadgeClass } from "@/lib/import-ui";
import { secondaryButtonClass } from "@/lib/ui";
import { ArrowLeftIcon, CheckCircleIcon } from "@/components/icons";

export default async function AdminDatenimportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const dataImport = await prisma.dataImport.findUnique({
    where: { id },
    include: { company: true, uploadedByUser: true, processedByUser: true, mapping: true },
  });
  if (!dataImport) notFound();

  const uploaderName =
    [dataImport.uploadedByUser.firstName, dataImport.uploadedByUser.lastName].filter(Boolean).join(" ") ||
    dataImport.uploadedByUser.email;
  const processorName = dataImport.processedByUser
    ? [dataImport.processedByUser.firstName, dataImport.processedByUser.lastName].filter(Boolean).join(" ") ||
      dataImport.processedByUser.email
    : null;

  const usedMapping =
    dataImport.status === "PROCESSED" && dataImport.mapping
      ? (dataImport.mapping.columns as unknown as MappingColumnDef[])
          .filter((c) => c.targetField && c.targetField !== IGNORE_FIELD_KEY)
          .map((c) => ({
            sourceName: c.sourceName,
            targetLabel: findFieldDefinition(dataImport.category, c.targetField as string)?.label ?? c.targetField,
          }))
      : [];

  let preview: { rows: string[][]; rowCount: number; columnCount: number } | null = null;
  let previewError: string | null = null;
  try {
    preview = await parseStoredImportPreview(dataImport.fileType, Buffer.from(dataImport.fileContent), dataImport.selectedSheetName);
  } catch {
    previewError = "Die Vorschau konnte nicht erneut geladen werden.";
  }

  return (
    <div>
      <Link
        href="/admin/datenimporte"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-500 hover:text-sand-900 dark:text-cockpit-text-secondary dark:hover:text-cockpit-heading"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Zurück zu Datenimporte
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">{dataImport.fileName}</h1>
          <p className={`mt-1 ${importSecondaryTextClass}`}>
            {dataImport.company.name} · {periodLabel(dataImport.periodMonth, dataImport.periodYear)} ·{" "}
            {DATA_IMPORT_CATEGORY_LABELS[dataImport.category]}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${dataImportStatusBadgeClass(dataImport.status)}`}>
          {DATA_IMPORT_STATUS_LABELS[dataImport.status]}
        </span>
      </div>

      <div className={`mt-6 !p-6 ${importPanelClass}`}>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-sand-500 dark:text-cockpit-text-weak">Unternehmen</dt>
            <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">{dataImport.company.name}</dd>
          </div>
          <div>
            <dt className="text-sand-500 dark:text-cockpit-text-weak">Zeitraum</dt>
            <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">
              {periodLabel(dataImport.periodMonth, dataImport.periodYear)}
            </dd>
          </div>
          <div>
            <dt className="text-sand-500 dark:text-cockpit-text-weak">Kategorie</dt>
            <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">
              {DATA_IMPORT_CATEGORY_LABELS[dataImport.category]}
            </dd>
          </div>
          <div>
            <dt className="text-sand-500 dark:text-cockpit-text-weak">Quellsystem</dt>
            <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">
              {dataImport.sourceSystem ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sand-500 dark:text-cockpit-text-weak">Dateigröße</dt>
            <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">
              {formatFileSize(dataImport.fileSize)}
            </dd>
          </div>
          <div>
            <dt className="text-sand-500 dark:text-cockpit-text-weak">Hochgeladen von</dt>
            <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">{uploaderName}</dd>
          </div>
          <div>
            <dt className="text-sand-500 dark:text-cockpit-text-weak">Uploadzeitpunkt</dt>
            <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">
              {dataImport.createdAt.toLocaleDateString("de-DE")} ·{" "}
              {dataImport.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
            </dd>
          </div>
          <div>
            <dt className="text-sand-500 dark:text-cockpit-text-weak">Umfang</dt>
            <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">
              {dataImport.rowCount ?? "—"} Zeilen · {dataImport.columnCount ?? "—"} Spalten
            </dd>
          </div>
          {dataImport.status === "PROCESSED" && (
            <>
              <div>
                <dt className="text-sand-500 dark:text-cockpit-text-weak">Verarbeitet am</dt>
                <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">
                  {dataImport.processedAt?.toLocaleDateString("de-DE")} ·{" "}
                  {dataImport.processedAt?.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </dd>
              </div>
              <div>
                <dt className="text-sand-500 dark:text-cockpit-text-weak">Verarbeitet von</dt>
                <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">{processorName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sand-500 dark:text-cockpit-text-weak">Datensätze</dt>
                <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">{dataImport.processedRowCount ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sand-500 dark:text-cockpit-text-weak">Zugeordnete Spalten</dt>
                <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">{dataImport.mappedColumnCount ?? "—"}</dd>
              </div>
            </>
          )}
          {dataImport.errorMessage && dataImport.status !== "PROCESSED" && (
            <div className="sm:col-span-2">
              <dt className="text-sand-500 dark:text-cockpit-text-weak">Fehlerstatus</dt>
              <dd className="mt-0.5 font-medium text-rose-700 dark:text-rose-300">{dataImport.errorMessage}</dd>
            </div>
          )}
        </dl>
      </div>

      {dataImport.status === "PROCESSED" && (
        <div className={`mt-6 !p-5 ${importPanelClass}`}>
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${importIconBadgeClass}`}>
              <CheckCircleIcon className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-semibold text-sand-900 dark:text-cockpit-heading">Verwendete Zuordnung</h2>
          </div>
          {usedMapping.length === 0 ? (
            <p className={`mt-3 text-sm ${importSecondaryTextClass}`}>Keine Spaltenzuordnung hinterlegt.</p>
          ) : (
            <ul className="mt-4 divide-y divide-card-border/60 dark:divide-white/5">
              {usedMapping.map((m, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className={importSecondaryTextClass}>{m.sourceName}</span>
                  <span className="font-medium text-sand-900 dark:text-cockpit-text">{m.targetLabel}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold text-sand-900">Technische Vorschau</h2>
        {previewError && <p className={`mt-3 text-sm ${importSecondaryTextClass}`}>{previewError}</p>}
        {preview && (
          <div className={`mt-3 overflow-x-auto !p-0 ${importPanelClass}`}>
            <table className="w-full min-w-[480px] text-left text-sm">
              {preview.rows[0] && (
                <thead className="bg-sand-50 dark:bg-white/5">
                  <tr>
                    {preview.rows[0].map((cell, i) => (
                      <th key={i} className="whitespace-nowrap px-3 py-2.5 font-semibold text-sand-700 dark:text-cockpit-text">
                        {cell || `Spalte ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {preview.rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-t border-card-border/70 dark:border-white/5">
                    {row.map((cell, ci) => (
                      <td key={ci} className={`whitespace-nowrap px-3 py-2.5 ${importSecondaryTextClass}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Link href="/admin/datenimporte" className={`mt-6 inline-flex ${secondaryButtonClass}`}>
        Zurück zu Datenimporte
      </Link>
    </div>
  );
}
