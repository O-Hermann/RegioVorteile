import "server-only";
import ExcelJS from "exceljs";
import {
  ImportParseError,
  PREVIEW_ROW_LIMIT,
  PREVIEW_COLUMN_LIMIT,
  stringifyCell,
  parseCsvPreview,
  type SpreadsheetPreview,
} from "@/lib/import-parse";
import { MAX_IMPORT_SHEETS, MAX_IMPORT_ROWS, MAX_IMPORT_COLUMNS, MAX_IMPORT_CELLS } from "@/lib/data-import";

// Server-only: nutzt exceljs, darf niemals ins Client-Bundle gelangen (siehe
// import-parse.ts fuer die browser-sichere Gegenstelle).
//
// Excel (.xlsx): exceljs liest ausschliesslich Zellwerte. Formeln werden nie
// neu berechnet - bei Formel-Zellen wird ausnahmslos der von Excel zuletzt
// gespeicherte Ergebniswert (cell.result) gelesen, niemals die Formel selbst
// ausgefuehrt. Es gibt keine VBA-/Makro-Unterstuetzung und keine automatische
// Aufloesung externer Verbindungen - exceljs kennt diese Konzepte schlicht
// nicht. Das alte binaere .xls-Format wird bewusst nicht unterstuetzt
// (Sicherheit vor Legacy-Kompatibilitaet, siehe Abschlussbericht Phase 3.1).
//
// Hinweis zur gewaehlten Lese-Strategie: urspruenglich wurde hier exceljs'
// STREAMING-Reader (WorkbookReader) eingesetzt, um Zeilen/Zellen waehrend
// des Lesens fruehzeitig zu begrenzen. Das erwies sich als unzuverlaessig:
// der Streaming-Reader setzt voraus, dass "xl/workbook.xml" (Blattname-
// Zuordnung) im ZIP-Stream VOR den einzelnen Tabellenblatt-Eintraegen liegt -
// das ist nicht bei allen XLSX-Erzeugern garantiert und fuehrte bei einer
// uerzeugten Testdatei zu einem internen exceljs-Fehler bei ansonsten
// valider Datei. Da eine faelschliche Ablehnung echter Kundenexporte
// (DATEV, Lexware, sevdesk, ...) inakzeptabel waere, wird stattdessen der
// gepufferte Reader (workbook.xlsx.load) verwendet: die Datei wird vollstaendig
// geladen, direkt danach werden Blatt-/Zeilen-/Spalten-/Zellenzahl geprueft
// und bei Ueberschreitung sofort verworfen, bevor irgendeine Zelle
// ausgelesen wird. In Kombination mit dem 10-MB-Groessenlimit auf die
// komprimierte Datei ist das Restrisiko eines uebermaessigen Speicherbedarfs
// durch das Laden selbst begrenzt (siehe Abschlussbericht).
export async function parseExcelPreviewServer(
  buffer: Buffer,
  requestedSheetName?: string,
): Promise<SpreadsheetPreview> {
  const workbook = new ExcelJS.Workbook();
  try {
    // exceljs bringt in node_modules eine eigene, leicht abweichende
    // @types/node-Version mit (fehlende neuere Buffer-Member wie
    // "resizable") - zur Laufzeit ist es exakt derselbe Node-Buffer.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load(buffer as any);
  } catch {
    throw new ImportParseError("Die Excel-Datei ist beschädigt oder konnte nicht gelesen werden.");
  }
  const worksheets = workbook.worksheets;
  if (worksheets.length === 0) {
    throw new ImportParseError("Die Excel-Datei enthält kein lesbares Tabellenblatt.");
  }
  if (worksheets.length > MAX_IMPORT_SHEETS) {
    throw new ImportParseError(`Die Excel-Datei enthält zu viele Tabellenblätter (maximal ${MAX_IMPORT_SHEETS}).`);
  }

  const sheetNames = worksheets.map((w) => w.name);

  let totalCells = 0;
  for (const ws of worksheets) {
    if (ws.rowCount > MAX_IMPORT_ROWS) {
      throw new ImportParseError(
        `Das Tabellenblatt "${ws.name}" enthält zu viele Zeilen (maximal ${MAX_IMPORT_ROWS.toLocaleString("de-DE")}).`,
      );
    }
    if (ws.columnCount > MAX_IMPORT_COLUMNS) {
      throw new ImportParseError(`Das Tabellenblatt "${ws.name}" enthält zu viele Spalten (maximal ${MAX_IMPORT_COLUMNS}).`);
    }
    totalCells += ws.rowCount * ws.columnCount;
    if (totalCells > MAX_IMPORT_CELLS) {
      throw new ImportParseError("Die Datei enthält zu viele Zellen für die Verarbeitung.");
    }
  }

  const sheet = requestedSheetName ? worksheets.find((w) => w.name === requestedSheetName) : worksheets[0];
  if (!sheet) {
    throw new ImportParseError("Das ausgewählte Tabellenblatt konnte nicht gelesen werden.");
  }
  if (sheet.rowCount === 0) {
    throw new ImportParseError("Das Tabellenblatt enthält keine Daten.");
  }

  const rows: string[][] = [];
  const previewLimit = Math.min(sheet.rowCount, PREVIEW_ROW_LIMIT);
  for (let r = 1; r <= previewLimit; r++) {
    const values = sheet.getRow(r).values;
    const cells = Array.isArray(values) ? values.slice(1) : [];
    rows.push(cells.slice(0, PREVIEW_COLUMN_LIMIT).map((cell) => stringifyExcelCell(cell)));
  }

  return {
    sheetNames,
    selectedSheetName: sheet.name,
    rows,
    rowCount: sheet.rowCount,
    columnCount: sheet.columnCount,
  };
}

// Gemeinsamer Dispatch fuer die Detailseiten (Unternehmen + Admin): parst
// bereits gespeicherte, beim Upload einmal erfolgreich validierte Bytes
// erneut fuer die Anzeige - Limits gelten unveraendert weiter.
export async function parseStoredImportPreview(
  fileType: string,
  fileContent: Buffer,
  selectedSheetName: string | null,
): Promise<SpreadsheetPreview> {
  if (fileType === "csv") return parseCsvPreview(new Uint8Array(fileContent));
  return parseExcelPreviewServer(fileContent, selectedSheetName ?? undefined);
}

function stringifyExcelCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toLocaleDateString("de-DE");
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.richText)) {
      return (obj.richText as { text?: string }[]).map((r) => r.text ?? "").join("");
    }
    // Formel-Zelle: ausschliesslich der zuletzt von Excel gespeicherte
    // Ergebniswert wird gelesen (obj.result) - obj.formula wird hier
    // absichtlich nie gelesen oder ausgewertet.
    if ("result" in obj) return stringifyExcelCell(obj.result);
    if ("text" in obj) return String(obj.text ?? "");
    if ("error" in obj) return String(obj.error ?? "#FEHLER");
    if ("hyperlink" in obj) return String(obj.text ?? obj.hyperlink ?? "");
    return "";
  }
  return stringifyCell(value);
}
