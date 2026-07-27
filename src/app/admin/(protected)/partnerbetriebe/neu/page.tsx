import { prisma } from "@/lib/prisma";
import { createPartner } from "@/actions/admin";
import { PartnerForm } from "@/components/partner-form";
import { cardClass } from "@/lib/ui";

export default async function NewPartnerPage() {
  const regions = await prisma.region.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Neuer Partnerbetrieb</h1>
      <div className={`${cardClass} mt-6`}>
        <PartnerForm action={createPartner} regions={regions} />
      </div>
    </div>
  );
}
