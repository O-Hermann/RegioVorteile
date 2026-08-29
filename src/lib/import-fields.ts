import type { DataImportCategory } from "@/generated/prisma/client";

// Zentrale Field-Registry fuer Phase 4 (Spaltenzuordnung). EINE gemeinsame
// Zuordnungs-Engine fuer alle drei Kategorien statt drei getrennter Systeme -
// jede Kategorie definiert nur ihre eigene Liste aus ImportFieldDefinition,
// alles andere (Vorschlagslogik, UI, Speicherung) ist kategorieunabhaengig.
// Neue Felder/Kategorien lassen sich spaeter rein additiv ergaenzen.

export type ImportFieldDataType = "text" | "number" | "date" | "status" | "documentType";

// Generische Spalten von DataImportRecord (siehe schema.prisma), auf die ein
// Zielfeld schreibt. Innerhalb EINER Kategorie ist jede storageColumn nur
// einmal vergeben (keine Kollisionen); dieselbe storageColumn darf sich aber
// zwischen verschiedenen Kategorien wiederholen (z.B. "name"), da eine Zeile
// immer nur zu genau einem DataImport/einer Kategorie gehoert.
export type RecordStorageColumn =
  | "referenceNumber"
  | "primaryDate"
  | "name"
  | "organization"
  | "description"
  | "dueDate"
  | "completionDate"
  | "bookingDate"
  | "status"
  | "documentType"
  | "netAmount"
  | "taxAmount"
  | "grossAmount"
  | "costAmount"
  | "openAmount"
  | "amount"
  | "accountNumber"
  | "accountLabel"
  | "metricLabel"
  | "responsible"
  | "email"
  | "phone";

export type ImportFieldDefinition = {
  key: string;
  label: string;
  group: string;
  dataType: ImportFieldDataType;
  storageColumn: RecordStorageColumn;
  // Normalisierte Vergleichsbasis fuer die automatische Vorschlagserkennung -
  // Original-Schreibweisen genuegen, die Normalisierung erfolgt zur Laufzeit.
  synonyms: string[];
};

// Sentinel-Wert fuer "Spalte ignorieren" - kein echtes Zielfeld, aber ein
// bewusst getroffener, gueltiger Zustand (siehe Fortschrittsanzeige).
export const IGNORE_FIELD_KEY = "__ignore__";

export const IMPORT_FIELD_DATA_TYPE_LABELS: Record<ImportFieldDataType, string> = {
  text: "Text",
  number: "Zahl",
  date: "Datum",
  status: "Status",
  documentType: "Belegart",
};

