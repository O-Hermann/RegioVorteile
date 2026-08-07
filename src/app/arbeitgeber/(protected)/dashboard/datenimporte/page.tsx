import { requireCompanyMember } from "@/lib/auth";
import { UploadIcon } from "@/components/icons";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default async function DatenimportePage() {
  await requireCompanyMember();

  return (
    <ModulePlaceholder
      icon={UploadIcon}
      title="Datenimporte"
      description="Datenimporte werden als Nächstes eingerichtet. Bald können Sie hier Excel- oder CSV-Dateien für einen Monatszeitraum hochladen und automatisch auswerten lassen."
      showImportCta={false}
    />
  );
}
