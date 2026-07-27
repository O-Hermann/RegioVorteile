import Link from "next/link";
import { requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";
import { cardClass } from "@/lib/ui";

export default async function VorteilePage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string }>;
}) {
  const { employee } = await requireEmployee();
  const { kategorie } = await searchParams;

  const partners = await prisma.partnerBusiness.findMany({
    where: {
      regionId: employee.employer.regionId,
      active: true,
      ...(kategorie ? { category: kategorie } : {}),
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-sand-900">
        Vorteile in {employee.employer.region.name}
      </h1>
      <p className="mt-1 text-sm text-sand-600">
        Rabatte bei Partnerbetrieben aus deiner Region.
      </p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/mitarbeiter/vorteile"
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
            !kategorie ? "bg-ink-700 text-white" : "bg-card border border-card-border text-sand-700"
          }`}
        >
          Alle
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/mitarbeiter/vorteile?kategorie=${encodeURIComponent(c)}`}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
              kategorie === c ? "bg-ink-700 text-white" : "bg-card border border-card-border text-sand-700"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {partners.length === 0 && (
          <p className={`${cardClass} text-sand-500`}>
            Für diese Auswahl gibt es aktuell keine Partnerbetriebe.
          </p>
        )}
        {partners.map((partner) => (
          <Link
            key={partner.id}
            href={`/mitarbeiter/vorteile/${partner.id}`}
            className={`${cardClass} block hover:border-ink-300 transition-colors`}
          >
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sand-900">{partner.name}</p>
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800">
                {partner.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-gold-700 dark:text-gold-300 font-medium">{partner.discountText}</p>
            <p className="mt-1 text-xs text-sand-500">
              {partner.street}, {partner.plz} {partner.city}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
