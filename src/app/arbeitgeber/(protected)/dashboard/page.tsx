import Link from "next/link";
import { requireEmployer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import { CategoryBarChart } from "@/components/category-bar-chart";
import { MonthlyBarChart } from "@/components/monthly-bar-chart";

// Datenschutzschwelle: Kategorie-/Partner-Auswertungen koennten bei sehr wenigen
// aktivierten Zugaengen indirekt auf einzelne Personen schliessen lassen und
// werden daher erst ab dieser Anzahl aktiver Mitarbeitender gezeigt.
const MIN_ACTIVE_FOR_DETAILS = 5;

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export default async function ArbeitgeberDashboardPage() {
  const { employer } = await requireEmployer();

  const [pricingTier, region, employeeCount, activeCount, redemptions] = await Promise.all([
    prisma.pricingTier.findUnique({ where: { id: employer.pricingTierId } }),
    prisma.region.findUnique({ where: { id: employer.regionId } }),
    prisma.employee.count({ where: { employerId: employer.id } }),
    prisma.employee.count({ where: { employerId: employer.id, status: "ACTIVE" } }),
    // Nur aggregiert ausgewertet - der Arbeitgeber sieht nie, welcher einzelne
    // Mitarbeiter welchen Rabatt eingeloest hat, nur zusammengefasste Kennzahlen.
    prisma.redemption.findMany({
      where: { employee: { employerId: employer.id } },
      select: { createdAt: true, partnerBusiness: { select: { name: true, category: true } } },
    }),
  ]);

  const categoryCounts = new Map<string, number>();
  const partnerCounts = new Map<string, number>();
  for (const r of redemptions) {
    categoryCounts.set(r.partnerBusiness.category, (categoryCounts.get(r.partnerBusiness.category) ?? 0) + 1);
    partnerCounts.set(r.partnerBusiness.name, (partnerCounts.get(r.partnerBusiness.name) ?? 0) + 1);
  }
  const categoryData = [...categoryCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  const topPartners = [...partnerCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const now = new Date();
  const monthlyBuckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString("de-DE", { month: "short" }), count: 0 };
  });
  for (const r of redemptions) {
    const bucket = monthlyBuckets.find(
      (b) => b.year === r.createdAt.getFullYear() && b.month === r.createdAt.getMonth()
    );
    if (bucket) bucket.count++;
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-sand-900">
        {employer.companyName}
      </h1>
      <p className="mt-2 text-sand-600">Region: {region?.name ?? "-"}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={cardClass}>
          <p className="text-sm text-sand-500">Preisstufe</p>
          <p className="mt-1 font-display text-2xl font-semibold text-sand-900">
            {pricingTier?.label ?? "-"}
          </p>
          {pricingTier && (
            <p className="text-sm text-sand-500">
              {formatPrice(pricingTier.monthlyPriceCents)}/Monat
            </p>
          )}
          <span className="mt-2 inline-block rounded-full bg-sand-200 px-2 py-0.5 text-xs font-medium text-sand-700">
            {employer.subscriptionStatus}
          </span>
        </div>
        <div className={cardClass}>
          <p className="text-sm text-sand-500">Mitarbeitende eingeladen</p>
          <p className="mt-1 font-display text-2xl font-semibold text-sand-900">{employeeCount}</p>
        </div>
        <div className={cardClass}>
          <p className="text-sm text-sand-500">Registrierte Mitarbeiter</p>
          <p className="mt-1 font-display text-2xl font-semibold text-sand-900">
            {activeCount} von {employeeCount}
          </p>
          <p className="mt-1 text-xs text-sand-400">haben sich mit ihrem Code angemeldet</p>
        </div>
        <div className={cardClass}>
          <p className="text-sm text-sand-500">Einlösungen</p>
          <p className="mt-1 font-display text-2xl font-semibold text-gold-700 dark:text-gold-300">
            {redemptions.length}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-sand-900">Nutzungsstatistik</h2>
        <Link href="/arbeitgeber/dashboard/mitarbeiter" className={primaryButtonClass}>
          Mitarbeitende verwalten
        </Link>
      </div>
      <p className="mt-1 text-sm text-sand-500">
        Nur anonymisiert &amp; zusammengefasst - einzelne Mitarbeitende sind hier nicht
        einsehbar.
      </p>

      <div className={`${cardClass} mt-4`}>
        <h3 className="font-display text-base font-semibold text-sand-900">
          Einlösungen pro Monat
        </h3>
        <div className="mt-6">
          <MonthlyBarChart data={monthlyBuckets} />
        </div>
      </div>

      {activeCount < MIN_ACTIVE_FOR_DETAILS ? (
        <div className={`${cardClass} mt-4 border-l-4 border-l-gold-400`}>
          <p className="font-semibold text-sand-900">
            Noch nicht genügend anonymisierte Nutzungsdaten vorhanden.
          </p>
          <p className="mt-1 text-sm text-sand-600">
            Detailauswertungen werden ab {MIN_ACTIVE_FOR_DETAILS} aktivierten Zugängen
            angezeigt ({activeCount}/{MIN_ACTIVE_FOR_DETAILS} bisher) - so lässt sich bei sehr
            wenigen Mitarbeitenden nicht indirekt auf Einzelpersonen schließen.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[3fr_2fr]">
          <div className={cardClass}>
            <h3 className="font-display text-base font-semibold text-sand-900">
              Einlösungen nach Kategorie
            </h3>
            {categoryData.length === 0 ? (
              <p className="mt-4 text-sm text-sand-500">Noch keine Rabatte eingelöst.</p>
            ) : (
              <div className="mt-4">
                <CategoryBarChart data={categoryData} />
              </div>
            )}
          </div>

          <div className={cardClass}>
            <h3 className="font-display text-base font-semibold text-sand-900">
              Meistgenutzte Partnerbetriebe
            </h3>
            {topPartners.length === 0 ? (
              <p className="mt-4 text-sm text-sand-500">Noch keine Rabatte eingelöst.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {topPartners.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-800">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-sand-800">{p.name}</span>
                    <span className="text-sm tabular-nums text-sand-500">{p.count}×</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
