import "server-only";
import { Prisma } from "@/generated/prisma/client";
import type { DataImportCategory } from "@/generated/prisma/client";
import { parseCsvFull } from "@/lib/import-parse";
import { parseExcelFullServer, type ExcelCellRaw } from "@/lib/import-parse-excel";
import { MAX_IMPORT_CELL_TEXT_LENGTH } from "@/lib/data-import";
import {
  findFieldDefinition,
  normalizeNumberFromString,
  normalizeDateFromString,
  normalizeStatusValue,
  IGNORE_FIELD_KEY,
} from "@/lib/import-fields";

// Server-only: buendelt exceljs (ueber import-parse-excel) und darf nicht ins
// Client-Bundle gelangen (siehe dortiger Kommentar).

export type MappingColumnDef = { index: number; sourceName: string; targetField: string | null };

export async function parseFullSpreadsheetForProcessing(
  fileType: string,
  buffer: Buffer,
  selectedSheetName: string | null,
): Promise<{ header: string[]; rows: ExcelCellRaw[][] }> {
  if (fileType === "csv") {
    const { header, rows } = parseCsvFull(new Uint8Array(buffer));
    return { header, rows };
  }
  return parseExcelFullServer(buffer, selectedSheetName ?? undefined);
}

// Sanitisiert eine vom Client eingereichte Zuordnung gegen die tatsaechlich
// (serverseitig neu geparste) Kopfzeile: unbekannte Indizes/Zielfeldschluessel
// werden verworfen. Doppelte Zielfelder werden hier bewusst NICHT aufgeloest -
// das entscheidet der Aufrufer (Entwurf speichern erlaubt sie vorlaeufig,
// Verarbeitung bestaetigen lehnt sie hart ab, siehe actions/data-import-mapping.ts).
export function sanitizeMappingColumns(
  category: DataImportCategory,
  header: string[],
  submitted: MappingColumnDef[],
): { columns: MappingColumnDef[]; duplicateFieldKeys: string[] } {
  const submittedByIndex = new Map(submitted.map((c) => [c.index, c]));
  const columns: MappingColumnDef[] = header.map((sourceName, index) => {
    const s = submittedByIndex.get(index);
    if (!s) return { index, sourceName, targetField: null };
    const targetField =
      s.targetField === IGNORE_FIELD_KEY || (s.targetField && findFieldDefinition(category, s.targetField))
        ? s.targetField
        : null;
    return { index, sourceName, targetField };
  });

  const seen = new Map<string, number>();
  for (const c of columns) {
    if (!c.targetField || c.targetField === IGNORE_FIELD_KEY) continue;
    seen.set(c.targetField, (seen.get(c.targetField) ?? 0) + 1);
  }
  const duplicateFieldKeys = [...seen.entries()].filter(([, count]) => count > 1).map(([key]) => key);

  return { columns, duplicateFieldKeys };
}

function normalizeTextCell(raw: ExcelCellRaw): string | null {
  if (raw === null || raw === undefined) return null;
  const s = (raw instanceof Date ? raw.toLocaleDateString("de-DE") : String(raw)).trim();
  if (s === "") return null;
  return s.length > MAX_IMPORT_CELL_TEXT_LENGTH ? s.slice(0, MAX_IMPORT_CELL_TEXT_LENGTH) : s;
}

function normalizeNumberCell(raw: ExcelCellRaw): { ok: true; value: number | null } | { ok: false } {
  if (raw === null || raw === undefined) return { ok: true, value: null };
  if (raw instanceof Date) return { ok: false };
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return { ok: false };
    return { ok: true, value: Number(raw.toFixed(2)) };
  }
  const s = raw.trim();
  if (s === "") return { ok: true, value: null };
  const n = normalizeNumberFromString(s);
  if (n === null) return { ok: false };
  return { ok: true, value: Number(n.toFixed(2)) };
}

function normalizeDateCell(raw: ExcelCellRaw): { ok: true; value: Date | null } | { ok: false } {
  if (raw === null || raw === undefined) return { ok: true, value: null };
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? { ok: false } : { ok: true, value: raw };
  }
  if (typeof raw === "number") return { ok: false }; // unformatierte Zahl in Datumsspalte - nicht raten (Punkt 30)
  const s = raw.trim();
  if (s === "") return { ok: true, value: null };
  const d = normalizeDateFromString(s);
  return d ? { ok: true, value: d } : { ok: false };
}

function normalizeStatusCell(raw: ExcelCellRaw): { status: string | null; statusRaw: string | null } {
  if (raw === null || raw === undefined) return { status: null, statusRaw: null };
  const s = (raw instanceof Date ? raw.toLocaleDateString("de-DE") : String(raw)).trim();
  if (s === "") return { status: null, statusRaw: null };
  const clipped = s.length > MAX_IMPORT_CELL_TEXT_LENGTH ? s.slice(0, MAX_IMPORT_CELL_TEXT_LENGTH) : s;
  return { status: normalizeStatusValue(s), statusRaw: clipped };
}

export type RowError = { row: number; message: string };
export type ProcessedRecordFields = Record<string, unknown> & { rowNumber: number };

// Baut aus den Rohzeilen + bestaetigter Zuordnung die normalisierten
// Datensaetze fuer DataImportRecord. Leere Zellen erzeugen keinen Fehler
// (Feld bleibt null); nur nicht-leere, aber nicht interpretierbare Werte in
// einer zahlen-/datumstypisierten Spalte werden als Zeilenfehler gemeldet
// (Punkt 32). Statuswerte werden nie als Fehler gewertet - unbekannte Werte
// bleiben lediglich unnormalisiert (statusRaw erhalten, Punkt 31).
export function buildProcessedRecords(
  category: DataImportCategory,
  rows: ExcelCellRaw[][],
  columns: MappingColumnDef[],
): { records: ProcessedRecordFields[]; rowErrors: RowError[] } {
  const rowErrors: RowError[] = [];
  const activeColumns = columns
    .filter((c) => c.targetField && c.targetField !== IGNORE_FIELD_KEY)
    .map((c) => ({ index: c.index, field: findFieldDefinition(category, c.targetField as string) }))
    .filter((c): c is { index: number; field: NonNullable<ReturnType<typeof findFieldDefinition>> } => !!c.field);

  const records: ProcessedRecordFields[] = rows.map((row, rowIdx) => {
    const rowNumber = rowIdx + 1;
    const fields: Record<string, unknown> = {};
    for (const col of activeColumns) {
      const raw: ExcelCellRaw = row[col.index] ?? null;
      const { field } = col;
      if (field.dataType === "text") {
        fields[field.storageColumn] = normalizeTextCell(raw);
      } else if (field.dataType === "number") {
        const res = normalizeNumberCell(raw);
        if (!res.ok) {
          rowErrors.push({ row: rowNumber, message: `Zeile ${rowNumber}: "${field.label}" enthält keinen gültigen Zahlenwert.` });
        } else {
          fields[field.storageColumn] = res.value === null ? null : new Prisma.Decimal(res.value.toFixed(2));
        }
      } else if (field.dataType === "date") {
        const res = normalizeDateCell(raw);
        if (!res.ok) {
          rowErrors.push({ row: rowNumber, message: `Zeile ${rowNumber}: "${field.label}" konnte nicht als Datum erkannt werden.` });
        } else {
          fields[field.storageColumn] = res.value;
        }
      } else if (field.dataType === "status") {
        const { status, statusRaw } = normalizeStatusCell(raw);
        fields.status = status;
        fields.statusRaw = statusRaw;
      }
    }
    return { rowNumber, ...fields };
  });

  return { records, rowErrors };
}
