import { notFound } from "next/navigation";
import { requireCompanyMember } from "@/lib/auth";
import { COMPANY_IMPORT_UPLOAD_ROLES } from "@/lib/company";
import { getMappingTemplate } from "@/lib/settings";
import { IMPORT_FIELD_REGISTRY } from "@/lib/import-fields";
import { DATA_IMPORT_CATEGORY_LABELS } from "@/lib/data-import";
import { MappingTemplateEditor } from "@/components/mapping-template-editor";
import type { MappingFieldOption } from "@/components/import-mapping-editor";
import { PageNav } from "@/components/page-nav";
import { dashCardClass, dashSecondaryTextClass } from "@/components/dashboard/dash-ui";

// MVP-Roadmap Phase 7 (siehe [[effivo_mvp_roadmap]]): Bearbeitungsseite fuer
// eine einzelne Mapping-Vorlage, verlinkt von der Einstellungen-Seite
// (Tab "vorlagen"). Nur fuer Rollen mit Datenimport-Berechtigung - eine
// Vorlage beeinflusst nur zukuenftige eigene Importe.
export default async function MappingVorlageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { company, membership } = await requireCompanyMember();

  if (!COMPANY_IMPORT_UPLOAD_ROLES.includes(membership.role)) {
    notFound();
  }

  const template = await getMappingTemplate(company.id, id);
  if (!template) notFound();

  const fields = IMPORT_FIELD_REGISTRY[template.category];
  const fieldGroups: MappingFieldOption[][] = [];
  const groupOrder: string[] = [];
  for (const f of fields) {
    let groupIdx = groupOrder.indexOf(f.group);
    if (groupIdx === -1) {
      groupIdx = groupOrder.length;
      groupOrder.push(f.group);
      fieldGroups.push([]);
    }
    fieldGroups[groupIdx].push({ key: f.key, label: f.label, group: f.group });
  }
  const fieldGroupsOut = groupOrder.map((group, i) => ({ group, fields: fieldGroups[i] }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageNav backHref="/arbeitgeber/dashboard/einstellungen?tab=vorlagen" backLabel="Zurück zu den Mapping-Vorlagen" />
      <div className="mt-2">
        <h1 className="text-3xl font-semibold text-dash-text">Mapping-Vorlage bearbeiten</h1>
        <p className={`mt-2 max-w-xl ${dashSecondaryTextClass}`}>
          {DATA_IMPORT_CATEGORY_LABELS[template.category]} · gilt für künftige Importe mit denselben Spaltennamen.
        </p>
      </div>

      <div className={`mt-6 p-6 ${dashCardClass}`}>
        <MappingTemplateEditor
          templateId={template.id}
          initialSourceSystem={template.sourceSystem}
          columns={template.columns}
          fieldGroups={fieldGroupsOut}
        />
      </div>
    </div>
  );
}
