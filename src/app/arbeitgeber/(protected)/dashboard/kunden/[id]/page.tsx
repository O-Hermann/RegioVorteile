import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember } from "@/lib/auth";
import { CUSTOMER_MANAGE_ROLES, ORDER_MANAGE_ROLES } from "@/lib/company";
import { getCustomer, CUSTOMER_STATUS_LABELS, CUSTOMER_ERROR_MESSAGES, customerStatusBadgeClass } from "@/lib/customers";
import { getOrdersForCustomer, ORDER_STATUS_LABELS, orderStatusBadgeClass } from "@/lib/orders";
import { setCustomerStatus, deleteCustomerContact, deleteCustomer } from "@/actions/customers";
import {
  dashCardClass,
  dashSecondaryButtonClass,
  dashDangerButtonClass,
  dashSecondaryTextClass,
} from "@/components/dashboard/dash-ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { PageNav } from "@/components/page-nav";
import { KebabMenu } from "@/components/kebab-menu";
import { PlusIcon, MailIcon, PhoneIcon } from "@/components/icons";

function isSafeHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export default async function KundeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { company, membership } = await requireCompanyMember();
  const { id } = await params;
  const { error } = await searchParams;
  const canManage = CUSTOMER_MANAGE_ROLES.includes(membership.role);

  const customer = await getCustomer(company.id, id);
  if (!customer) notFound();

  // Phase 6.2.2, Punkt 9: Auftraege dieses Kunden - bereits company- UND
  // customer-gescopt geladen (kein separater Client-Filter noetig).
  const orders = await getOrdersForCustomer(company.id, customer.id);
  const canManageOrders = ORDER_MANAGE_ROLES.includes(membership.role);

  const addressLine = [customer.postalCode, customer.city].filter(Boolean).join(" ");

  return (
    <div>
      <PageNav backHref="/arbeitgeber/dashboard/kunden" backLabel="Zurück zu Kunden" />
      {error && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          {CUSTOMER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-dash-text">{customer.name}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${customerStatusBadgeClass(customer.status)}`}>
              {CUSTOMER_STATUS_LABELS[customer.status]}
            </span>
          </div>
          {customer.customerNumber && (
            <p className={`mt-1 text-sm ${dashSecondaryTextClass}`}>Kundennummer {customer.customerNumber}</p>
          )}
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/arbeitgeber/dashboard/kunden/${customer.id}/bearbeiten`} className={dashSecondaryButtonClass}>
              Bearbeiten
            </Link>
            {customer.status === "ACTIVE" ? (
              <form action={setCustomerStatus}>
                <input type="hidden" name="customerId" value={customer.id} />
                <input type="hidden" name="status" value="INACTIVE" />
                <ConfirmSubmitButton
                  confirmMessage="Möchten Sie diesen Kunden wirklich deaktivieren? Die vorhandenen Daten bleiben erhalten."
                  className={dashDangerButtonClass}
                >
                  Kunde deaktivieren
                </ConfirmSubmitButton>
              </form>
            ) : (
              <form action={setCustomerStatus}>
                <input type="hidden" name="customerId" value={customer.id} />
                <input type="hidden" name="status" value="ACTIVE" />
                <button type="submit" className={dashSecondaryButtonClass}>
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
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-dash-red hover:bg-dash-red-tint transition-colors"
                >
                  Kunde löschen
                </ConfirmSubmitButton>
              </form>
            </KebabMenu>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className={`p-6 ${dashCardClass}`}>
          <h2 className="text-lg font-semibold text-dash-text">Stammdaten</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>Kundenname</dt>
              <dd className="text-right font-medium text-dash-text">{customer.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>Kundennummer</dt>
              <dd className="text-right text-dash-text">{customer.customerNumber ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>Status</dt>
              <dd className="text-right text-dash-text">{CUSTOMER_STATUS_LABELS[customer.status]}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>Angelegt am</dt>
              <dd className="text-right text-dash-text">{customer.createdAt.toLocaleDateString("de-DE")}</dd>
            </div>
          </dl>
        </div>

        <div className={`p-6 ${dashCardClass}`}>
          <h2 className="text-lg font-semibold text-dash-text">Kontakt</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>E-Mail</dt>
              <dd className="text-right text-dash-text">{customer.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>Telefon</dt>
              <dd className="text-right text-dash-text">{customer.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>Website</dt>
              <dd className="text-right text-dash-text">
                {customer.website && isSafeHttpUrl(customer.website) ? (
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-dash-gold hover:underline"
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

        <div className={`p-6 ${dashCardClass}`}>
          <h2 className="text-lg font-semibold text-dash-text">Adresse</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>Straße</dt>
              <dd className="text-right text-dash-text">{customer.street ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>PLZ / Ort</dt>
              <dd className="text-right text-dash-text">{addressLine || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={dashSecondaryTextClass}>Land</dt>
              <dd className="text-right text-dash-text">{customer.country ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className={`p-6 ${dashCardClass}`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-dash-text">Ansprechpartner</h2>
            {canManage && (
              <Link
                href={`/arbeitgeber/dashboard/kunden/${customer.id}/kontakt/neu`}
                className="inline-flex items-center gap-1.5 rounded-full border border-dash-line px-3 py-1.5 text-xs font-semibold text-dash-text hover:border-dash-gold/40 hover:text-dash-gold transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Ansprechpartner
              </Link>
            )}
          </div>
          {customer.contacts.length === 0 ? (
            <p className={`mt-3 text-sm ${dashSecondaryTextClass}`}>Noch keine Ansprechpartner hinterlegt.</p>
          ) : (
            <ul className="mt-3 divide-y divide-dash-line">
              {customer.contacts.map((contact) => {
                const contactName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—";
                return (
                  <li key={contact.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-dash-text">{contactName}</p>
                      {contact.isPrimary && (
                        <span className="rounded-full bg-dash-gold-glow px-2 py-0.5 text-[11px] font-medium text-dash-gold">
                          Hauptansprechpartner
                        </span>
                      )}
                    </div>
                    {contact.position && <p className={`text-sm ${dashSecondaryTextClass}`}>{contact.position}</p>}
                    {/* Feinschliff Teil J: E-Mail/Telefon eigene Zeilen mit
                        Icon statt " · "-verkettet, jeweils als mailto:/tel:-
                        Link anklickbar. */}
                    {(contact.email || contact.phone) && (
                      <div className="mt-1 space-y-0.5">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className={`flex items-center gap-1.5 text-sm ${dashSecondaryTextClass} hover:text-dash-gold transition-colors`}
                          >
                            <MailIcon className="h-3.5 w-3.5 shrink-0" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className={`flex items-center gap-1.5 text-sm ${dashSecondaryTextClass} hover:text-dash-gold transition-colors`}
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
                          className="font-semibold text-dash-gold hover:underline"
                        >
                          Bearbeiten
                        </Link>
                        <form action={deleteCustomerContact}>
                          <input type="hidden" name="contactId" value={contact.id} />
                          <ConfirmSubmitButton
                            confirmMessage={`${contactName} wirklich als Ansprechpartner entfernen?`}
                            className="font-semibold text-dash-red hover:underline"
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
          <div className={`lg:col-span-2 p-6 ${dashCardClass}`}>
            <h2 className="text-lg font-semibold text-dash-text">Notizen</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-dash-text">{customer.notes}</p>
          </div>
        )}

        <div className={`lg:col-span-2 p-6 ${dashCardClass}`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-dash-text">Aufträge</h2>
            {canManageOrders && (
              <Link
                href={`/arbeitgeber/dashboard/auftraege/neu?customer=${customer.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-dash-line px-3 py-1.5 text-xs font-semibold text-dash-text hover:border-dash-gold/40 hover:text-dash-gold transition-colors"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Neuer Auftrag
              </Link>
            )}
          </div>
          {orders.length === 0 ? (
            <div className="mt-3">
              <p className={`text-sm ${dashSecondaryTextClass}`}>Für diesen Kunden wurden noch keine Aufträge angelegt.</p>
              {canManageOrders && (
                <Link
                  href={`/arbeitgeber/dashboard/auftraege/neu?customer=${customer.id}`}
                  className="mt-2 inline-block text-sm font-semibold text-dash-gold hover:underline"
                >
                  Auftrag anlegen
                </Link>
              )}
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-dash-line">
              {orders.map((order) => (
                <li key={order.id} className="relative py-3">
                  <Link href={`/arbeitgeber/dashboard/auftraege/${order.id}`} className="absolute inset-0 z-0" />
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-dash-text">{order.title}</p>
                      <p className={`text-sm ${dashSecondaryTextClass}`}>
                        {order.orderNumber}
                        {order.dueDate && ` · Fällig: ${order.dueDate.toLocaleDateString("de-DE")}`}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${orderStatusBadgeClass(order.status)}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
