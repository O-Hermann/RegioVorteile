import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { registerEmployer } from "@/actions/employer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Bitte alle Felder ausfüllen.",
  email: "Für diese E-Mail existiert bereits ein Account.",
  pricing: "Für diese Mitarbeiterzahl konnte keine Preisstufe gefunden werden.",
};

export default async function ArbeitgeberRegistrierenPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [regions, pricingTiers] = await Promise.all([
    prisma.region.findMany({ orderBy: { name: "asc" } }),
    prisma.pricingTier.findMany({ orderBy: { minEmployees: "asc" } }),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 py-16 grid gap-10 lg:grid-cols-[3fr_2fr]">
        <div className={cardClass}>
          <h1 className="font-display text-2xl font-semibold text-sand-900">
            Arbeitgeber-Registrierung
          </h1>
          <p className="mt-1 text-sm text-sand-600">
            Nach der Registrierung können Sie sofort Mitarbeitende einladen.
          </p>
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {ERROR_MESSAGES[error] ?? "Registrierung fehlgeschlagen."}
            </p>
          )}
          <form action={registerEmployer} className="mt-6 space-y-4">
            <div>
              <label className={labelClass} htmlFor="companyName">
                Firmenname
              </label>
              <input className={inputClass} name="companyName" id="companyName" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="email">
                  E-Mail
                </label>
                <input className={inputClass} type="email" name="email" id="email" required />
              </div>
              <div>
                <label className={labelClass} htmlFor="password">
                  Passwort
                </label>
                <input
                  className={inputClass}
                  type="password"
                  name="password"
                  id="password"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="employeeCount">
                  Mitarbeiterzahl
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  name="employeeCount"
                  id="employeeCount"
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="regionId">
                  Region
                </label>
                <select className={inputClass} name="regionId" id="regionId" required defaultValue="">
                  <option value="" disabled>
                    Bitte wählen
                  </option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className={`w-full ${primaryButtonClass}`}>
              Registrieren &amp; Abo starten
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-sand-500">
            Schon registriert?{" "}
            <Link href="/arbeitgeber/login" className="text-sand-900 hover:underline">
              Zum Login
            </Link>
          </p>
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Preisstufen</h2>
          <p className="mt-1 text-sm text-sand-600">
            Die passende Stufe wird automatisch anhand Ihrer Mitarbeiterzahl gewählt.
          </p>
          <div className="mt-4 space-y-3">
            {pricingTiers.map((tier) => (
              <div key={tier.id} className="rounded-xl border border-card-border px-4 py-3">
                <p className="font-semibold text-sand-900">{tier.label}</p>
                <p className="text-xs text-sand-500">
                  {tier.minEmployees}
                  {tier.maxEmployees ? `–${tier.maxEmployees}` : "+"} Mitarbeitende
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-gold-700 dark:text-gold-300">
                  {formatPrice(tier.monthlyPriceCents)}
                  <span className="text-xs font-sans font-normal text-sand-500"> /Monat</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