export const IMPORT_FIELD_REGISTRY: Record<DataImportCategory, ImportFieldDefinition[]> = {
  FINANCE: [
    {
      key: "invoiceNumber",
      label: "Rechnungsnummer / Belegnummer",
      group: "Beleg / Rechnung",
      dataType: "text",
      storageColumn: "referenceNumber",
      synonyms: ["Rechnungsnummer", "Belegnummer", "Rechnungsnr", "Rechnungs-Nr", "Invoice Number", "Invoice No", "Beleg-Nr", "Beleg Nr"],
    },
    {
      key: "invoiceDate",
      label: "Rechnungsdatum",
      group: "Beleg / Rechnung",
      dataType: "date",
      storageColumn: "primaryDate",
      synonyms: ["Rechnungsdatum", "Rechnung Datum", "Invoice Date", "Datum"],
    },
    {
      key: "customer",
      label: "Kunde / Debitor",
      group: "Beleg / Rechnung",
      dataType: "text",
      storageColumn: "name",
      synonyms: ["Kunde", "Kundenname", "Debitor", "Customer", "Customer Name", "Auftraggeber"],
    },
    {
      key: "description",
      label: "Beschreibung / Leistung",
      group: "Beleg / Rechnung",
      dataType: "text",
      storageColumn: "description",
      synonyms: ["Leistung", "Beschreibung", "Buchungstext", "Description", "Bezeichnung", "Text"],
    },
    {
      key: "dueDate",
      label: "Fälligkeitsdatum",
      group: "Beleg / Rechnung",
      dataType: "date",
      storageColumn: "dueDate",
      synonyms: ["Fälligkeitsdatum", "Faellig am", "Fällig am", "Due Date", "Zahlungsziel", "Faelligkeitsdatum"],
    },
    {
      key: "paymentStatus",
      label: "Zahlungsstatus",
      group: "Beleg / Rechnung",
      dataType: "status",
      storageColumn: "status",
      synonyms: ["Zahlungsstatus", "Payment Status", "Zahlstatus", "Status"],
    },
    {
      key: "documentType",
      label: "Belegart (Rechnung/Gutschrift)",
      group: "Beleg / Rechnung",
      dataType: "documentType",
      storageColumn: "documentType",
      synonyms: ["Belegart", "Belegtyp", "Document Type", "Dokumentart", "Art"],
    },
    {
      key: "netAmount",
      label: "Nettobetrag",
      group: "Beträge",
      dataType: "number",
      storageColumn: "netAmount",
      synonyms: ["Nettobetrag", "Netto", "Net Amount", "Nettoumsatz"],
    },
    {
      key: "taxAmount",
      label: "Steuerbetrag",
      group: "Beträge",
      dataType: "number",
      storageColumn: "taxAmount",
      synonyms: ["Steuerbetrag", "MwSt", "USt", "Mehrwertsteuer", "Tax Amount", "VAT", "Umsatzsteuer"],
    },
    {
      key: "grossAmount",
      label: "Bruttobetrag",
      group: "Beträge",
      dataType: "number",
      storageColumn: "grossAmount",
      synonyms: ["Bruttobetrag", "Brutto", "Gross Amount", "Bruttoumsatz", "Gesamtbetrag"],
    },
    {
      key: "costAmount",
      label: "Kostenbetrag",
      group: "Beträge",
      dataType: "number",
      storageColumn: "costAmount",
      synonyms: ["Kostenbetrag", "Kosten", "Cost Amount", "Costs"],
    },
    {
      key: "openAmount",
      label: "Offener Betrag",
      group: "Beträge",
      dataType: "number",
      storageColumn: "openAmount",
      synonyms: ["Offener Betrag", "Offen", "Open Amount", "Restbetrag"],
    },
    {
      key: "amount",
      label: "Betrag / Saldo",
      group: "Beträge",
      dataType: "number",
      storageColumn: "amount",
      synonyms: ["Betrag", "Saldo", "Amount", "Balance"],
    },
    {
      key: "accountNumber",
      label: "Kontonummer",
      group: "Buchhaltung / BWA",
      dataType: "text",
      storageColumn: "accountNumber",
      synonyms: ["Kontonummer", "Konto Nr", "Account Number", "Kontonr"],
    },
    {
      key: "accountLabel",
      label: "Kontobezeichnung",
      group: "Buchhaltung / BWA",
      dataType: "text",
      storageColumn: "accountLabel",
      synonyms: ["Kontobezeichnung", "Kontoname", "Account Name", "Kontobeschreibung"],
    },
    {
      key: "metric",
      label: "Kennzahl / Position",
      group: "Buchhaltung / BWA",
      dataType: "text",
      storageColumn: "metricLabel",
      synonyms: ["Kennzahl", "Position", "Metric", "BWA Position"],
    },
    {
      key: "bookingDate",
      label: "Buchungsdatum",
      group: "Buchhaltung / BWA",
      dataType: "date",
      storageColumn: "bookingDate",
      synonyms: ["Buchungsdatum", "Booking Date", "Buchung Datum"],
    },
  ],
  ORDERS: [
    {
      key: "orderNumber",
      label: "Auftragsnummer",
      group: "Auftrag",
      dataType: "text",
      storageColumn: "referenceNumber",
      synonyms: ["Auftragsnummer", "Auftrag Nr", "Order Number", "Bestellnummer"],
    },
    {
      key: "orderDate",
      label: "Auftragsdatum",
      group: "Auftrag",
      dataType: "date",
      storageColumn: "primaryDate",
      synonyms: ["Auftragsdatum", "Order Date", "Bestelldatum"],
    },
    {
      key: "customer",
      label: "Kunde",
      group: "Auftrag",
      dataType: "text",
      storageColumn: "name",
      synonyms: ["Kunde", "Kundenname", "Customer", "Customer Name", "Auftraggeber"],
    },
    {
      key: "orderTitle",
      label: "Auftragstitel / Beschreibung",
      group: "Auftrag",
      dataType: "text",
      storageColumn: "description",
      synonyms: ["Auftragstitel", "Titel", "Order Title", "Beschreibung", "Description"],
    },
    {
      key: "orderStatus",
      label: "Status",
      group: "Auftrag",
      dataType: "status",
      storageColumn: "status",
      synonyms: ["Status", "Auftragsstatus", "Order Status"],
    },
    {
      key: "orderValueNet",
      label: "Auftragswert netto",
      group: "Werte",
      dataType: "number",
      storageColumn: "netAmount",
      synonyms: ["Auftragswert Netto", "Auftragswert", "Netto", "Net Value"],
    },
    {
      key: "orderValueGross",
      label: "Auftragswert brutto",
      group: "Werte",
      dataType: "number",
      storageColumn: "grossAmount",
      synonyms: ["Auftragswert Brutto", "Brutto", "Gross Value"],
    },
    {
      key: "dueDate",
      label: "Fälligkeitsdatum",
      group: "Termine",
      dataType: "date",
      storageColumn: "dueDate",
      synonyms: ["Fälligkeitsdatum", "Faellig am", "Fällig am", "Due Date", "Zahlungsziel", "Faelligkeitsdatum"],
    },
    {
      key: "completionDate",
      label: "Abschlussdatum",
      group: "Termine",
      dataType: "date",
      storageColumn: "completionDate",
      synonyms: ["Abschlussdatum", "Completion Date", "Fertigstellung", "Fertigstellungsdatum"],
    },
    {
      key: "responsible",
      label: "Verantwortlicher",
      group: "Auftrag",
      dataType: "text",
      storageColumn: "responsible",
      synonyms: ["Verantwortlicher", "Zuständig", "Zustaendig", "Responsible", "Sachbearbeiter"],
    },
  ],
  CUSTOMERS: [
    {
      key: "customerNumber",
      label: "Kundennummer",
      group: "Kunde",
      dataType: "text",
      storageColumn: "referenceNumber",
      synonyms: ["Kundennummer", "Kunde Nr", "Customer Number", "Kundennr"],
    },
    {
      key: "customerName",
      label: "Kundenname",
      group: "Kunde",
      dataType: "text",
      storageColumn: "name",
      synonyms: ["Kundenname", "Kunde", "Customer Name", "Name"],
    },
    {
      key: "organization",
      label: "Unternehmen",
      group: "Kunde",
      dataType: "text",
      storageColumn: "organization",
      synonyms: ["Unternehmen", "Firma", "Company", "Organisation"],
    },
    {
      key: "contactPerson",
      label: "Ansprechpartner",
      group: "Kunde",
      dataType: "text",
      storageColumn: "responsible",
      synonyms: ["Ansprechpartner", "Kontaktperson", "Contact Person", "Ansprechperson"],
    },
    {
      key: "email",
      label: "E-Mail",
      group: "Kontakt",
      dataType: "text",
      storageColumn: "email",
      synonyms: ["E-Mail", "Email", "E Mail", "Mail"],
    },
    {
      key: "phone",
      label: "Telefon",
      group: "Kontakt",
      dataType: "text",
      storageColumn: "phone",
      synonyms: ["Telefon", "Phone", "Tel", "Telefonnummer"],
    },
    {
      key: "customerStatus",
      label: "Kundenstatus",
      group: "Kunde",
      dataType: "status",
      storageColumn: "status",
      synonyms: ["Kundenstatus", "Customer Status", "Status"],
    },
    {
      key: "customerType",
      label: "Kundentyp",
      group: "Kunde",
      dataType: "text",
      storageColumn: "accountLabel",
      synonyms: ["Kundentyp", "Typ", "Customer Type", "Kategorie"],
    },
    {
      key: "createdAt",
      label: "Erstellt am",
      group: "Kunde",
      dataType: "date",
      storageColumn: "primaryDate",
      synonyms: ["Erstellt am", "Created At", "Anlagedatum", "Erstelldatum"],
    },
  ],
};

