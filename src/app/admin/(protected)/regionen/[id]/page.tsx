import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateRegion } from "@/actions/admin";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

export default async function EditRegionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const region = await prisma.region.findUnique({ where: { id } });
  if (!region) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">
        {region.name} bearbeiten
      </h1>
      <div className={`${cardClass} mt-6`}>
        <form action={updateRegion} className="space-y-4">
          <input type="hidden" name="id" value={region.id} />
          <div>
            <label className={labelClass} htmlFor="name">
              Name
            </label>
            <input
              className={inputClass}
              name="name"
              id="name"
              defaultValue={region.name}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="plzCodes">
              PLZ-Gebiete (Komma-getrennt)
            </label>
            <input
              className={inputClass}
              name="plzCodes"
              id="plzCodes"
              defaultValue={region.plzCodes}
              required
            />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Änderungen speichern
          </button>
        </form>
      </div>
    </div>
  );
}
