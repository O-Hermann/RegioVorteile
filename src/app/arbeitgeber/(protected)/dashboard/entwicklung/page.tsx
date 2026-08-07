import { requireCompanyMember } from "@/lib/auth";
import { TrendingUpIcon } from "@/components/icons";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default async function EntwicklungPage() {
  await requireCompanyMember();

  return (
    <ModulePlaceholder
      icon={TrendingUpIcon}
      title="Entwicklung"
      description="Nach dem ersten Datenimport zeigt Effivo hier den Verlauf von Umsatz, Kosten und Ergebnis über mehrere Monate."
    />
  );
}