export function findFieldDefinition(category: DataImportCategory, key: string): ImportFieldDefinition | undefined {
  return IMPORT_FIELD_REGISTRY[category].find((f) => f.key === key);
}

// Normalisierung fuer Spaltennamen-Vergleiche: deutsche Umlaute explizit
// transkribiert (nicht per Unicode-Diakritika-Stripping, da das "ä" faelschlich
// zu "a" statt "ae" machen wuerde), danach alles auf a-z0-9 reduziert.
export function normalizeColumnName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "");
}

// Normalisierte, sortierte Spalten-Signatur einer Datei - Grundlage fuer die
// Mapping-Vorlagen-Wiedererkennung (Punkt 23: NICHT anhand des Dateinamens).
export function computeColumnSignature(headers: string[]): string {
  return headers
    .map(normalizeColumnName)
    .filter(Boolean)
    .sort()
    .join("|");
}

export type CanonicalPaymentStatus = "PAID" | "OPEN" | "PARTIALLY_PAID" | "OVERDUE" | "CANCELED";

export const STATUS_LABELS_DE: Record<CanonicalPaymentStatus, string> = {
  PAID: "Bezahlt",
  OPEN: "Offen",
  PARTIALLY_PAID: "Teilbezahlt",
  OVERDUE: "Überfällig",
  CANCELED: "Storniert",
};

