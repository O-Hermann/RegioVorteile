import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember } from "@/lib/auth";
import { getOrder, ORDER_STATUS_LABELS, orderStatusBadgeClass } from "@/lib/orders";
import { cardClass } from "@/lib/ui";
import { importSecondaryTextClass } from "@/lib/import-ui";
import { BackLink } from "@/components/back-link";

// Bewusst nur eine einfache Read-only-Grundansicht (Punkt 11) - die
// vollstaendige Detailseite mit Bearbeiten/Aufgaben/etc. folgt erst in
// Phase 6.2.2. Diese Route existiert ausschliesslich, damit "Ansehen" in der
// Auftragsuebersicht ein echtes, sinnvolles Ziel hat.
export default async function AuftragDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { company } = await requireCompanyMember();
  const { id } = await params;

  const order = await getOrder(company.id, id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/arbeitgeber/dashboard/auftraege" label="Zurück zu Aufträgen" />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">{order.title}</h1>
          <p className={`mt-1 text-sm ${importSecondaryTextClass}`}>Auftragsnummer {order.orderNumber}</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${orderStatusBadgeClass(order.status)}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className={`mt-6 ${cardClass}`}>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className={importSecondaryTextClass}>Kunde</dt>
            <dd className="text-right font-medium text-sand-900 dark:text-cockpit-text">
              <Link
                href={`/arbeitgeber/dashboard/kunden/${order.customer.id}`}
                className="text-ink-600 hover:underline dark:text-cockpit-accent-light"
              >
                {order.customer.name}
              </Link>
              {order.customer.status === "INACTIVE" && <span className="ml-1 text-xs">(Inaktiv)</span>}
            </dd>
          </div>
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
          <div className="flex justify-between gap-3">
            <dt className={importSecondaryTextClass}>Angelegt am</dt>
            <dd className="text-right text-sand-900 dark:text-cockpit-text">
              {order.createdAt.toLocaleDateString("de-DE")}
            </dd>
          </div>
        </dl>

        {order.description && (
          <div className="mt-5 border-t border-card-border pt-5 dark:border-white/10">
            <h2 className="font-display text-sm font-semibold text-sand-900 dark:text-cockpit-text">Beschreibung</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-sand-800 dark:text-cockpit-text">{order.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
