import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember, assertCanManageCustomers } from "@/lib/auth";
import { getCustomer, getCustomerContact, CUSTOMER_ERROR_MESSAGES } from "@/lib/customers";
import { updateCustomerContact } from "@/actions/customers";
import { CustomerContactFormFields } from "@/components/customers/customer-contact-form-fields";
import { dashCardClass, dashPrimaryButtonClass, dashSecondaryButtonClass } from "@/components/dashboard/dash-ui";
import { PageNav } from "@/components/page-nav";

export default async function AnsprechpartnerBearbeitenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; contactId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { company } = await requireCompanyMember();
  const { id, contactId } = await params;
  const { error } = await searchParams;

  const customer = await getCustomer(company.id, id);
  if (!customer) notFound();

  // Zusaetzlich mandantenscharf ueber getCustomerContact geprueft, nicht nur
  // ueber die bereits geladene customer.contacts-Liste - falls eine
  // Ansprechpartner-ID zu einem fremden Kunden gehoert, liefert dies null.
  const contact = await getCustomerContact(company.id, contactId);
  if (!contact || contact.customerId !== customer.id) notFound();

  await assertCanManageCustomers(company.id);

  return (
    <div className="mx-auto max-w-xl">
      <PageNav backHref={`/arbeitgeber/dashboard/kunden/${customer.id}`} backLabel="Zurück zum Kunden" />
      <h1 className="mt-2 text-3xl font-semibold text-dash-text">Ansprechpartner bearbeiten</h1>
      <p className="mt-2 text-dash-text-secondary">{customer.name}</p>

      {error && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          {CUSTOMER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}

      <form action={updateCustomerContact} className={`mt-6 p-6 ${dashCardClass}`}>
        <input type="hidden" name="contactId" value={contact.id} />
        <CustomerContactFormFields
          defaults={{
            firstName: contact.firstName ?? undefined,
            lastName: contact.lastName ?? undefined,
            position: contact.position ?? undefined,
            email: contact.email ?? undefined,
            phone: contact.phone ?? undefined,
            isPrimary: contact.isPrimary,
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
