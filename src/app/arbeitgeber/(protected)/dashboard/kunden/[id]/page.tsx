import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember } from "@/lib/auth";
import { CUSTOMER_MANAGE_ROLES } from "@/lib/company";
import { getCustomer, CUSTOMER_STATUS_LABELS, customerStatusBadgeClass } from "@/lib/customers";
import { setCustomerStatus, deleteCustomerContact, deleteCustomer } from "@/actions/customers";
import { cardClass, secondaryButtonClass, dangerButtonClass } from "@/lib/ui";
import { importSecondaryTextClass } from "@/lib/import-ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { BackLink } from "@/components/back-link";
import { KebabMenu } from "@/components/kebab-menu";
import { PlusIcon, MailIcon, PhoneIcon } from "@/components/icons";

function isSafeHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export default async function KundeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { company, membership } = await requireCompanyMember();
  const { id } = await params;
  const canManage = CUSTOMER_MANAGE_ROLES.includes(membership.role);

  const customer = await getCustomer(company.id, id);
  if (!customer) notFound();

  const addressLine = [customer.postalCode, customer.city].filter(Boolean).join(" ");

  return (
    <div>
      <BackLink href="/arbeitgeber/dashboard/kunden" label="Zurück zu Kunden" />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold text-sand-900">{customer.name}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${customerStatusBadgeClass(customer.status)}`}>
              {CUSTOMER_STATUS_LABELS[customer.status]}
            </span>
          </div>
          {customer.customerNumber && (
            <p className={`mt-1 text-sm ${importSecondaryTextClass}`}>Kundennummer {customer.customerNumber}</p>
          )}
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/arbeitgeber/dashboard/kunden/${customer.id}/bearbeiten`} className={secondaryButtonClass}>
              Bearbeiten
            </Link>
            {customer.status === "ACTIVE" ? (
              <form action={setCustomerStatus}>
                <input type="hidden" name="customerId" value={customer.id} />
                <input type="hidden" name="status" value="INACTIVE" />
                <ConfirmSubmitButton
                  confirmMessage="Möchten Sie diesen Kunden wirklich deaktivieren? Die vorhandenen Daten bleiben erhalten."
                  className={dangerButtonClass}
                >
                  Kunde deaktivieren
                </ConfirmSubmitButton>
              </form>
            ) : (
              <form action={setCustomerStatus}>
                <input type="hidden" name="customerId" value={customer.id} />
                <input type="hidden" name="status" value="ACTIVE" />
                <button type="submit" className={secondaryButtonClass}>
                  Kunde reaktivieren
                </button>
              </form>
            )}
            {/* Feinschliff Teil B: "Kunde löschen" bewusst NICHT als dritter
                gleichwertiger Button, sondern in einem zurueckhaltenden
                "Weitere Aktionen"-Menue, um Fehlklicks auf eine destruktive
                Aktion zu vermeiden. */}
            <KebabMenu>
              <form action={deleteCustomer}>
                <input type="hidden" name="customerId" value={customer.id} />
                <ConfirmSubmitButton
                  confirmMessage={`${customer.name} wird dauerhaft aus Effivo entfernt. Diese Aktion kann nicht rückgängig gemacht werden. Wirklich endgültig löschen?`}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10 transition-colors"
                >
                  Kunde löschen
                </ConfirmSubmitButton>
              </form>
            </KebabMenu>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Stammdaten</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Kundenname</dt>
              <dd className="text-right font-medium text-sand-900 dark:text-cockpit-text">{customer.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Kundennummer</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{customer.customerNumber ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Status</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{CUSTOMER_STATUS_LABELS[customer.status]}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Angelegt am</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{customer.createdAt.toLocaleDateString("de-DE")}</dd>
            </div>
          </dl>
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Kontakt</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>E-Mail</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{customer.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Telefon</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{customer.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Website</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">
                {customer.website && isSafeHttpUrl(customer.website) ? (
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-ink-600 hover:underline dark:text-cockpit-accent-light"
                  >
                    {customer.website}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Adresse</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Straße</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{customer.street ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>PLZ / Ort</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{addressLine || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Land</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{customer.country ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-sand-900">Ansprechpartner</h2>
            {canManage && (
              <Link
                href={`/arbeitgeber/dashboard/kunden/${customer.id}/kontakt/neu`}
                className="inline-flex items-center gap-1.5 rounded-full border border-card-border dark:border-white/15 px-3 py-1.5 text-xs font-semibold text-sand-800 dark:text-cockpit-text hover:border-ink-400 dark:hover:border-cockpit-accent-light/50 hover:text-ink-700 dark:hover:text-cockpit-accent-light transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Ansprechpartner
              </Link>
            )}
          </div>
          {customer.contacts.length === 0 ? (
            <p className={`mt-3 text-sm ${importSecondaryTextClass}`}>Noch keine Ansprechpartner hinterlegt.</p>
          ) : (
            <ul className="mt-3 divide-y divide-card-border/60 dark:divide-white/5">
              {customer.contacts.map((contact) => {
                const contactName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—";
                return (
                  <li key={contact.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sand-900 dark:text-cockpit-text">{contactName}</p>
                      {contact.isPrimary && (
                        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-800 dark:bg-cockpit-accent-subtle/40 dark:text-cockpit-accent-light">
                          Hauptansprechpartner
                        </span>
                      )}
                    </div>
                    {contact.position && <p className={`text-sm ${importSecondaryTextClass}`}>{contact.position}</p>}
                    {/* Feinschliff Teil J: E-Mail/Telefon eigene Zeilen mit
                        Icon statt " · "-verkettet, jeweils als mailto:/tel:-
                        Link anklickbar. */}
                    {(contact.email || contact.phone) && (
                      <div className="mt-1 space-y-0.5">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className={`flex items-center gap-1.5 text-sm ${importSecondaryTextClass} hover:text-ink-700 dark:hover:text-cockpit-accent-light transition-colors`}
                          >
                            <MailIcon className="h-3.5 w-3.5 shrink-0" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className={`flex items-center gap-1.5 text-sm ${importSecondaryTextClass} hover:text-ink-700 dark:hover:text-cockpit-accent-light transition-colors`}
                          >
                            <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                            {contact.phone}
                          </a>
                        )}
                      </div>
                    )}
                    {canManage && (
                      <div className="mt-1.5 flex items-center gap-3 text-xs">
                        <Link
                          href={`/arbeitgeber/dashboard/kunden/${customer.id}/kontakt/${contact.id}/bearbeiten`}
                          className="font-semibold text-ink-600 hover:underline dark:text-cockpit-accent-light"
                        >
                          Bearbeiten
                        </Link>
                        <form action={deleteCustomerContact}>
                          <input type="hidden" name="contactId" value={contact.id} />
                          <ConfirmSubmitButton
                            confirmMessage={`${contactName} wirklich als Ansprechpartner entfernen?`}
                            className="font-semibold text-rose-600 hover:underline dark:text-rose-300"
                          >
                            Entfernen
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {customer.notes && (
          <div className={`lg:col-span-2 ${cardClass}`}>
            <h2 className="font-display text-lg font-semibold text-sand-900">Notizen</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-sand-800 dark:text-cockpit-text">{customer.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
