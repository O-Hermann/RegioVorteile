import { requireCompanyMember } from "@/lib/auth";
import { TrendingUpIcon } from "@/components/icons";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { PageNav } from "@/components/page-nav";

export default async function EntwicklungPage() {
  await requireCompanyMember();

  return (
    <div>
      <PageNav />
      <ModulePlaceholder
        icon={TrendingUpIcon}
        title="Entwicklung"
        description="Nach dem ersten Datenimport zeigt Effivo hier den Verlauf von Umsatz, Kosten und Ergebnis über mehrere Monate."
      />
    </div>
  );
}
