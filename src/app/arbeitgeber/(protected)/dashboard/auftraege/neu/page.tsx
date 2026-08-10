import Link from "next/link";
import { requireCompanyMember, assertCanManageOrders } from "@/lib/auth";
import { getCustomersForOrderSelect, ORDER_ERROR_MESSAGES } from "@/lib/orders";
import { createOrder } from "@/actions/orders";
import { cardClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui";
import { BackLink } from "@/components/back-link";

export default async function NeuerAuftragPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { company } = await requireCompanyMember();
  // Serverseitige Rechtepruefung (Punkt 6/25) - ein direkter Aufruf dieser
  // Route durch eine Rolle ohne Schreibrecht wird hier verwiesen, nicht nur
  // der "+ Neuer Auftrag"-Button in der Uebersicht versteckt.
  await assertCanManageOrders(company.id);
  const { error } = await searchParams;

  const customers = await getCustomersForOrderSelect(company.id);

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/arbeitgeber/dashboard/auftraege" label="Zurück zu Aufträgen" />
      <h1 className="mt-2 font-display text-3xl font-semibold text-sand-900">Neuer Auftrag</h1>
      <p className="mt-2 text-sand-600 dark:text-cockpit-text-secondary">
        Legen Sie einen neuen Auftrag an und ordnen Sie ihn einem Kunden zu.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {ORDER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}

      <form action={createOrder} className={`mt-6 ${cardClass}`}>
        <section>
          <h2 className="font-display text-lg font-semibold text-sand-900">Auftragsdaten</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="title">
                Auftragstitel *
              </label>
              <input className={inputClass} id="title" name="title" maxLength={200} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="orderNumber">
                Auftragsnummer *
              </label>
              <input
                className={inputClass}
                id="orderNumber"
                name="orderNumber"
                maxLength={50}
                placeholder="A-2026-001"
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="customerId">
                Kunde *
              </label>
              {customers.length === 0 ? (
                <p className="mt-1 text-sm text-sand-500 dark:text-cockpit-text-secondary">
                  Bitte zuerst einen Kunden anlegen.
                </p>
              ) : (
                <select className={inputClass} id="customerId" name="customerId" defaultValue="" required>
                  <option value="" disabled>
                    – bitte auswählen –
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.status === "INACTIVE" ? " (Inaktiv)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="status">
                Status
              </label>
              <select className={inputClass} id="status" name="status" defaultValue="OPEN">
                <option value="OPEN">Offen</option>
                <option value="IN_PROGRESS">In Bearbeitung</option>
                <option value="WAITING">Wartet</option>
                <option value="COMPLETED">Erledigt</option>
                <option value="CANCELED">Storniert</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="startDate">
                Startdatum
              </label>
              <input className={inputClass} id="startDate" name="startDate" type="date" />
            </div>
            <div>
              <label className={labelClass} htmlFor="dueDate">
                Fälligkeitsdatum
              </label>
              <input className={inputClass} id="dueDate" name="dueDate" type="date" />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-display text-lg font-semibold text-sand-900">Beschreibung</h2>
          <div className="mt-3">
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              name="description"
              maxLength={5000}
              placeholder="Details zum Auftrag, interne Hinweise …"
            />
          </div>
        </section>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-card-border pt-5 dark:border-white/10">
          <Link href="/arbeitgeber/dashboard/auftraege" className={secondaryButtonClass}>
            Abbrechen
          </Link>
          <button type="submit" className={primaryButtonClass} disabled={customers.length === 0}>
            Auftrag anlegen
          </button>
        </div>
      </form>
    </div>
  );
}
