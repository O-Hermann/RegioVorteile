import { requireCompanyMember } from "@/lib/auth";
import { BriefcaseIcon } from "@/components/icons";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default async function AuftraegeKundenPage() {
  await requireCompanyMember();

  return (
    <ModulePlaceholder
      icon={BriefcaseIcon}
      title="Aufträge und Kunden"
      description="Sobald Auftrags- oder Kundendaten importiert werden, erscheinen hier offene und abgeschlossene Aufträge sowie aktive und neue Kunden."
    />
  );
}
