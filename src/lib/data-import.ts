import type { DataImportCategory, DataImportStatus } from "@/generated/prisma/client";

export const DATA_IMPORT_CATEGORY_LABELS: Record<DataImportCategory, string> = {
  FINANCE: "Finanzen",
  ORDERS: "Aufträge",
  CUSTOMERS: "Kunden",
};

export const DATA_IMPORT_CATEGORY_DESCRIPTIONS: Record<DataImportCategory, string> = {
  FINANCE: "Buchhaltungsdaten, BWA-nahe Exporte, Rechnungs- oder Forderungsdaten.",
  ORDERS: "Offene Aufträge, abgeschlossene Aufträge oder Angebote.",
  CUSTOMERS: "Kundenlisten, Kundenentwicklung oder aktive Kunden.",
};

// Nur READY_FOR_MAPPING wird in Phase 3 tatsaechlich automatisch vergeben,
// die uebrigen Werte sind fuer Phase 4/5 vorbereitet (siehe schema.prisma).
export const DATA_IMPORT_STATUS_LABELS: Record<DataImportStatus, string> = {
  READY_FOR_MAPPING: "Bereit zur Zuordnung",
  VALIDATION_FAILED: "Prüfung fehlgeschlagen",
  READY_FOR_PROCESSING: "Bereit zur Verarbeitung",
  PROCESSED: "Verarbeitet",
  FAILED: "Fehlgeschlagen",
  CANCELED: "Abgebrochen",
};

export function dataImportStatusBadgeClass(status: DataImportStatus) {
  if (status === "PROCESSED") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
  if (status === "READY_FOR_MAPPING" || status === "READY_FOR_PROCESSING") {
    return "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
  }
  if (status === "FAILED" || status === "VALIDATION_FAILED") return "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
  return "bg-sand-100 text-sand-600 dark:bg-white/10 dark:text-cockpit-text-secondary";
}

// Farbpunkt passend zu dataImportStatusBadgeClass - eigene Funktion statt
// Farbe aus der Badge-Klasse zu parsen, da beide unabhaengig gebraucht
// werden (Punkt sitzt VOR dem Label in der Pille).
export function dataImportStatusDotClass(status: DataImportStatus): string {
  if (status === "PROCESSED") return "bg-emerald-500";
  if (status === "READY_FOR_MAPPING" || status === "READY_FOR_PROCESSING") return "bg-blue-500";
  if (status === "FAILED" || status === "VALIDATION_FAILED") return "bg-rose-500";
  return "bg-sand-400 dark:bg-cockpit-text-weak";
}

// Farbige Icon-Badges pro Kategorie (Listenansicht) - rein visuelle
// Unterscheidungshilfe, keine neue Kategorie erfunden, nur Farbe/Icon pro
// bereits bestehendem DataImportCategory-Wert.
export const DATA_IMPORT_CATEGORY_BADGE_CLASS: Record<DataImportCategory, string> = {
  FINANCE: "bg-ink-100 text-ink-700 dark:bg-cockpit-accent-light/25 dark:text-cockpit-accent-light",
  ORDERS: "bg-gold-100 text-gold-700 dark:bg-gold-500/20 dark:text-gold-300",
  CUSTOMERS: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
};

export const MONTH_LABELS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function periodLabel(month: number, year: number) {
  return `${MONTH_LABELS_DE[month - 1] ?? month} ${year}`;
}

export const SOURCE_SYSTEM_OPTIONS = [
  "DATEV",
  "Lexware",
  "lexoffice",
  "sevdesk",
  "Excel / manuelle Liste",
  "Anderes / unbekannt",
];

// Zentrale Upload-Konfiguration - vom Wizard (Client) und der Server Action
// gemeinsam genutzt, damit Anzeige und tatsaechlich durchgesetztes Limit nie
// auseinanderlaufen.
export const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMPORT_FILE_SIZE_LABEL = "10 MB";

// .xls (das alte binaere BIFF-Format) wird bewusst NICHT unterstuetzt: die
// sichere, aktiv gepflegte Excel-Bibliothek (exceljs) kann ausschliesslich
// das moderne, ZIP/XML-basierte .xlsx lesen. Das war eine explizite
// Sicherheits-vor-Legacy-Entscheidung in Phase 3.1 - siehe Abschlussbericht.
export const ALLOWED_IMPORT_EXTENSIONS = [".xlsx", ".csv"] as const;

export const ALLOWED_IMPORT_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/csv",
  "application/csv",
  "text/plain", // manche Browser melden .csv als text/plain
  "", // manche Browser/OS liefern gar keinen MIME-Type mit
] as const;

export function extensionForFileName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

export function fileTypeForExtension(ext: string): "xlsx" | "csv" | null {
  if (ext === ".xlsx") return "xlsx";
  if (ext === ".csv") return "csv";
  return null;
}

// Zentrale Parsing-Limits (Phase 3.1 Sicherheitshaertung): schuetzen vor
// beschaedigten/manipulierten Dateien, die beim Entpacken oder Parsen
// unverhaeltnismaessig viel Speicher/CPU beanspruchen wuerden - unabhaengig
// vom 10-MB-Dateigroessenlimit, das eine komprimierte ZIP/XLSX-Datei allein
// nicht zuverlaessig begrenzt (Stichwort Zip-Bomb-artige Auffaelligkeit).
// Grosszuegig genug fuer normale KMU-Exporte, eng genug um absichtlich
// extreme Dateien fruehzeitig abzulehnen.
export const MAX_IMPORT_SHEETS = 25;
export const MAX_IMPORT_ROWS = 50_000;
export const MAX_IMPORT_COLUMNS = 200;
export const MAX_IMPORT_CELLS = 300_000;
export const MAX_IMPORT_CELL_TEXT_LENGTH = 2000;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// State-Typ und Initialwert fuer useActionState(createDataImport, ...) - liegt
// hier statt in actions/data-import.ts, da eine "use server"-Datei nur async
// Funktionen exportieren darf (kein Typ/Objekt-Export moeglich).
export type CreateDataImportState = {
  status: "idle" | "error" | "duplicate";
  message?: string;
  duplicateCreatedAt?: string;
};

export const CREATE_DATA_IMPORT_IDLE_STATE: CreateDataImportState = { status: "idle" };
