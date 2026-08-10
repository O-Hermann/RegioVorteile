import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember, assertCanManageCustomers } from "@/lib/auth";
import { getCustomer, getCustomerContact, CUSTOMER_ERROR_MESSAGES } from "@/lib/customers";
import { updateCustomerContact } from "@/actions/customers";
import { CustomerContactFormFields } from "@/components/customers/customer-contact-form-fields";
import { cardClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui";
import { BackLink } from "@/components/back-link";

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
      <BackLink href={`/arbeitgeber/dashboard/kunden/${customer.id}`} label="Zurück zum Kunden" />
      <h1 className="mt-2 font-display text-3xl font-semibold text-sand-900">Ansprechpartner bearbeiten</h1>
      <p className="mt-2 text-sand-600 dark:text-cockpit-text-secondary">{customer.name}</p>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {CUSTOMER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}

      <form action={updateCustomerContact} className={`mt-6 ${cardClass}`}>
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
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-card-border pt-5 dark:border-white/10">
          <Link href={`/arbeitgeber/dashboard/kunden/${customer.id}`} className={secondaryButtonClass}>
            Abbrechen
          </Link>
          <button type="submit" className={primaryButtonClass}>
            Änderungen speichern
          </button>
        </div>
      </form>
    </div>
  );
}
