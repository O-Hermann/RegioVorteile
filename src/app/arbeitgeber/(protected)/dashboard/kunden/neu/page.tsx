import Link from "next/link";
import { requireCompanyMember, assertCanManageCustomers } from "@/lib/auth";
import { CUSTOMER_ERROR_MESSAGES } from "@/lib/customers";
import { createCustomer } from "@/actions/customers";
import { CustomerFormFields } from "@/components/customers/customer-form-fields";
import {
  dashCardClass,
  dashInputClass,
  dashLabelClass,
  dashPrimaryButtonClass,
  dashSecondaryButtonClass,
} from "@/components/dashboard/dash-ui";
import { PageNav } from "@/components/page-nav";

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
      <PageNav backHref="/arbeitgeber/dashboard/kunden" backLabel="Zurück zu Kunden" />
      <h1 className="mt-2 text-3xl font-semibold text-dash-text">Neuer Kunde</h1>
      <p className="mt-2 text-dash-text-secondary">
        Legen Sie einen neuen Kunden mit Stammdaten und optional einem ersten Ansprechpartner an.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          {CUSTOMER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}

      <form action={createCustomer} className={`mt-6 p-6 ${dashCardClass}`}>
        <CustomerFormFields />

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-dash-text">Hauptansprechpartner</h2>
          <p className="mt-1 text-sm text-dash-text-muted">Optional - kann auch später ergänzt werden.</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={dashLabelClass} htmlFor="contactFirstName">
                Vorname
              </label>
              <input className={dashInputClass} id="contactFirstName" name="contactFirstName" maxLength={200} />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="contactLastName">
                Nachname
              </label>
              <input className={dashInputClass} id="contactLastName" name="contactLastName" maxLength={200} />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="contactPosition">
                Position
              </label>
              <input className={dashInputClass} id="contactPosition" name="contactPosition" maxLength={200} />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="contactEmail">
                E-Mail
              </label>
              <input className={dashInputClass} id="contactEmail" name="contactEmail" type="email" maxLength={200} />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="contactPhone">
                Telefon
              </label>
              <input className={dashInputClass} id="contactPhone" name="contactPhone" maxLength={50} />
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-dash-line pt-5">
          <Link href="/arbeitgeber/dashboard/kunden" className={dashSecondaryButtonClass}>
            Abbrechen
          </Link>
          <button type="submit" className={dashPrimaryButtonClass}>
            Kunde anlegen
          </button>
        </div>
      </form>
    </div>
  );
}
