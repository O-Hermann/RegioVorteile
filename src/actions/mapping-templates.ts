"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember, assertCanUploadDataImport } from "@/lib/auth";
import { sanitizeMappingColumns, type MappingColumnDef } from "@/lib/import-process";
import { findFieldDefinition } from "@/lib/import-fields";
import { Prisma } from "@/generated/prisma/client";

const SETTINGS_PATH = "/arbeitgeber/dashboard/einstellungen";

export type UpdateTemplateResult = { status: "ok" } | { status: "error"; message: string };

// MVP-Roadmap Phase 7 (siehe [[effivo_mvp_roadmap]]): erlaubt, eine bereits
// abgeleitete Mapping-Vorlage (siehe confirmAndProcessDataImport() in
// actions/data-import-mapping.ts, wo sie automatisch beim Verarbeiten eines
// Imports entsteht/aktualisiert wird) nachtraeglich zu korrigieren, ohne
// dafuer einen neuen Import hochladen zu muessen. Dieselbe Berechtigung wie
// der Datenimport-Upload selbst (assertCanUploadDataImport), da eine
// Vorlage nur kuenftige Importe beeinflusst.
export async function updateMappingTemplate(
  templateId: string,
  sourceSystem: string | null,
  columns: MappingColumnDef[],
): Promise<UpdateTemplateResult> {
  const { company } = await requireCompanyMember();
  await assertCanUploadDataImport(company.id);

  const template = await prisma.dataImportMappingTemplate.findFirst({ where: { id: templateId, companyId: company.id } });
  if (!template) return { status: "error", message: "Mapping-Vorlage wurde nicht gefunden." };

  const header = columns.map((c) => c.sourceName);
  const { columns: sanitized, duplicateFieldKeys } = sanitizeMappingColumns(template.category, header, columns);

  if (duplicateFieldKeys.length > 0) {
    const labels = duplicateFieldKeys.map((k) => findFieldDefinition(template.category, k)?.label ?? k).join(", ");
    return { status: "error", message: `Folgende Effivo-Felder wurden mehrfach zugeordnet: ${labels}. Bitte jedes Zielfeld nur einmal verwenden.` };
  }

  const templateColumns = sanitized.map((c) => ({ sourceName: c.sourceName, targetField: c.targetField }));
  await prisma.dataImportMappingTemplate.update({
    where: { id: templateId },
    data: { sourceSystem: sourceSystem?.trim() || null, columns: templateColumns as unknown as Prisma.InputJsonValue },
  });

  revalidatePath(SETTINGS_PATH);
  return { status: "ok" };
}

export async function deleteMappingTemplate(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "");
  const { company } = await requireCompanyMember();
  await assertCanUploadDataImport(company.id);

  const template = await prisma.dataImportMappingTemplate.findFirst({ where: { id: templateId, companyId: company.id } });
  if (!template) redirect(`${SETTINGS_PATH}?tab=vorlagen&error=not-found`);

  await prisma.dataImportMappingTemplate.delete({ where: { id: templateId } });
  revalidatePath(SETTINGS_PATH);
  redirect(`${SETTINGS_PATH}?tab=vorlagen&deleted=1`);
}
