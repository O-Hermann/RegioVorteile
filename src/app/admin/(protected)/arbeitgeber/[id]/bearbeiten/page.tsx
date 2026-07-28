import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateEmployer } from "@/actions/admin";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditEmployerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employer, regions, pricingTiers] = await Promise.all([
    prisma.employer.findUnique({ where: { id }, include: { user: true } }),
    prisma.region.findMany({ orderBy: { name: "asc" } }),
    prisma.pricingTier.findMany({ orderBy: { minEmployees: "asc" } }),
  ]);

  if (!employer) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/admin/arbeitgeber/${employer.id}`} className="text-sm text-sand-500 hover:text-sand-900">
        ← Zurück zur Übersicht
      </Link>
      <h1 className="mt-2 font-display text-3xl font-semibold text-sand-900">
        {employer.companyName} bearbeiten
      </h1>
      <p className="mt-1 text-sm text-sand-500">{employer.user.email}</p>

      <div className={`${cardClass} mt-6`}>
        <form action={updateEmployer} className="space-y-4">
          <input type="hidden" name="id" value={employer.id} />
          <div>
            <label className={labelClass} htmlFor="companyName">
              Firmenname
            </label>
            <input
              className={inputClass}
              name="companyName"
              id="companyName"
              defaultValue={employer.companyName}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="contactFirstName">
                Vorname (Ansprechpartner)
              </label>
              <input
                className={inputClass}
                name="contactFirstName"
                id="contactFirstName"
                defaultValue={employer.contactFirstName ?? ""}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="contactLastName">
                Nachname (Ansprechpartner)
              </label>
              <input
                className={inputClass}
                name="contactLastName"
                id="contactLastName"
                defaultValue={employer.contactLastName ?? ""}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">
              Telefon / Handynummer
            </label>
            <input
              className={inputClass}
              type="tel"
              name="phone"
              id="phone"
              defaultValue={employer.phone ?? ""}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="street">
              Straße und Hausnummer
            </label>
            <input
              className={inputClass}
              name="street"
              id="street"
              defaultValue={employer.street ?? ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="plz">
                PLZ
              </label>
              <input className={inputClass} name="plz" id="plz" defaultValue={employer.plz ?? ""} />
            </div>
            <div>
              <label className={labelClass} htmlFor="city">
                Ort
              </label>
              <input className={inputClass} name="city" id="city" defaultValue={employer.city ?? ""} />
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
                defaultValue={employer.employeeCount}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="regionId">
                Region
              </label>
              <select
                className={inputClass}
                name="regionId"
                id="regionId"
                defaultValue={employer.regionId}
                required
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="pricingTierId">
              Preisstufe
            </label>
            <select
              className={inputClass}
              name="pricingTierId"
              id="pricingTierId"
              defaultValue={employer.pricingTierId}
              required
            >
              {pricingTiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-sand-500">
              Wird bei der Registrierung automatisch anhand der Mitarbeiterzahl gewählt, kann hier
              aber manuell überschrieben werden.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="subscriptionStatus">
                Abo-Status
              </label>
              <select
                className={inputClass}
                name="subscriptionStatus"
                id="subscriptionStatus"
                defaultValue={employer.subscriptionStatus}
                required
              >
                <option value="ausstehend">ausstehend</option>
                <option value="aktiv">aktiv</option>
                <option value="gekündigt">gekündigt</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="contractEndDate">
                Vertragslaufzeit bis
              </label>
              <input
                className={inputClass}
                type="date"
                name="contractEndDate"
                id="contractEndDate"
                defaultValue={toDateInputValue(employer.contractEndDate)}
                required
              />
            </div>
          </div>
          <button type="submit" className={primaryButtonClass}>
            Änderungen speichern
          </button>
        </form>
      </div>
    </div>
  );
}
