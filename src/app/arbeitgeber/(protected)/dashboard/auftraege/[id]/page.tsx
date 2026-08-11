import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember } from "@/lib/auth";
import { ORDER_MANAGE_ROLES } from "@/lib/company";
import { getOrder, ORDER_STATUS_LABELS, ORDER_ERROR_MESSAGES, orderStatusBadgeClass } from "@/lib/orders";
import { deleteOrder } from "@/actions/orders";
import { cardClass, secondaryButtonClass } from "@/lib/ui";
import { importSecondaryTextClass } from "@/lib/import-ui";
import { PageNav } from "@/components/page-nav";
import { KebabMenu } from "@/components/kebab-menu";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

export default async function AuftragDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const { company, membership } = await requireCompanyMember();
  const { id } = await params;
  const { error, updated } = await searchParams;
  const canManage = ORDER_MANAGE_ROLES.includes(membership.role);

  const order = await getOrder(company.id, id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageNav backHref="/arbeitgeber/dashboard/auftraege" backLabel="Zurück zu Aufträgen" />

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {ORDER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}
      {updated === "1" && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          Auftrag wurde aktualisiert.
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold text-sand-900">{order.title}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${orderStatusBadgeClass(order.status)}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className={`mt-1 text-sm ${importSecondaryTextClass}`}>Auftragsnummer {order.orderNumber}</p>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/arbeitgeber/dashboard/auftraege/${order.id}/bearbeiten`} className={secondaryButtonClass}>
              Bearbeiten
            </Link>
            {/* Analog zum Kunden-Loeschen (Phase 6.1 Feinschliff Teil B):
                Loeschen bewusst NICHT als gleichwertiger Button, sondern im
                zurueckhaltenden "Weitere Aktionen"-Menue mit
                Bestaetigungsdialog. */}
            <KebabMenu>
              <form action={deleteOrder}>
                <input type="hidden" name="orderId" value={order.id} />
                <ConfirmSubmitButton
                  confirmMessage={`"${order.title}" wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden. Wirklich endgültig löschen?`}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10 transition-colors"
                >
                  Auftrag löschen
                </ConfirmSubmitButton>
              </form>
            </KebabMenu>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Auftragsdaten</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Auftragsnummer</dt>
              <dd className="text-right font-medium text-sand-900 dark:text-cockpit-text">{order.orderNumber}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Status</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{ORDER_STATUS_LABELS[order.status]}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Angelegt am</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">{order.createdAt.toLocaleDateString("de-DE")}</dd>
            </div>
          </dl>
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Kunde</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Kundenname</dt>
              <dd className="text-right font-medium">
                <Link
                  href={`/arbeitgeber/dashboard/kunden/${order.customer.id}`}
                  className="text-ink-600 hover:underline dark:text-cockpit-accent-light"
                >
                  {order.customer.name}
                </Link>
                {order.customer.status === "INACTIVE" && (
                  <span className={`ml-1 text-xs ${importSecondaryTextClass}`}>(Inaktiv)</span>
                )}
              </dd>
            </div>
            {order.customer.customerNumber && (
              <div className="flex justify-between gap-3">
                <dt className={importSecondaryTextClass}>Kundennummer</dt>
                <dd className="text-right text-sand-900 dark:text-cockpit-text">{order.customer.customerNumber}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Termine</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Startdatum</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">
                {order.startDate ? order.startDate.toLocaleDateString("de-DE") : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={importSecondaryTextClass}>Fälligkeitsdatum</dt>
              <dd className="text-right text-sand-900 dark:text-cockpit-text">
                {order.dueDate ? order.dueDate.toLocaleDateString("de-DE") : "—"}
              </dd>
            </div>
            {order.completedAt && (
              <div className="flex justify-between gap-3">
                <dt className={importSecondaryTextClass}>Erledigt am</dt>
                <dd className="text-right text-sand-900 dark:text-cockpit-text">
                  {order.completedAt.toLocaleDateString("de-DE")}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className={`lg:col-span-2 ${cardClass}`}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Beschreibung</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-sand-800 dark:text-cockpit-text">
            {order.description || <span className={importSecondaryTextClass}>Keine Beschreibung hinterlegt.</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
