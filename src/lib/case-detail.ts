import "server-only";
import { prisma } from "@/lib/prisma";
import type { Case, User } from "@/generated/prisma/client";
import { formatEuroDetailed } from "@/lib/finance-format";
import { STATUS_LABELS_DE, DOCUMENT_TYPE_LABELS_DE, type CanonicalPaymentStatus, type CanonicalDocumentType } from "@/lib/import-fields";
import { periodLabel } from "@/lib/data-import";

// MVP-Roadmap Phase 5 (siehe [[effivo_mvp_roadmap]]): laedt einen einzelnen
// Fall MANDANTENSCHARF (companyId immer mitgefiltert, nie nur ueber die
// caseId vertraut - gleiches Muster wie ueberall sonst im Projekt, z.B.
// getCustomer/getOrder) sowie die DataImportRecord-Zeile(n), die zu diesem
// Fund gefuehrt haben (Case.sourceRecordIds, siehe case-sync.ts/die vier
// detect*()-Dateien).
export async function getCaseWithSource(
  companyId: string,
  caseId: string,
): Promise<{ caseItem: Case & { reviewedByUser: User | null }; sourceRows: SourceRowDisplay[] } | null> {
  const caseItem = await prisma.case.findFirst({ where: { id: caseId, companyId }, include: { reviewedByUser: true } });
  if (!caseItem) return null;

  // sourceRecordIds kann auf Zeilen zeigen, die inzwischen nicht mehr
  // existieren (z.B. der zugehoerige Datenimport wurde geloescht) - Case
  // bleibt dabei bewusst bestehen (siehe Kommentar in schema.prisma), die
  // Detail-Ansicht zeigt dann schlicht keine Rohdaten mehr statt eines
  // Fehlers.
  const records =
    caseItem.sourceRecordIds.length > 0
      ? await prisma.dataImportRecord.findMany({
          where: { id: { in: caseItem.sourceRecordIds }, companyId },
          include: { dataImport: { select: { id: true, fileName: true, periodMonth: true, periodYear: true } } },
        })
      : [];

  // Reihenfolge der urspruenglichen sourceRecordIds beibehalten (bei
  // Doppelzahlungen ist das erste Element bewusst die AELTESTE/legitime
  // Zahlung, siehe duplicate-payment-detection.ts) statt der undefinierten
  // DB-Rueckgabereihenfolge.
  const byId = new Map(records.map((r) => [r.id, r]));
  const orderedRecords = caseItem.sourceRecordIds.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => !!r);

  const sourceRows = orderedRecords.map(toSourceRowDisplay);
  return { caseItem, sourceRows };
}

export type SourceRowField = { label: string; value: string };
export type SourceRowDisplay = {
  recordId: string;
  dataImportId: string;
  dataImportFileName: string;
  dataImportPeriodLabel: string;
  fields: SourceRowField[];
};

type RecordWithImport = Awaited<ReturnType<typeof prisma.dataImportRecord.findMany<{ include: { dataImport: { select: { id: true; fileName: true; periodMonth: true; periodYear: true } } } }>>>[number];

// Feste, generische Anzeige-Reihenfolge unabhaengig von der Fund-Kategorie -
// zeigt buendig alle tatsaechlich gefuellten (nicht-leeren) Felder dieser
// Zeile, statt eine Kategorie-spezifische Auswahl zu pflegen, die bei jeder
// neuen Erkennungsregel wieder angepasst werden muesste. Reihenfolge
// orientiert sich an import-fields.ts (Beleg-Angaben zuerst, dann Betraege).
function toSourceRowDisplay(record: RecordWithImport): SourceRowDisplay {
  const de = (d: Date | null) => d?.toLocaleDateString("de-DE") ?? null;
  const status = record.status as CanonicalPaymentStatus | null;
  const documentType = record.documentType as CanonicalDocumentType | null;

  const candidates: (SourceRowField | null)[] = [
    record.referenceNumber ? { label: "Referenznummer", value: record.referenceNumber } : null,
    record.name ? { label: "Name", value: record.name } : null,
    record.organization ? { label: "Unternehmen", value: record.organization } : null,
    record.description ? { label: "Beschreibung", value: record.description } : null,
    de(record.primaryDate) ? { label: "Rechnungs-/Belegdatum", value: de(record.primaryDate)! } : null,
    de(record.dueDate) ? { label: "Fälligkeitsdatum", value: de(record.dueDate)! } : null,
    de(record.completionDate) ? { label: "Zahlungsdatum", value: de(record.completionDate)! } : null,
    de(record.bookingDate) ? { label: "Buchungsdatum", value: de(record.bookingDate)! } : null,
    de(record.discountDeadline) ? { label: "Skontofrist", value: de(record.discountDeadline)! } : null,
    record.discountPercent ? { label: "Skontosatz", value: `${record.discountPercent.toString()} %` } : null,
    record.paymentTermsRaw ? { label: "Zahlungsbedingungen (Rohtext)", value: record.paymentTermsRaw } : null,
    status ? { label: "Zahlungsstatus", value: STATUS_LABELS_DE[status] } : null,
    documentType ? { label: "Belegart", value: DOCUMENT_TYPE_LABELS_DE[documentType] } : null,
    record.grossAmount ? { label: "Bruttobetrag", value: formatEuroDetailed(record.grossAmount) } : null,
    record.netAmount ? { label: "Nettobetrag", value: formatEuroDetailed(record.netAmount) } : null,
    record.taxAmount ? { label: "Steuerbetrag", value: formatEuroDetailed(record.taxAmount) } : null,
    record.amount ? { label: "Betrag / Saldo", value: formatEuroDetailed(record.amount) } : null,
    record.paidAmount ? { label: "Gezahlter Betrag", value: formatEuroDetailed(record.paidAmount) } : null,
    record.openAmount ? { label: "Offener Betrag", value: formatEuroDetailed(record.openAmount) } : null,
    record.costAmount ? { label: "Kostenbetrag", value: formatEuroDetailed(record.costAmount) } : null,
    record.accountNumber ? { label: "Kontonummer", value: record.accountNumber } : null,
    record.accountLabel ? { label: "Kontobezeichnung", value: record.accountLabel } : null,
    record.responsible ? { label: "Verantwortlicher", value: record.responsible } : null,
    { label: "Zeile in Originaldatei", value: String(record.rowNumber) },
  ];

  return {
    recordId: record.id,
    dataImportId: record.dataImport.id,
    dataImportFileName: record.dataImport.fileName,
    dataImportPeriodLabel: periodLabel(record.dataImport.periodMonth, record.dataImport.periodYear),
    fields: candidates.filter((f): f is SourceRowField => f !== null),
  };
}
