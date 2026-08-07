import { requireCompanyMember } from "@/lib/auth";
import { FileTextIcon } from "@/components/icons";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default async function FinanzuebersichtPage() {
  await requireCompanyMember();

  return (
    <ModulePlaceholder
      icon={FileTextIcon}
      title="Finanzübersicht"
      description="Nach dem ersten Datenimport fasst Effivo hier Umsatz, Kosten, Ergebnis und offene Forderungen kompakt zusammen."
    />
  );
}
