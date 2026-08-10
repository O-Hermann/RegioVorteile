import { notFound, redirect } from "next/navigation";
import { requireCompanyMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COMPANY_IMPORT_UPLOAD_ROLES } from "@/lib/company";
import { DATA_IMPORT_CATEGORY_LABELS, periodLabel } from "@/lib/data-import";
import { parseFullSpreadsheetForProcessing, type MappingColumnDef } from "@/lib/import-process";
import { ImportParseError, stringifyCell } from "@/lib/import-parse";
import { IMPORT_FIELD_REGISTRY, computeColumnSignature, normalizeColumnName, detectColumnDataType } from "@/lib/import-fields";
import { suggestColumnMapping } from "@/lib/import-mapping-suggest";
import {
  ImportMappingEditor,
  type MappingColumnInitial,
  type MappingFieldOption,
  type MappingColumnOrigin,
} from "@/components/import-mapping-editor";
import { secondaryButtonClass } from "@/lib/ui";
import { BackLink } from "@/components/back-link";
import Link from "next/link";

// Anzahl Datenzeilen, die fuer die Datentyp-Erkennung/Beispielwerte
// betrachtet werden - bewusst begrenzt (unabhaengig vom bestehenden
// MAX_IMPORT_ROWS-Limit), da fuer diese rein anzeigende Heuristik die ersten
// Zeilen voellig ausreichen und keine 50.000 Zeilen durchlaufen werden muessen.
const DETECTION_SAMPLE_ROWS = 20;
const DISPLAY_SAMPLE_VALUES = 3;

export default async function DatenimportZuordnungPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { company, membership } = await requireCompanyMember();

  const dataImport = await prisma.dataImport.findFirst({
    where: { id, companyId: company.id },
    include: { mapping: true },
  });
  if (!dataImport) notFound();

  const detailHref = `/arbeitgeber/dashboard/datenimporte/${id}`;

  // PROCESSED/CANCELED: kein Bearbeitungsschritt mehr moeglich - die
  // Detailseite zeigt die verwendete Zuordnung dort bereits read-only an
  // (Punkt 41/54), ein zweiter, editierbar wirkender Ort dafuer waere
  // irrefuehrend.
  if (dataImport.status === "PROCESSED" || dataImport.status === "CANCELED") {
    redirect(detailHref);
  }

  const canEdit = COMPANY_IMPORT_UPLOAD_ROLES.includes(membership.role);

  let parsed: Awaited<ReturnType<typeof parseFullSpreadsheetForProcessing>>;
  try {
    const buffer = Buffer.from(dataImport.fileContent);
    parsed = await parseFullSpreadsheetForProcessing(dataImport.fileType, buffer, dataImport.selectedSheetName);
  } catch (err) {
    const message = err instanceof ImportParseError ? err.message : "Die Datei konnte nicht gelesen werden.";
    return (
      <div className="mx-auto max-w-[720px]">
        <BackLink href={detailHref} label="Zurück zum Datenimport" />
        <p className={`mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300`}>
          {message}
        </p>
        <Link href={detailHref} className={`mt-4 inline-flex ${secondaryButtonClass}`}>
          Zurück zum Datenimport
        </Link>
      </div>
    );
  }

  const { header, rows } = parsed;
  const detectionRows = rows.slice(0, DETECTION_SAMPLE_ROWS);
  const stringifiedColumns: string[][] = header.map((_, colIndex) =>
    detectionRows.map((row) => stringifyCell(row[colIndex] ?? null)).filter((v) => v !== ""),
  );

  const fields = IMPORT_FIELD_REGISTRY[dataImport.category];
  const fieldGroups: MappingFieldOption[][] = [];
  const groupOrder: string[] = [];
  for (const f of fields) {
    let groupIdx = groupOrder.indexOf(f.group);
    if (groupIdx === -1) {
      groupIdx = groupOrder.length;
      groupOrder.push(f.group);
      fieldGroups.push([]);
    }
    fieldGroups[groupIdx].push({ key: f.key, label: f.label, group: f.group });
  }
  const fieldGroupsOut = groupOrder.map((group, i) => ({ group, fields: fieldGroups[i] }));

  // Reihenfolge der Zuordnungsquelle (Punkt 12/19/22): eine bereits
  // gespeicherte Zuordnung geht vor einer Vorlage, eine Vorlage geht vor der
  // automatischen Vorschlagserkennung. Die Herkunft wird pro Spalte separat
  // vermerkt (nicht pauschal fuer die ganze Datei), da eine Vorlage nur
  // Spalten abdeckt, deren normalisierter Name tatsaechlich uebereinstimmt -
  // fuer nicht abgedeckte Spalten waere "aus Vorlage uebernommen" falsch.
  let initialTargets: (string | null)[];
  let origins: MappingColumnOrigin[];

  if (dataImport.mapping) {
    const saved = dataImport.mapping.columns as unknown as MappingColumnDef[];
    const byIndex = new Map(saved.map((c) => [c.index, c.targetField]));
    initialTargets = header.map((_, i) => byIndex.get(i) ?? null);
    origins = header.map(() => null);
  } else {
    const signature = computeColumnSignature(header);
    const template = await prisma.dataImportMappingTemplate.findUnique({
      where: { companyId_category_columnSignature: { companyId: company.id, category: dataImport.category, columnSignature: signature } },
    });
    if (template) {
      const templateColumns = template.columns as unknown as { sourceName: string; targetField: string | null }[];
      const byNormalizedName = new Map(templateColumns.map((c) => [normalizeColumnName(c.sourceName), c.targetField]));
      initialTargets = header.map((h) => byNormalizedName.get(normalizeColumnName(h)) ?? null);
      origins = initialTargets.map((t) => (t ? "template" : null));
    } else {
      const suggestions = suggestColumnMapping(dataImport.category, header, stringifiedColumns);
      initialTargets = suggestions.map((s) => s.suggestedFieldKey);
      origins = initialTargets.map((t) => (t ? "suggested" : null));
    }
  }

  const columns: MappingColumnInitial[] = header.map((h, i) => ({
    index: i,
    header: h,
    samples: stringifiedColumns[i].slice(0, DISPLAY_SAMPLE_VALUES),
    detectedType: detectColumnDataType(stringifiedColumns[i]),
    targetField: initialTargets[i],
    origin: origins[i],
  }));

  const initialErrorMessage =
    dataImport.status === "VALIDATION_FAILED" || dataImport.status === "FAILED" ? dataImport.errorMessage : null;

  return (
    <ImportMappingEditor
      dataImportId={dataImport.id}
      fileName={dataImport.fileName}
      periodLabel={periodLabel(dataImport.periodMonth, dataImport.periodYear)}
      categoryLabel={DATA_IMPORT_CATEGORY_LABELS[dataImport.category]}
      columns={columns}
      fieldGroups={fieldGroupsOut}
      // dataImport.rowCount stammt aus Phase 3 (beim Upload gespeicherte
      // Vorschau-Zeilenzahl) und zaehlte dort die Kopfzeile mit - fuer die
      // Anzeige "Datensätze zur Verarbeitung" zaehlen ausschliesslich die
      // hier frisch geparsten Datenzeilen (rows enthaelt die Kopfzeile
      // bereits nicht, siehe parseFullSpreadsheetForProcessing).
      rowCount={rows.length}
      canEdit={canEdit}
      initialErrorMessage={initialErrorMessage}
      detailHref={detailHref}
    />
  );
}
