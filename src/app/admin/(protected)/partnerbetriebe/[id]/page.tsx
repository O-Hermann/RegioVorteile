import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePartner } from "@/actions/admin";
import { PartnerForm } from "@/components/partner-form";
import { cardClass } from "@/lib/ui";

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [partner, regions] = await Promise.all([
    prisma.partnerBusiness.findUnique({ where: { id } }),
    prisma.region.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!partner) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">
        {partner.name} bearbeiten
      </h1>
      <div className={`${cardClass} mt-6`}>
        <PartnerForm action={updatePartner} regions={regions} partner={partner} />
      </div>
    </div>
  );
}
