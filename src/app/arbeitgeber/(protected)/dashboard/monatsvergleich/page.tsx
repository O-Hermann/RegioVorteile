import { requireCompanyMember } from "@/lib/auth";
import { ActivityIcon } from "@/components/icons";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default async function MonatsvergleichPage() {
  await requireCompanyMember();

  return (
    <ModulePlaceholder
      icon={ActivityIcon}
      title="Monatsvergleich"
      description="Sobald mindestens zwei Monatsimporte vorliegen, vergleicht Effivo hier Ihren aktuellen Monat automatisch mit dem Vormonat – inklusive Differenz in Euro und Prozent."
    />
  );
}
