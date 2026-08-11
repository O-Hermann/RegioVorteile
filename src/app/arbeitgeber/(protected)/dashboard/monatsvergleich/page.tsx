import { requireCompanyMember } from "@/lib/auth";
import { ActivityIcon } from "@/components/icons";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { PageNav } from "@/components/page-nav";

export default async function MonatsvergleichPage() {
  await requireCompanyMember();

  return (
    <div>
      <PageNav />
      <ModulePlaceholder
        icon={ActivityIcon}
        title="Monatsvergleich"
        description="Sobald mindestens zwei Monatsimporte vorliegen, vergleicht Effivo hier Ihren aktuellen Monat automatisch mit dem Vormonat – inklusive Differenz in Euro und Prozent."
      />
    </div>
  );
}
