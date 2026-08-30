import Link from "next/link";
import { requireCompanyMember, assertCanManageOrders } from "@/lib/auth";
import { getCustomersForOrderSelect, ORDER_ERROR_MESSAGES } from "@/lib/orders";
import { createOrder } from "@/actions/orders";
import {
  dashCardClass,
  dashInputClass,
  dashLabelClass,
  dashPrimaryButtonClass,
  dashSecondaryButtonClass,
} from "@/components/dashboard/dash-ui";
import { PageNav } from "@/components/page-nav";
import { DatePicker } from "@/components/date-picker";

export default async function NeuerAuftragPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; customer?: string }>;
}) {
  const { company } = await requireCompanyMember();
  // Serverseitige Rechtepruefung (Punkt 6/25) - ein direkter Aufruf dieser
  // Route durch eine Rolle ohne Schreibrecht wird hier verwiesen, nicht nur
  // der "+ Neuer Auftrag"-Button in der Uebersicht versteckt.
  await assertCanManageOrders(company.id);
  const { error, customer: customerParam } = await searchParams;

  const customers = await getCustomersForOrderSelect(company.id);
  // Phase 6.2.2, Punkt 10: "?customer=<id>" dient AUSSCHLIESSLICH als
  // Vorauswahl-Hinweis fuer das Formular. Eine manipulierte/fremde ID wird
  // hier stillschweigend ignoriert (fuehrt nur zu "keine Vorauswahl"), da sie
  // nur gegen die bereits company-gescopte customers-Liste geprueft wird -
  // kein Leak, ob eine fremde ID ueberhaupt existiert. Die eigentliche
  // Absicherung beim Speichern erfolgt ohnehin unveraendert serverseitig in
  // createOrder() (Kunde wird dort erneut gegen die aktive Company geladen).
  const preselectedCustomerId = customerParam && customers.some((c) => c.id === customerParam) ? customerParam : "";

  // Feinschliff Navigation: der Zurueck-Kontext wird ausschliesslich anhand
  // der bereits validierten Vorauswahl bestimmt (nie anhand von
  // router.back()/Browser-History) - ein Aufruf mit gueltiger, zur aktiven
  // Company gehoerender Kunden-ID fuehrt zurueck zur Kundendetailseite,
  // jeder andere Aufruf (kein Parameter oder ein fremder/ungueltiger
  // Parameter) faellt konsistent auf die Auftragsuebersicht zurueck - exakt
  // dieselbe Unterscheidung, die preselectedCustomerId bereits fuer die
  // Formular-Vorauswahl trifft, damit kein zusaetzlicher Oracle fuer fremde
  // IDs entsteht.
  const backHref = preselectedCustomerId
    ? `/arbeitgeber/dashboard/kunden/${preselectedCustomerId}`
    : "/arbeitgeber/dashboard/auftraege";
  const backLabel = preselectedCustomerId ? "Zurück zum Kunden" : "Zurück zu Aufträgen";

  return (
    <div className="mx-auto max-w-2xl">
      <PageNav backHref={backHref} backLabel={backLabel} />
      <h1 className="mt-2 text-3xl font-semibold text-dash-text">Neuer Auftrag</h1>
      <p className="mt-2 text-dash-text-secondary">
        Legen Sie einen neuen Auftrag an und ordnen Sie ihn einem Kunden zu.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          {ORDER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}

      <form action={createOrder} className={`mt-6 p-6 ${dashCardClass}`}>
        <section>
          <h2 className="text-lg font-semibold text-dash-text">Auftragsdaten</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={dashLabelClass} htmlFor="title">
                Auftragstitel *
              </label>
              <input className={dashInputClass} id="title" name="title" maxLength={200} required />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="orderNumber">
                Auftragsnummer *
              </label>
              <input
                className={dashInputClass}
                id="orderNumber"
                name="orderNumber"
                maxLength={50}
                placeholder="A-2026-001"
                required
              />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="customerId">
                Kunde *
              </label>
              {customers.length === 0 ? (
                <p className="mt-1 text-sm text-dash-text-muted">
                  Bitte zuerst einen Kunden anlegen.
                </p>
              ) : (
                <select className={dashInputClass} id="customerId" name="customerId" defaultValue={preselectedCustomerId} required>
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
              <label className={dashLabelClass} htmlFor="status">
                Status
              </label>
              <select className={dashInputClass} id="status" name="status" defaultValue="OPEN">
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
              <DatePicker id="startDate" name="startDate" />
            </div>
            <div>
              <label className={dashLabelClass} htmlFor="dueDate">
                Fälligkeitsdatum
              </label>
              <DatePicker id="dueDate" name="dueDate" />
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-dash-text">Beschreibung</h2>
          <div className="mt-3">
            <textarea
              className={`${dashInputClass} min-h-[100px] resize-y`}
              name="description"
              maxLength={5000}
              placeholder="Details zum Auftrag, interne Hinweise …"
            />
          </div>
        </section>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-dash-line pt-5">
          <Link href="/arbeitgeber/dashboard/auftraege" className={dashSecondaryButtonClass}>
            Abbrechen
          </Link>
          <button type="submit" className={dashPrimaryButtonClass} disabled={customers.length === 0}>
            Auftrag anlegen
          </button>
        </div>
      </form>
    </div>
  );
}
