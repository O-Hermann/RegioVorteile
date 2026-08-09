import Link from "next/link";
import { requireCompanyMember, assertCanManageCustomers } from "@/lib/auth";
import { CUSTOMER_ERROR_MESSAGES } from "@/lib/customers";
import { createCustomer } from "@/actions/customers";
import { CustomerFormFields } from "@/components/customers/customer-form-fields";
import { cardClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui";

export default async function NeuerKundePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { company } = await requireCompanyMember();
  await assertCanManageCustomers(company.id);
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Neuer Kunde</h1>
      <p className="mt-2 text-sand-600 dark:text-cockpit-text-secondary">
        Legen Sie einen neuen Kunden mit Stammdaten und optional einem ersten Ansprechpartner an.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {CUSTOMER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}

      <form action={createCustomer} className={`mt-6 ${cardClass}`}>
        <CustomerFormFields />

        <section className="mt-6">
          <h2 className="font-display text-lg font-semibold text-sand-900">Hauptansprechpartner</h2>
          <p className="mt-1 text-sm text-sand-500 dark:text-cockpit-text-secondary">Optional - kann auch später ergänzt werden.</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="contactFirstName">
                Vorname
              </label>
              <input className={inputClass} id="contactFirstName" name="contactFirstName" maxLength={200} />
            </div>
            <div>
              <label className={labelClass} htmlFor="contactLastName">
                Nachname
              </label>
              <input className={inputClass} id="contactLastName" name="contactLastName" maxLength={200} />
            </div>
            <div>
              <label className={labelClass} htmlFor="contactPosition">
                Position
              </label>
              <input className={inputClass} id="contactPosition" name="contactPosition" maxLength={200} />
            </div>
            <div>
              <label className={labelClass} htmlFor="contactEmail">
                E-Mail
              </label>
              <input className={inputClass} id="contactEmail" name="contactEmail" type="email" maxLength={200} />
            </div>
            <div>
              <label className={labelClass} htmlFor="contactPhone">
                Telefon
              </label>
              <input className={inputClass} id="contactPhone" name="contactPhone" maxLength={50} />
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-card-border pt-5 dark:border-white/10">
          <Link href="/arbeitgeber/dashboard/kunden" className={secondaryButtonClass}>
            Abbrechen
          </Link>
          <button type="submit" className={primaryButtonClass}>
            Kunde anlegen
          </button>
        </div>
      </form>
    </div>
  );
}
