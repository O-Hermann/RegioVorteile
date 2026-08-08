import { MAX_IMPORT_ROWS, MAX_IMPORT_COLUMNS, MAX_IMPORT_CELL_TEXT_LENGTH } from "@/lib/data-import";

// Browser-sicheres Modul (nur Web-Standard-APIs: TextDecoder, Uint8Array,
// keine Node-Builtins) - wird sowohl vom Client-Wizard (sofortige CSV-
// Vorschau ohne Serverkontakt) als auch von der Server Action genutzt.
// Das Excel-Parsing (exceljs, node:stream) lebt bewusst in einer eigenen,
// serverseitigen Datei (import-parse-excel.ts), damit es niemals in das
// Client-Bundle gelangt - siehe dortiger Kommentar.

export class ImportParseError extends Error {}

export type SpreadsheetPreview = {
  sheetNames: string[];
  selectedSheetName: string;
  rows: string[][]; // erste Zeilen inkl. Kopfzeile, max. 10
  rowCount: number;
  columnCount: number;
};

export const PREVIEW_ROW_LIMIT = 10;
export const PREVIEW_COLUMN_LIMIT = 20;

export function stringifyCell(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) return cell.toLocaleDateString("de-DE");
  const text = String(cell);
  return text.length > MAX_IMPORT_CELL_TEXT_LENGTH ? text.slice(0, MAX_IMPORT_CELL_TEXT_LENGTH) + "…" : text;
}

export function clampRow(row: unknown[]): string[] {
  return row.slice(0, PREVIEW_COLUMN_LIMIT).map(stringifyCell);
}

// Robuste, aber bewusst einfache CSV-Erkennung: UTF-8 zuerst, mit
// ISO-8859-1-kompatiblem Fallback ohne ICU-Abhaengigkeit (funktioniert
// identisch im Browser und auf dem Server). Trennzeichen wird aus der
// ersten Zeile geschaetzt (Komma vs. Semikolon vs. Tab), da deutsche
// Exporte haeufig Semikolon-getrennt sind.
function decodeCsvBytes(bytes: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (utf8.includes("�")) {
    let out = "";
    for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
    return out;
  }
  return utf8.charCodeAt(0) === 0xfeff ? utf8.slice(1) : utf8;
}

function detectDelimiter(sample: string): string {
  const firstLine = sample.split(/\r\n|\r|\n/, 1)[0] ?? "";
  const semi = (firstLine.match(/;/g) || []).length;
  const comma = (firstLine.match(/,/g) || []).length;
  const tab = (firstLine.match(/\t/g) || []).length;
  if (tab > semi && tab > comma) return "\t";
  if (semi >= comma) return ";";
  return ",";
}

// Haertung (Phase 3.1): Zeilen- und Feldlaenge sind hart begrenzt, damit
// eine absichtlich extreme CSV-Datei (z.B. eine einzige, mehrere MB lange
// Zeile ohne Umbrueche) den Parser nicht in eine unverhaeltnismaessig
// teure Verarbeitung zwingt - unabhaengig vom 10-MB-Dateigroessenlimit.
function parseCsvRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    if (rows.length > MAX_IMPORT_ROWS) {
      throw new ImportParseError(`Die CSV-Datei enthält zu viele Zeilen (maximal ${MAX_IMPORT_ROWS.toLocaleString("de-DE")}).`);
    }
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else if (field.length < MAX_IMPORT_CELL_TEXT_LENGTH) {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === delimiter) {
      if (row.length < MAX_IMPORT_COLUMNS) row.push(field);
      field = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      if (row.length < MAX_IMPORT_COLUMNS) row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    if (field.length < MAX_IMPORT_CELL_TEXT_LENGTH) field += char;
  }
  if (field !== "" || row.length > 0) {
    if (row.length < MAX_IMPORT_COLUMNS) row.push(field);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

export function parseCsvPreview(bytes: Uint8Array): SpreadsheetPreview {
  if (bytes.length === 0) {
    throw new ImportParseError("Die Datei ist leer.");
  }
  const text = decodeCsvBytes(bytes);
  if (text.trim() === "") {
    throw new ImportParseError("Die Datei enthält keine lesbaren Daten.");
  }

  const delimiter = detectDelimiter(text);
  const allRows = parseCsvRows(text, delimiter);
  if (allRows.length === 0) {
    throw new ImportParseError("Die CSV-Datei konnte nicht gelesen werden.");
  }

  const columnCount = Math.min(Math.max(...allRows.map((r) => r.length)), PREVIEW_COLUMN_LIMIT);

  return {
    sheetNames: [],
    selectedSheetName: "",
    rows: allRows.slice(0, PREVIEW_ROW_LIMIT).map(clampRow),
    rowCount: allRows.length,
    columnCount,
  };
}
