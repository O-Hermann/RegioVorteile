"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember, assertCanUploadDataImport } from "@/lib/auth";
import { ImportParseError } from "@/lib/import-parse";
import {
  parseFullSpreadsheetForProcessing,
  sanitizeMappingColumns,
  buildProcessedRecords,
  type MappingColumnDef,
} from "@/lib/import-process";
import { IGNORE_FIELD_KEY, findFieldDefinition, computeColumnSignature } from "@/lib/import-fields";
import { Prisma } from "@/generated/prisma/client";

function revalidateImportPaths(dataImportId: string) {
  revalidatePath("/arbeitgeber/dashboard");
  revalidatePath("/arbeitgeber/dashboard/datenimporte");
  revalidatePath(`/arbeitgeber/dashboard/datenimporte/${dataImportId}`);
  revalidatePath(`/arbeitgeber/dashboard/datenimporte/${dataImportId}/zuordnung`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/datenimporte");
  revalidatePath(`/admin/datenimporte/${dataImportId}`);
}

export type SaveMappingResult = { status: "ok" } | { status: "error"; message: string };

// Speichert eine noch unvollstaendige Zuordnung als Entwurf (Punkt 19) - bewusst
// nachsichtiger als die Bestaetigung: doppelte Zielfelder oder eine noch nicht
// vollstaendige Zuordnung sind hier kein Fehler, nur technisch unmoegliche
// Werte (unbekannter Spaltenindex/Feldschluessel) werden verworfen.
export async function saveDataImportMapping(dataImportId: string, columns: MappingColumnDef[]): Promise<SaveMappingResult> {
  const { company } = await requireCompanyMember();
  await assertCanUploadDataImport(company.id);

  const dataImport = await prisma.dataImport.findFirst({ where: { id: dataImportId, companyId: company.id } });
  if (!dataImport) return { status: "error", message: "Datenimport wurde nicht gefunden." };
  if (dataImport.status === "PROCESSED") {
    return { status: "error", message: "Dieser Datenimport wurde bereits verarbeitet und kann nicht mehr geändert werden." };
  }

  let header: string[];
  try {
    const buffer = Buffer.from(dataImport.fileContent);
    const parsed = await parseFullSpreadsheetForProcessing(dataImport.fileType, buffer, dataImport.selectedSheetName);
    header = parsed.header;
  } catch {
    return { status: "error", message: "Die Datei konnte nicht erneut gelesen werden." };
  }

  const { columns: sanitized } = sanitizeMappingColumns(dataImport.category, header, columns);

  await prisma.dataImportMapping.upsert({
    where: { dataImportId },
    create: { dataImportId, companyId: company.id, columns: sanitized as unknown as Prisma.InputJsonValue },
    update: { columns: sanitized as unknown as Prisma.InputJsonValue },
  });

  revalidateImportPaths(dataImportId);
  return { status: "ok" };
}

export type ConfirmProcessResult =
  | { status: "ok"; recordCount: number }
  | { status: "validation_error"; message: string; rowErrors: string[]; totalRowErrors: number }
  | { status: "error"; message: string };

// Serverseitige Bestaetigung + Verarbeitung (Punkt 27/28/37): die Original-
// datei wird erneut aus DataImport.fileContent gelesen (nie Browser-Daten
// uebernommen), alle Berechtigungs-/Mandanten-/Kategorie-/Zuordnungs-Regeln
// werden unabhaengig vom Client neu geprueft, und entweder wird der komplette
// Import atomar verarbeitet oder gar nichts geschrieben (keine stille
// Teilverarbeitung).
export async function confirmAndProcessDataImport(dataImportId: string, columns: MappingColumnDef[]): Promise<ConfirmProcessResult> {
  const { company, user } = await requireCompanyMember();
  await assertCanUploadDataImport(company.id);

  const dataImport = await prisma.dataImport.findFirst({ where: { id: dataImportId, companyId: company.id } });
  if (!dataImport) return { status: "error", message: "Datenimport wurde nicht gefunden." };
  if (dataImport.status === "PROCESSED") {
    return { status: "error", message: "Dieser Datenimport wurde bereits verarbeitet." };
  }
  if (dataImport.status === "CANCELED") {
    return { status: "error", message: "Dieser Datenimport wurde abgebrochen und kann nicht mehr verarbeitet werden." };
  }

  let parsed: Awaited<ReturnType<typeof parseFullSpreadsheetForProcessing>>;
  try {
    const buffer = Buffer.from(dataImport.fileContent);
    parsed = await parseFullSpreadsheetForProcessing(dataImport.fileType, buffer, dataImport.selectedSheetName);
  } catch (err) {
    // Technischer Fehler (Datei nicht mehr lesbar) - FAILED statt
    // VALIDATION_FAILED, siehe Statusfluss-Vorgabe (Punkt 36).
    const message = err instanceof ImportParseError ? err.message : "Die Datei konnte nicht erneut gelesen werden.";
    await prisma.dataImport.update({ where: { id: dataImportId }, data: { status: "FAILED", errorMessage: message } });
    revalidateImportPaths(dataImportId);
    return { status: "error", message };
  }

  const { columns: sanitized, duplicateFieldKeys } = sanitizeMappingColumns(dataImport.category, parsed.header, columns);

  if (duplicateFieldKeys.length > 0) {
    const labels = duplicateFieldKeys.map((k) => findFieldDefinition(dataImport.category, k)?.label ?? k).join(", ");
    const message = `Folgende Effivo-Felder wurden mehrfach zugeordnet: ${labels}. Bitte jedes Zielfeld nur einmal verwenden.`;
    await prisma.dataImport.update({ where: { id: dataImportId }, data: { status: "VALIDATION_FAILED", errorMessage: message } });
    revalidateImportPaths(dataImportId);
    return { status: "validation_error", message, rowErrors: [], totalRowErrors: 0 };
  }

  const mappedCount = sanitized.filter((c) => c.targetField && c.targetField !== IGNORE_FIELD_KEY).length;
  if (mappedCount === 0) {
    const message = "Es muss mindestens eine Spalte einem Effivo-Feld zugeordnet werden.";
    await prisma.dataImport.update({ where: { id: dataImportId }, data: { status: "VALIDATION_FAILED", errorMessage: message } });
    revalidateImportPaths(dataImportId);
    return { status: "validation_error", message, rowErrors: [], totalRowErrors: 0 };
  }

  const { records, rowErrors } = buildProcessedRecords(dataImport.category, parsed.rows, sanitized);

  if (rowErrors.length > 0) {
    // Priorität 5 (keine stille Datenverwerfung): bei irgendeinem
    // Zeilenfehler wird NICHTS gespeichert - keine Teilverarbeitung, damit
    // spaeter keine falschen (unvollstaendigen) Kennzahlen entstehen.
    const message = `${rowErrors.length} von ${records.length} Datensätzen benötigen Aufmerksamkeit.`;
    await prisma.dataImport.update({ where: { id: dataImportId }, data: { status: "VALIDATION_FAILED", errorMessage: message } });
    revalidateImportPaths(dataImportId);
    return {
      status: "validation_error",
      message,
      rowErrors: rowErrors.slice(0, 10).map((e) => e.message),
      totalRowErrors: rowErrors.length,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Idempotent bei einem erneuten Verarbeitungsversuch nach vorheriger
      // fachlicher Ablehnung (VALIDATION_FAILED): es koennen nie Datensaetze
      // aus einem zuvor abgelehnten Versuch existieren, da bei Fehlern oben
      // niemals geschrieben wird - trotzdem defensiv geleert.
      await tx.dataImportRecord.deleteMany({ where: { dataImportId } });
      await tx.dataImportRecord.createMany({
        data: records.map((r) => ({ ...r, dataImportId, companyId: company.id })) as unknown as Prisma.DataImportRecordCreateManyInput[],
      });
      await tx.dataImportMapping.upsert({
        where: { dataImportId },
        create: { dataImportId, companyId: company.id, columns: sanitized as unknown as Prisma.InputJsonValue },
        update: { columns: sanitized as unknown as Prisma.InputJsonValue },
      });
      await tx.dataImport.update({
        where: { id: dataImportId },
        data: {
          status: "PROCESSED",
          errorMessage: null,
          processedAt: new Date(),
          processedByUserId: user.id,
          processedRowCount: records.length,
          mappedColumnCount: mappedCount,
        },
      });
    });
  } catch {
    await prisma.dataImport.update({
      where: { id: dataImportId },
      data: { status: "FAILED", errorMessage: "Beim Verarbeiten ist ein unerwarteter Fehler aufgetreten." },
    });
    revalidateImportPaths(dataImportId);
    return { status: "error", message: "Beim Verarbeiten ist ein unerwarteter Fehler aufgetreten." };
  }

  // Mapping-Vorlage fuer kuenftige Importe ableiten (Punkt 22/23) - rein
  // additiver Komfort: ein Fehler hier darf den bereits erfolgreich
  // abgeschlossenen Import nicht ruecktraeglich als fehlgeschlagen erscheinen lassen.
  try {
    const signature = computeColumnSignature(parsed.header);
    const templateColumns = sanitized.map((c) => ({ sourceName: c.sourceName, targetField: c.targetField }));
    await prisma.dataImportMappingTemplate.upsert({
      where: {
        companyId_category_columnSignature: { companyId: company.id, category: dataImport.category, columnSignature: signature },
      },
      create: {
        companyId: company.id,
        category: dataImport.category,
        sourceSystem: dataImport.sourceSystem,
        columnSignature: signature,
        columns: templateColumns as unknown as Prisma.InputJsonValue,
      },
      update: {
        sourceSystem: dataImport.sourceSystem,
        columns: templateColumns as unknown as Prisma.InputJsonValue,
      },
    });
  } catch {
    // bewusst verschluckt, siehe Kommentar oben
  }

  revalidateImportPaths(dataImportId);
  return { status: "ok", recordCount: records.length };
}
