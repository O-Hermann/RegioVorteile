"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember, assertCanUploadDataImport } from "@/lib/auth";
import { parseSpreadsheetPreview, ImportParseError } from "@/lib/import-parse";
import {
  MAX_IMPORT_FILE_SIZE_BYTES,
  MAX_IMPORT_FILE_SIZE_LABEL,
  extensionForFileName,
  fileTypeForExtension,
  type CreateDataImportState,
} from "@/lib/data-import";
import type { DataImportCategory } from "@/generated/prisma/client";

function parseCategory(value: FormDataEntryValue | null): DataImportCategory | null {
  const v = String(value ?? "");
  return v === "FINANCE" || v === "ORDERS" || v === "CUSTOMERS" ? v : null;
}

// Datei-Inhalte gelten grundsaetzlich als nicht vertrauenswuerdig: die vom
// Client gezeigte Vorschau ist reine UX, hier wird alles unabhaengig und
// autoritativ neu geprueft, bevor irgendetwas gespeichert wird.
export async function createDataImport(
  _prevState: CreateDataImportState,
  formData: FormData,
): Promise<CreateDataImportState> {
  const companyId = String(formData.get("companyId") ?? "");
  const { company, user } = await requireCompanyMember(companyId || undefined);
  await assertCanUploadDataImport(company.id);

  const periodMonth = Number(formData.get("periodMonth"));
  const periodYear = Number(formData.get("periodYear"));
  const category = parseCategory(formData.get("category"));
  const sourceSystemRaw = String(formData.get("sourceSystem") ?? "").trim();
  const sourceSystem = sourceSystemRaw ? sourceSystemRaw.slice(0, 60) : null;
  const requestedSheetName = String(formData.get("selectedSheetName") ?? "").trim() || undefined;
  const confirmDuplicate = String(formData.get("confirmDuplicate") ?? "") === "1";
  const file = formData.get("file");

  if (
    !Number.isInteger(periodMonth) ||
    periodMonth < 1 ||
    periodMonth > 12 ||
    !Number.isInteger(periodYear) ||
    periodYear < 2000 ||
    periodYear > 2100
  ) {
    return { status: "error", message: "Bitte einen gültigen Zeitraum (Monat und Jahr) auswählen." };
  }
  if (!category) {
    return { status: "error", message: "Bitte eine Datenkategorie auswählen." };
  }
  if (!(file instanceof File)) {
    return { status: "error", message: "Bitte eine Datei auswählen." };
  }
  if (file.size === 0) {
    return { status: "error", message: "Die Datei ist leer." };
  }
  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    return { status: "error", message: `Die Datei ist zu groß. Maximal ${MAX_IMPORT_FILE_SIZE_LABEL}.` };
  }

  const extension = extensionForFileName(file.name);
  const fileType = fileTypeForExtension(extension);
  if (!fileType) {
    return {
      status: "error",
      message: "Dateityp nicht unterstützt. Bitte eine XLSX-, XLS- oder CSV-Datei hochladen.",
    };
  }

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    return { status: "error", message: "Die Datei konnte nicht gelesen werden." };
  }
  const buffer = Buffer.from(arrayBuffer);
  const checksumSha256 = createHash("sha256").update(buffer).digest("hex");

  const existingDuplicate = await prisma.dataImport.findFirst({
    where: { companyId: company.id, checksumSha256 },
    orderBy: { createdAt: "desc" },
  });
  if (existingDuplicate && !confirmDuplicate) {
    return {
      status: "duplicate",
      message: `Diese Datei wurde bereits am ${existingDuplicate.createdAt.toLocaleDateString("de-DE")} hochgeladen.`,
      duplicateCreatedAt: existingDuplicate.createdAt.toISOString(),
    };
  }

  let preview;
  try {
    preview = parseSpreadsheetPreview(new Uint8Array(buffer), fileType, requestedSheetName);
  } catch (err) {
    if (err instanceof ImportParseError) {
      return { status: "error", message: err.message };
    }
    return { status: "error", message: "Die Datei konnte nicht gelesen werden. Bitte prüfen Sie das Dateiformat." };
  }

  let createdId: string;
  try {
    const created = await prisma.dataImport.create({
      data: {
        companyId: company.id,
        uploadedByUserId: user.id,
        periodMonth,
        periodYear,
        category,
        sourceSystem,
        fileName: file.name.slice(0, 255),
        fileType,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileContent: buffer,
        selectedSheetName: fileType === "csv" ? null : preview.selectedSheetName,
        sheetNames: preview.sheetNames,
        checksumSha256,
        rowCount: preview.rowCount,
        columnCount: preview.columnCount,
        status: "READY_FOR_MAPPING",
      },
    });
    createdId = created.id;
  } catch {
    return {
      status: "error",
      message: "Beim Speichern ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }

  revalidatePath("/arbeitgeber/dashboard");
  revalidatePath("/arbeitgeber/dashboard/datenimporte");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/datenimporte");
  redirect(`/arbeitgeber/dashboard/datenimporte/${createdId}`);
}