// Deterministische, kategorieunabhaengige Status-Normalisierung (Punkt 31) -
// gilt fuer jedes status-typisierte Zielfeld (Zahlungs-/Auftrags-/Kundenstatus).
// Unbekannte Werte werden NICHT geraten: statusRaw bleibt erhalten, der
// normalisierte "status" bleibt dann leer.
const STATUS_SYNONYM_MAP: Record<string, CanonicalPaymentStatus> = {
  bezahlt: "PAID",
  paid: "PAID",
  beglichen: "PAID",
  offen: "OPEN",
  open: "OPEN",
  unbezahlt: "OPEN",
  ausstehend: "OPEN",
  teilbezahlt: "PARTIALLY_PAID",
  teilweisebezahlt: "PARTIALLY_PAID",
  partiallypaid: "PARTIALLY_PAID",
  ueberfaellig: "OVERDUE",
  überfällig: "OVERDUE",
  overdue: "OVERDUE",
  storniert: "CANCELED",
  canceled: "CANCELED",
  cancelled: "CANCELED",
  abgebrochen: "CANCELED",
};

export function normalizeStatusValue(raw: string): CanonicalPaymentStatus | null {
  const key = normalizeColumnName(raw);
  return STATUS_SYNONYM_MAP[key] ?? null;
}

// Fund-Kategorie "Offene Gutschriften" (MVP-Roadmap Phase 1.1): eigene,
// kleine Normalisierung analog zu CanonicalPaymentStatus/STATUS_SYNONYM_MAP
// oben - bewusst ein eigener, unabhaengiger Wertebereich statt in den
// Status-Wortschatz (PAID/OPEN/...) integriert, weil "Belegart" fachlich
// etwas anderes ist als "Zahlungsstatus" (eine Rechnung UND eine Gutschrift
// koennen beide z.B. den Zahlungsstatus "Offen" haben).
export type CanonicalDocumentType = "INVOICE" | "CREDIT_NOTE";

export const DOCUMENT_TYPE_LABELS_DE: Record<CanonicalDocumentType, string> = {
  INVOICE: "Rechnung",
  CREDIT_NOTE: "Gutschrift",
};

const DOCUMENT_TYPE_SYNONYM_MAP: Record<string, CanonicalDocumentType> = {
  rechnung: "INVOICE",
  invoice: "INVOICE",
  re: "INVOICE",
  ar: "INVOICE", // Ausgangsrechnung
  gutschrift: "CREDIT_NOTE",
  creditnote: "CREDIT_NOTE",
  credit: "CREDIT_NOTE",
  gs: "CREDIT_NOTE",
};

