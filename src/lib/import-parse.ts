import * as XLSX from "xlsx";

// Wird sowohl vom Client-Wizard (sofortige Vorschau ohne Serverkontakt) als
// auch von der Server Action (autoritative Neu-Pruefung vor dem Speichern)
// genutzt - daher ausschliesslich Web-Standard-APIs (TextDecoder, Uint8Array)
// und keine Node-Builtins wie node:crypto oder node:fs.

export class ImportParseError extends Error {}

export type SpreadsheetPreview = {
  sheetNames: string[];
  selectedSheetName: string;
  rows: string[][]; // erste Zeilen inkl. Kopfzeile, max. 10
  rowCount: number;
  columnCount: number;
};

const PREVIEW_ROW_LIMIT = 10;
const PREVIEW_COLUMN_LIMIT = 20;

function stringifyCell(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) return cell.toLocaleDateString("de-DE");
  return String(cell);
}

function clampRow(row: unknown[]): string[] {
  return row.slice(0, PREVIEW_COLUMN_LIMIT).map(stringifyCell);
}

// Excel (.xlsx/.xls): SheetJS liest ausschliesslich Zellwerte. Es werden
// weder Makros (bookVBA bleibt false) noch Formeln ausgefuehrt - Formeln
// liefern nur den zuletzt zwischengespeicherten Wert (cell.v), es findet
// keine Neuberechnung statt. Keine externen Verbindungen werden aufgeloest.
export function parseExcelPreview(data: Uint8Array, requestedSheetName?: string): SpreadsheetPreview {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(data, { type: "array", cellDates: true, cellFormula: false, bookVBA: false });
  } catch {
    throw new ImportParseError("Die Excel-Datei ist beschädigt oder konnte nicht gelesen werden.");
  }

  const sheetNames = workbook.SheetNames ?? [];
  if (sheetNames.length === 0) {
    throw new ImportParseError("Die Excel-Datei enthält kein lesbares Tabellenblatt.");
  }

  const selectedSheetName =
    requestedSheetName && sheetNames.includes(requestedSheetName) ? requestedSheetName : sheetNames[0];
  const sheet = workbook.Sheets[selectedSheetName];
  if (!sheet) {
    throw new ImportParseError("Das ausgewählte Tabellenblatt konnte nicht gelesen werden.");
  }

  const range = sheet["!ref"] ? XLSX.utils.decode_range(sheet["!ref"]) : null;
  const rowCount = range ? range.e.r - range.s.r + 1 : 0;
  const columnCount = range ? range.e.c - range.s.c + 1 : 0;

  if (rowCount === 0) {
    throw new ImportParseError("Das Tabellenblatt enthält keine Daten.");
  }

  let rawRows: unknown[][];
  try {
    rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false, blankrows: false });
  } catch {
    throw new ImportParseError("Die Excel-Datei ist beschädigt oder konnte nicht gelesen werden.");
  }

  return {
    sheetNames,
    selectedSheetName,
    rows: rawRows.slice(0, PREVIEW_ROW_LIMIT).map(clampRow),
    rowCount,
    columnCount,
  };
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

function parseCsvRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
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

  const columnCount = Math.min(
    Math.max(...allRows.map((r) => r.length)),
    PREVIEW_COLUMN_LIMIT,
  );

  return {
    sheetNames: [],
    selectedSheetName: "",
    rows: allRows.slice(0, PREVIEW_ROW_LIMIT).map(clampRow),
    rowCount: allRows.length,
    columnCount,
  };
}

export function parseSpreadsheetPreview(
  bytes: Uint8Array,
  fileType: "xlsx" | "xls" | "csv",
  requestedSheetName?: string,
): SpreadsheetPreview {
  if (fileType === "csv") return parseCsvPreview(bytes);
  return parseExcelPreview(bytes, requestedSheetName);
}
