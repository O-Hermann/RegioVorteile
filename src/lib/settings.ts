import "server-only";
import { prisma } from "@/lib/prisma";
import type { DataImportCategory, NotificationPreference } from "@/generated/prisma/client";
import { IGNORE_FIELD_KEY } from "@/lib/import-fields";

// MVP-Roadmap Phase 7 (Einstellungen, siehe [[effivo_mvp_roadmap]]): reine
// Lese-Bausteine fuer die Einstellungen-Seite, analog lib/cases.ts/
// lib/customers.ts - Seiten stellen ausschliesslich hier berechnete Werte
// dar, keine Prisma-Aufrufe direkt in page.tsx. Mutationen leben getrennt in
// actions/settings.ts bzw. actions/mapping-templates.ts.

export async function getNotificationPreference(companyId: string): Promise<NotificationPreference | null> {
  return prisma.notificationPreference.findUnique({ where: { companyId } });
}

export type TemplateColumn = { sourceName: string; targetField: string | null };

export type MappingTemplateListItem = {
  id: string;
  category: DataImportCategory;
  sourceSystem: string | null;
  columnCount: number;
  mappedColumnCount: number;
  updatedAt: Date;
};

function parseTemplateColumns(columns: unknown): TemplateColumn[] {
  if (!Array.isArray(columns)) return [];
  return columns as TemplateColumn[];
}

export async function getMappingTemplates(companyId: string): Promise<MappingTemplateListItem[]> {
  const rows = await prisma.dataImportMappingTemplate.findMany({ where: { companyId }, orderBy: { updatedAt: "desc" } });
  return rows.map((r) => {
    const columns = parseTemplateColumns(r.columns);
    return {
      id: r.id,
      category: r.category,
      sourceSystem: r.sourceSystem,
      columnCount: columns.length,
      mappedColumnCount: columns.filter((c) => c.targetField && c.targetField !== IGNORE_FIELD_KEY).length,
      updatedAt: r.updatedAt,
    };
  });
}

export type MappingTemplateDetail = {
  id: string;
  category: DataImportCategory;
  sourceSystem: string | null;
  columns: TemplateColumn[];
};

export async function getMappingTemplate(companyId: string, id: string): Promise<MappingTemplateDetail | null> {
  const row = await prisma.dataImportMappingTemplate.findFirst({ where: { id, companyId } });
  if (!row) return null;
  return { id: row.id, category: row.category, sourceSystem: row.sourceSystem, columns: parseTemplateColumns(row.columns) };
}

export const SETTINGS_ERROR_MESSAGES: Record<string, string> = {
  missing: "Bitte den Firmennamen ausfüllen.",
  "wrong-current": "Das aktuelle Passwort ist nicht korrekt.",
  "invalid-new": "Bitte zwei identische neue Passwörter mit mindestens 8 Zeichen eingeben.",
  "not-found": "Eintrag wurde nicht gefunden.",
};
