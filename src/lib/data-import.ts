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
  if (status === "READY_FOR_MAPPING" || status === "READY_FOR_PROCESSING") {
    return "bg-gold-100 text-gold-700";
  }
  if (status === "PROCESSED") return "bg-ink-100 text-ink-800";
  if (status === "FAILED" || status === "VALIDATION_FAILED") return "bg-rose-100 text-rose-700";
  return "bg-sand-200 text-sand-700";
}

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

export const ALLOWED_IMPORT_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const;

export const ALLOWED_IMPORT_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls (und teils .csv je nach Browser/OS)
  "text/csv",
  "application/csv",
  "text/plain", // manche Browser melden .csv als text/plain
  "", // manche Browser/OS liefern gar keinen MIME-Type mit
] as const;

export function extensionForFileName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

export function fileTypeForExtension(ext: string): "xlsx" | "xls" | "csv" | null {
  if (ext === ".xlsx") return "xlsx";
  if (ext === ".xls") return "xls";
  if (ext === ".csv") return "csv";
  return null;
}

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