export function normalizeDocumentTypeValue(raw: string): CanonicalDocumentType | null {
  const key = normalizeColumnName(raw);
  return DOCUMENT_TYPE_SYNONYM_MAP[key] ?? null;
}

export function looksLikeDocumentTypeValue(raw: string): boolean {
  return normalizeDocumentTypeValue(raw) !== null;
}

// Rein textbasierte Erkennung fuer die Datentyp-Heuristik (Beispielwerte) -
// dieselbe Normalisierung wie beim eigentlichen Mapping, damit Status-Spalten
// zuverlaessig als "Status" statt als "Text" erkannt werden.
export function looksLikeStatusValue(raw: string): boolean {
  return normalizeStatusValue(raw) !== null;
}

// Robuste Normalisierung deutscher/englischer Zahlenschreibweisen aus
// Textzellen (CSV, oder Excel-Zellen, die als Text statt als Zahl formatiert
// sind) - siehe Spezifikationsbeispiele: "1.850,00", "1850,00", "1850.00",
// "€ 1.850,00", "1 850,00". Liefert null bei nicht eindeutig erkennbaren
// Werten statt zu raten.
export function normalizeNumberFromString(raw: string): number | null {
  let s = raw
    .trim()
    .replace(/[€$]/g, "")
    .replace(/ /g, " ") // geschuetztes Leerzeichen (Tausendertrennzeichen mancher Exporte)
    .replace(/\s+/g, "")
    .trim();
  if (s === "") return null;
  let negative = false;
  if (/^-/.test(s) || /^\(.*\)$/.test(s)) {
    negative = true;
    s = s.replace(/^-/, "").replace(/^\(|\)$/g, "");
  }
  if (!/^[0-9.,]+$/.test(s)) return null;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  let normalized: string;
  if (hasComma && hasDot) {
    // "1.850,00" - Punkt ist Tausendertrennzeichen, Komma ist Dezimaltrennzeichen.
    normalized = s.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    // "1850,00" - Komma ist Dezimaltrennzeichen.
    normalized = s.replace(",", ".");
  } else if (hasDot) {
    // Mehrdeutig: "1850.00" (englisches Dezimaltrennzeichen) vs. "1.850"
    // (deutsches Tausendertrennzeichen ohne Nachkommastellen). Heuristik:
    // mehrere Punkte oder genau 3 Ziffern nach dem letzten Punkt =>
    // Tausendertrennzeichen (z.B. "1.850", "1.234.567"), sonst Dezimaltrennzeichen.
    const dotCount = (s.match(/\./g) || []).length;
    const lastSegment = s.slice(s.lastIndexOf(".") + 1);
    normalized = dotCount > 1 || lastSegment.length === 3 ? s.replace(/\./g, "") : s;
  } else {
    normalized = s;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return negative ? -value : value;
}

// Erkennt "dd.mm.yyyy" (deutsches Format) und "yyyy-mm-dd" (ISO) - bewusst
// KEINE weiteren, mehrdeutigen Formate wie "mm/dd/yyyy" (Punkt 30: unklare
// Daten nicht erraten).
export function normalizeDateFromString(raw: string): Date | null {
  const s = raw.trim();
  const de = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (de) {
    const day = Number(de[1]);
    const month = Number(de[2]);
    const year = Number(de[3]);
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
    return d;
  }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
    return d;
  }
  return null;
}

// Grobe, rein anzeigende Datentyp-Erkennung anhand von Beispielwerten (Punkt
// 9) - dient nur der Orientierung, bestimmt niemals allein die Zuordnung.
export function detectColumnDataType(samples: string[]): ImportFieldDataType {
  const values = samples.map((s) => s.trim()).filter(Boolean);
  if (values.length === 0) return "text";
  if (values.every((v) => normalizeDateFromString(v) !== null)) return "date";
  if (values.every((v) => normalizeNumberFromString(v) !== null)) return "number";
  if (values.every((v) => looksLikeStatusValue(v))) return "status";
  if (values.every((v) => looksLikeDocumentTypeValue(v))) return "documentType";
  return "text";
}
