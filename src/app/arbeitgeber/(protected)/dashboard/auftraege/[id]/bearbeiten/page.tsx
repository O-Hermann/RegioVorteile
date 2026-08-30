import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyMember, assertCanManageOrders } from "@/lib/auth";
import { getOrder, getCustomersForOrderSelect, ORDER_ERROR_MESSAGES } from "@/lib/orders";
import { updateOrder } from "@/actions/orders";
import {
  dashCardClass,
  dashInputClass,
  dashLabelClass,
  dashPrimaryButtonClass,
  dashSecondaryButtonClass,
} from "@/components/dashboard/dash-ui";
import { PageNav } from "@/components/page-nav";
import { DatePicker } from "@/components/date-picker";
import { toIsoDateString } from "@/lib/date-format";

export default async function AuftragBearbeitenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { company } = await requireCompanyMember();
  const { id } = await params;
  const { error } = await searchParams;

  // companyId wird IMMER mitgefiltert - ein Auftrag eines anderen
  // Unternehmens fuehrt hier zu einem sauberen 404, nicht zu einer Anzeige
  // (gleiches Muster wie kunden/[id]/bearbeiten).
  const order = await getOrder(company.id, id);
  if (!order) notFound();

  await assertCanManageOrders(company.id);

  // Architekturentscheidung (Punkt 5): der Kunde eines bestehenden Auftrags
  // bleibt AENDERBAR, aber ausschliesslich auf Kunden derselben aktiven
  // Company - genau wie beim Anlegen. Das ist fachlich sinnvoll (z.B.
  // Korrektur einer versehentlichen Fehlzuordnung) und birgt kein neues
  // Sicherheitsrisiko: updateOrder() laedt den gewaehlten Kunden ohnehin bei
  // JEDEM Speichern erneut serverseitig gegen existing.companyId, exakt wie
  // beim Erstellen. Ein reines Nur-Lesen des Kundenfelds wuerde diese bereits
  // vorhandene Absicherung nicht zusaetzlich verstaerken, nur unnoetig
  // einschraenken.
  const customers = await getCustomersForOrderSelect(company.id);

  return (
    <div className="mx-auto max-w-2xl">
      <PageNav backHref={`/arbeitgeber/dashboard/auftraege/${order.id}`} backLabel="Zurück zum Auftrag" />
      <h1 className="mt-2 text-3xl font-semibold text-dash-text">Auftrag bearbeiten</h1>
      <p className="mt-2 text-dash-text-secondary">{order.title}</p>

      {error && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          {ORDER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}

      <form action={updateOrder} className={`mt-6 p-6 ${dashCardClass}`}>
        <input type="hidden" name="orderId" value={order.id} />
        <section>
          <h2 className="text-lg font-semibold text-dash-text">Auftragsdaten</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={dashLabelClass} htmlFor="title">
                Auftragstitel *
              </label>
              <input className={dashInputClass} id="title" name="title" defaultValue={order.title} maxLength={200} required />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="orderNumber">
                Auftragsnummer *
              </label>
              <input
                className={dashInputClass}
                id="orderNumber"
                name="orderNumber"
                defaultValue={order.orderNumber}
                maxLength={50}
                required
              />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="customerId">
                Kunde *
              </label>
              <select className={dashInputClass} id="customerId" name="customerId" defaultValue={order.customerId} required>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.status === "INACTIVE" ? " (Inaktiv)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="status">
                Status
              </label>
              <select className={dashInputClass} id="status" name="status" defaultValue={order.status}>
                <option value="OPEN">Offen</option>
                <option value="IN_PROGRESS">In Bearbeitung</option>
                <option value="WAITING">Wartet</option>
                <option value="COMPLETED">Erledigt</option>
                <option value="CANCELED">Storniert</option>
              </select>
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="startDate">
                Startdatum
              </label>
              <DatePicker id="startDate" name="startDate" defaultValue={order.startDate ? toIsoDateString(order.startDate) : undefined} />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="dueDate">
                Fälligkeitsdatum
              </label>
              <DatePicker id="dueDate" name="dueDate" defaultValue={order.dueDate ? toIsoDateString(order.dueDate) : undefined} />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-dash-text">Beschreibung</h2>
          <div className="mt-3">
            <textarea
              className={`${dashInputClass} min-h-[100px] resize-y`}
              name="description"
              defaultValue={order.description ?? undefined}
              maxLength={5000}
              placeholder="Details zum Auftrag, interne Hinweise …"
            />
          </div>
        </section>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-dash-line pt-5">
          <Link href={`/arbeitgeber/dashboard/auftraege/${order.id}`} className={dashSecondaryButtonClass}>
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
