import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember, assertCanManageCustomers } from "@/lib/auth";
import { getCustomer, CUSTOMER_ERROR_MESSAGES } from "@/lib/customers";
import { updateCustomer } from "@/actions/customers";
import { CustomerFormFields } from "@/components/customers/customer-form-fields";
import { dashCardClass, dashPrimaryButtonClass, dashSecondaryButtonClass } from "@/components/dashboard/dash-ui";
import { PageNav } from "@/components/page-nav";

export default async function KundeBearbeitenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { company } = await requireCompanyMember();
  const { id } = await params;
  const { error } = await searchParams;

  // companyId wird IMMER mitgefiltert (Punkt 6) - ein Kunde eines anderen
  // Unternehmens fuehrt hier zu einem sauberen 404, nicht zu einer Anzeige.
  const customer = await getCustomer(company.id, id);
  if (!customer) notFound();

  await assertCanManageCustomers(company.id);

  return (
    <div className="mx-auto max-w-2xl">
      <PageNav backHref={`/arbeitgeber/dashboard/kunden/${customer.id}`} backLabel="Zurück zum Kunden" />
      <h1 className="mt-2 text-3xl font-semibold text-dash-text">Kunde bearbeiten</h1>
      <p className="mt-2 text-dash-text-secondary">{customer.name}</p>

      {error && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          {CUSTOMER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}

      <form action={updateCustomer} className={`mt-6 p-6 ${dashCardClass}`}>
        <input type="hidden" name="customerId" value={customer.id} />
        <CustomerFormFields
          defaults={{
            name: customer.name,
            customerNumber: customer.customerNumber ?? undefined,
            status: customer.status,
            email: customer.email ?? undefined,
            phone: customer.phone ?? undefined,
            website: customer.website ?? undefined,
            street: customer.street ?? undefined,
            postalCode: customer.postalCode ?? undefined,
            city: customer.city ?? undefined,
            country: customer.country ?? undefined,
            notes: customer.notes ?? undefined,
          }}
        />

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-dash-line pt-5">
          <Link href={`/arbeitgeber/dashboard/kunden/${customer.id}`} className={dashSecondaryButtonClass}>
            Abbrechen
          </Link>
          <button type="submit" className={dashPrimaryButtonClass}>
            Änderungen speichern
          </button>
        </div>
      </form>
    </div>
  );
}
