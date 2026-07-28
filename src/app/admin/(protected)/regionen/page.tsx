import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createRegion, deleteRegion } from "@/actions/admin";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
  dangerButtonClass,
  cardClass,
} from "@/lib/ui";

export default async function AdminRegionenPage() {
  const regions = await prisma.region.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { employers: true, partners: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Regionen</h1>
      <p className="mt-2 text-sand-600">
        Regionen bestimmen, welche Partnerbetriebe Mitarbeitende eines Arbeitgebers sehen.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {regions.length === 0 && (
            <p className={`${cardClass} text-sand-500`}>Noch keine Regionen angelegt.</p>
          )}
          {regions.map((region) => (
            <div key={region.id} className={`${cardClass} flex items-center justify-between gap-4`}>
              <div>
                <p className="font-semibold text-sand-900">{region.name}</p>
                <p className="text-sm text-sand-500">PLZ: {region.plzCodes}</p>
                <p className="mt-1 text-xs text-sand-400">
                  {region._count.employers} Arbeitgeber · {region._count.partners} Partnerbetriebe
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/regionen/${region.id}`} className={secondaryButtonClass}>
                  Bearbeiten
                </Link>
                <form action={deleteRegion}>
                  <input type="hidden" name="id" value={region.id} />
                  <button type="submit" className={dangerButtonClass}>
                    Löschen
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Neue Region</h2>
          <form action={createRegion} className="mt-4 space-y-4">
            <div>
              <label className={labelClass} htmlFor="name">
                Name
              </label>
              <input className={inputClass} name="name" id="name" placeholder="Region Musterstadt" required />
            </div>
            <div>
              <label className={labelClass} htmlFor="plzCodes">
                PLZ-Gebiete (Komma-getrennt)
              </label>
              <input
                className={inputClass}
                name="plzCodes"
                id="plzCodes"
                placeholder="12345, 12347, 12350"
                required
              />
            </div>
            <button type="submit" className={`w-full ${primaryButtonClass}`}>
              Region anlegen
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
