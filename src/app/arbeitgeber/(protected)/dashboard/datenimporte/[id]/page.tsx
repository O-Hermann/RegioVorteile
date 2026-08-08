import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSpreadsheetPreview } from "@/lib/import-parse";
import {
  DATA_IMPORT_CATEGORY_LABELS,
  DATA_IMPORT_STATUS_LABELS,
  dataImportStatusBadgeClass,
  periodLabel,
  formatFileSize,
} from "@/lib/data-import";
import { cardClass, secondaryButtonClass } from "@/lib/ui";
import { ArrowLeftIcon, InboxIcon } from "@/components/icons";

export default async function DatenimportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // requireCompanyMember() liefert IMMER das Unternehmen der aktuellen Session
  // (nie aus der URL) - der Import wird danach ausschliesslich innerhalb
  // dieses Unternehmens gesucht. Gehoert der Import zu einem anderen
  // Unternehmen oder existiert er nicht, ist das Ergebnis in beiden Faellen
  // identisch (404), damit keine Existenz fremder Imports verraten wird.
  const { company } = await requireCompanyMember();

  const dataImport = await prisma.dataImport.findFirst({
    where: { id, companyId: company.id },
    include: { uploadedByUser: true },
  });
  if (!dataImport) notFound();

  const uploaderName =
    [dataImport.uploadedByUser.firstName, dataImport.uploadedByUser.lastName].filter(Boolean).join(" ") ||
    dataImport.uploadedByUser.email;

  let preview: { rows: string[][]; rowCount: number; columnCount: number } | null = null;
  let previewError: string | null = null;
  try {
    const fileType = dataImport.fileType as "xlsx" | "xls" | "csv";
    preview = parseSpreadsheetPreview(
      new Uint8Array(dataImport.fileContent),
      fileType,
      dataImport.selectedSheetName ?? undefined,
    );
  } catch {
    previewError = "Die Vorschau konnte nicht erneut geladen werden.";
  }

  return (
    <div>
      <Link
        href="/arbeitgeber/dashboard/datenimporte"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-500 hover:text-sand-900 dark:text-cockpit-text-secondary dark:hover:text-cockpit-heading"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Zurück zur Importhistorie
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">{dataImport.fileName}</h1>
          <p className="mt-1 text-sand-600 dark:text-cockpit-text-secondary">
            {periodLabel(dataImport.periodMonth, dataImport.periodYear)} ·{" "}
            {DATA_IMPORT_CATEGORY_LABELS[dataImport.category]}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${dataImportStatusBadgeClass(dataImport.status)}`}>
          {DATA_IMPORT_STATUS_LABELS[dataImport.status]}
        </span>
      </div>

      <div className={`mt-6 ${cardClass}`}>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
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
          {dataImport.selectedSheetName && (
            <div>
              <dt className="text-sand-500 dark:text-cockpit-text-weak">Tabellenblatt</dt>
              <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">
                {dataImport.selectedSheetName}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sand-500 dark:text-cockpit-text-weak">Umfang</dt>
            <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">
              {dataImport.rowCount ?? "—"} Zeilen · {dataImport.columnCount ?? "—"} Spalten
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <h2 className="font-display text-lg font-semibold text-sand-900">Technische Vorschau</h2>
        {previewError && (
          <p className="mt-3 text-sm text-sand-500 dark:text-cockpit-text-secondary">{previewError}</p>
        )}
        {preview && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-card-border dark:border-white/10">
            <table className="w-full min-w-[480px] text-left text-sm">
              {preview.rows[0] && (
                <thead className="bg-sand-50 dark:bg-white/5">
                  <tr>
                    {preview.rows[0].map((cell, i) => (
                      <th key={i} className="whitespace-nowrap px-3 py-2 font-semibold text-sand-700 dark:text-cockpit-text">
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
                      <td key={ci} className="whitespace-nowrap px-3 py-2 text-sand-600 dark:text-cockpit-text-secondary">
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

      <div className={`mt-6 flex items-center gap-3 ${cardClass}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/30">
          <InboxIcon className="h-4 w-4" />
        </span>
        <p className="text-sm text-sand-600 dark:text-cockpit-text-secondary">
          Dieser Datenimport ist bereit für die Spaltenzuordnung. Im nächsten Verarbeitungsschritt werden
          die vorhandenen Spalten Effivo-Kennzahlen zugeordnet.
        </p>
      </div>

      <Link href="/arbeitgeber/dashboard/datenimporte" className={`mt-6 inline-flex ${secondaryButtonClass}`}>
        Zurück zur Importhistorie
      </Link>
    </div>
  );
}
