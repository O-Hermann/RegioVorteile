import { requireCompanyMember } from "@/lib/auth";
import { ActivityIcon } from "@/components/icons";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { BackLink } from "@/components/back-link";

export default async function MonatsvergleichPage() {
  await requireCompanyMember();

  return (
    <div>
      <BackLink href="/arbeitgeber/dashboard" label="Zurück zur Übersicht" />
      <ModulePlaceholder
        icon={ActivityIcon}
        title="Monatsvergleich"
        description="Sobald mindestens zwei Monatsimporte vorliegen, vergleicht Effivo hier Ihren aktuellen Monat automatisch mit dem Vormonat – inklusive Differenz in Euro und Prozent."
      />
    </div>
  );
}
