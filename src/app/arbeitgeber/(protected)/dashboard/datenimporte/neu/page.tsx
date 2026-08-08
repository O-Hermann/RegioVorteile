import { assertCanUploadDataImport, requireCompanyMember } from "@/lib/auth";
import { ImportWizard } from "@/components/import-wizard";

export default async function NeuerDatenimportPage() {
  const { company } = await requireCompanyMember();
  // Serverseitige Rechteprüfung - ein Betrachter/Geschäftsführung, der diese
  // Route direkt aufruft, wird hier verwiesen, nicht nur der Button versteckt.
  await assertCanUploadDataImport(company.id);

  return <ImportWizard companyId={company.id} />;
}
