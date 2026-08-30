import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseStoredImportPreview } from "@/lib/import-parse-excel";
import { COMPANY_IMPORT_UPLOAD_ROLES } from "@/lib/company";
import { findFieldDefinition, IGNORE_FIELD_KEY } from "@/lib/import-fields";
import type { MappingColumnDef } from "@/lib/import-process";
import {
  DATA_IMPORT_CATEGORY_LABELS,
  DATA_IMPORT_STATUS_LABELS,
  dataImportStatusBadgeClass,
  periodLabel,
  formatFileSize,
} from "@/lib/data-import";
import {
  dashCardClass,
  dashSecondaryTextClass,
  dashIconGlowClass,
  dashKebabPanelClass,
  dashKebabTriggerClass,
  dashPrimaryButtonClass,
  dashSecondaryButtonClass,
} from "@/components/dashboard/dash-ui";
import { ArrowLeftIcon, TargetIcon, CheckCircleIcon } from "@/components/icons";
import { PageNav } from "@/components/page-nav";
import { KebabMenu } from "@/components/kebab-menu";
import { DeleteImportDialog } from "@/components/data-import/delete-import-dialog";

export default async function DatenimportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // requireCompanyMember() liefert IMMER das Unternehmen der aktuellen Session
  // (nie aus der URL) - der Import wird danach ausschliesslich innerhalb
  // dieses Unternehmens gesucht. Gehoert der Import zu einem anderen
  // Unternehmen oder existiert er nicht, ist das Ergebnis in beiden Faellen
  // identisch (404), damit keine Existenz fremder Imports verraten wird.
  const { company, membership } = await requireCompanyMember();

  const dataImport = await prisma.dataImport.findFirst({
    where: { id, companyId: company.id },
    include: { uploadedByUser: true, processedByUser: true, mapping: true },
  });
  if (!dataImport) notFound();

  const canEdit = COMPANY_IMPORT_UPLOAD_ROLES.includes(membership.role);
  const zuordnungHref = `/arbeitgeber/dashboard/datenimporte/${dataImport.id}/zuordnung`;

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
      <PageNav backHref="/arbeitgeber/dashboard/datenimporte" backLabel="Zurück zu Datenimporten" />

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-dash-text">{dataImport.fileName}</h1>
          <p className={`mt-1 ${dashSecondaryTextClass}`}>
            {periodLabel(dataImport.periodMonth, dataImport.periodYear)} ·{" "}
            {DATA_IMPORT_CATEGORY_LABELS[dataImport.category]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${dataImportStatusBadgeClass(dataImport.status)}`}>
            {DATA_IMPORT_STATUS_LABELS[dataImport.status]}
          </span>
          {canEdit && (
            <KebabMenu panelClassName={dashKebabPanelClass} triggerClassName={dashKebabTriggerClass}>
              <DeleteImportDialog
                dataImportId={dataImport.id}
                fileName={dataImport.fileName}
                period={periodLabel(dataImport.periodMonth, dataImport.periodYear)}
                isProcessed={dataImport.status === "PROCESSED"}
              />
            </KebabMenu>
          )}
        </div>
      </div>

      <div className={`mt-6 !p-6 ${dashCardClass}`}>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-dash-text-faint">Zeitraum</dt>
            <dd className="mt-0.5 font-medium text-dash-text">
              {periodLabel(dataImport.periodMonth, dataImport.periodYear)}
            </dd>
          </div>
          <div>
            <dt className="text-dash-text-faint">Kategorie</dt>
            <dd className="mt-0.5 font-medium text-dash-text">
              {DATA_IMPORT_CATEGORY_LABELS[dataImport.category]}
            </dd>
          </div>
          <div>
            <dt className="text-dash-text-faint">Quellsystem</dt>
            <dd className="mt-0.5 font-medium text-dash-text">
              {dataImport.sourceSystem ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-dash-text-faint">Dateigröße</dt>
            <dd className="mt-0.5 font-medium text-dash-text">
              {formatFileSize(dataImport.fileSize)}
            </dd>
          </div>
          <div>
            <dt className="text-dash-text-faint">Hochgeladen von</dt>
            <dd className="mt-0.5 font-medium text-dash-text">{uploaderName}</dd>
          </div>
          <div>
            <dt className="text-dash-text-faint">Uploadzeitpunkt</dt>
            <dd className="mt-0.5 font-medium text-dash-text">
              {dataImport.createdAt.toLocaleDateString("de-DE")} ·{" "}
              {dataImport.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
            </dd>
          </div>
          {dataImport.selectedSheetName && (
            <div>
              <dt className="text-dash-text-faint">Tabellenblatt</dt>
              <dd className="mt-0.5 font-medium text-dash-text">
                {dataImport.selectedSheetName}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-dash-text-faint">Umfang</dt>
            <dd className="mt-0.5 font-medium text-dash-text">
              {dataImport.rowCount ?? "—"} Zeilen · {dataImport.columnCount ?? "—"} Spalten
            </dd>
          </div>
          {dataImport.status === "PROCESSED" && (
            <>
              <div>
                <dt className="text-dash-text-faint">Verarbeitet am</dt>
                <dd className="mt-0.5 font-medium text-dash-text">
                  {dataImport.processedAt?.toLocaleDateString("de-DE")} ·{" "}
                  {dataImport.processedAt?.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </dd>
              </div>
              <div>
                <dt className="text-dash-text-faint">Verarbeitet von</dt>
                <dd className="mt-0.5 font-medium text-dash-text">{processorName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-dash-text-faint">Datensätze</dt>
                <dd className="mt-0.5 font-medium text-dash-text">{dataImport.processedRowCount ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-dash-text-faint">Zugeordnete Spalten</dt>
                <dd className="mt-0.5 font-medium text-dash-text">{dataImport.mappedColumnCount ?? "—"}</dd>
              </div>
            </>
          )}
        </dl>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-dash-text">Technische Vorschau</h2>
        {previewError && <p className={`mt-3 text-sm ${dashSecondaryTextClass}`}>{previewError}</p>}
        {preview && (
          <div className={`mt-3 overflow-x-auto !p-0 ${dashCardClass}`}>
            <table className="w-full min-w-[480px] text-left text-sm">
              {preview.rows[0] && (
                <thead className="bg-dash-panel-soft">
                  <tr>
                    {preview.rows[0].map((cell, i) => (
                      <th key={i} className="whitespace-nowrap px-3 py-2.5 font-semibold text-dash-text-secondary">
                        {cell || `Spalte ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {preview.rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-t border-dash-line">
                    {row.map((cell, ci) => (
                      <td key={ci} className={`whitespace-nowrap px-3 py-2.5 ${dashSecondaryTextClass}`}>
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

      {dataImport.status === "PROCESSED" ? (
        <div className={`mt-6 !p-5 ${dashCardClass}`}>
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${"bg-dash-gold-glow text-dash-gold border border-dash-gold/30"}`}>
              <CheckCircleIcon className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-semibold text-dash-text">Verwendete Zuordnung</h2>
          </div>
          {usedMapping.length === 0 ? (
            <p className={`mt-3 text-sm ${dashSecondaryTextClass}`}>Keine Spaltenzuordnung hinterlegt.</p>
          ) : (
            <ul className="mt-4 divide-y divide-dash-line">
              {usedMapping.map((m, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className={dashSecondaryTextClass}>{m.sourceName}</span>
                  <span className="flex items-center gap-2 font-medium text-dash-text">
                    <ArrowLeftIcon className="h-3.5 w-3.5 rotate-180 text-dash-text-faint" />
                    {m.targetLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        (dataImport.status === "READY_FOR_MAPPING" || dataImport.status === "VALIDATION_FAILED" || dataImport.status === "FAILED") && (
          <div className={`relative mt-6 overflow-hidden !p-6 ${dashCardClass}`}>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-dash-gold/[0.08] blur-3xl"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${dashIconGlowClass}`}>
                  <TargetIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-semibold text-dash-text">
                    {canEdit ? "Bereit für die Spaltenzuordnung" : "Spaltenzuordnung ausstehend"}
                  </p>
                  <p className={`mt-0.5 max-w-md text-sm ${dashSecondaryTextClass}`}>
                    {canEdit
                      ? "Ordnen Sie die Spalten dieser Datei den passenden Effivo-Feldern zu, um den Import zu verarbeiten."
                      : "Ein Inhaber, Unternehmensadmin oder die Buchhaltung kann diesen Import zuordnen und verarbeiten."}
                  </p>
                </div>
              </div>
              <Link href={zuordnungHref} className={`shrink-0 !px-6 !py-3 ${dashPrimaryButtonClass}`}>
                <TargetIcon className="mr-1.5 h-4 w-4" />
                {canEdit ? "Spalten zuordnen" : "Zuordnung ansehen"}
              </Link>
            </div>
          </div>
        )
      )}

      <Link href="/arbeitgeber/dashboard/datenimporte" className={`mt-6 inline-flex ${dashSecondaryButtonClass}`}>
        Zurück zur Importhistorie
      </Link>
    </div>
  );
}
