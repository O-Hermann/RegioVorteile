import { dashInputClass as inputClass, dashLabelClass as labelClass } from "@/components/dashboard/dash-ui";

// Gemeinsame Stammdaten-/Kontakt-/Adress-/Notizfelder fuer "Neuer Kunde" und
// "Kunde bearbeiten" (Phase 6.1, Punkt 16/30) - bewusst in klar getrennte
// Abschnitte gruppiert statt einer grossen Feldwand. Reine Server-
// Komponente (kein "use client" noetig, keine Interaktivitaet ausserhalb
// der normalen Formular-Semantik).
export function CustomerFormFields({
  defaults,
}: {
  defaults?: Partial<{
    name: string;
    customerNumber: string;
    status: "ACTIVE" | "INACTIVE";
    email: string;
    phone: string;
    website: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
    notes: string;
  }>;
}) {
  const d = defaults ?? {};
  return (
    <>
      <section>
        <h2 className="text-lg font-semibold text-dash-text">Stammdaten</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="name">
              Kundenname *
            </label>
            <input className={inputClass} id="name" name="name" defaultValue={d.name} maxLength={200} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="customerNumber">
              Kundennummer
            </label>
            <input
              className={inputClass}
              id="customerNumber"
              name="customerNumber"
              defaultValue={d.customerNumber}
              maxLength={50}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select className={inputClass} id="status" name="status" defaultValue={d.status ?? "ACTIVE"}>
              <option value="ACTIVE">Aktiv</option>
              <option value="INACTIVE">Inaktiv</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-dash-text">Kontaktdaten</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="email">
              E-Mail
            </label>
            <input className={inputClass} id="email" name="email" type="email" defaultValue={d.email} maxLength={200} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">
              Telefon
            </label>
            <input className={inputClass} id="phone" name="phone" defaultValue={d.phone} maxLength={50} />
          </div>
          <div>
            <label className={labelClass} htmlFor="website">
              Website
            </label>
            <input
              className={inputClass}
              id="website"
              name="website"
              defaultValue={d.website}
              maxLength={300}
              placeholder="www.beispiel.de"
            />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-dash-text">Adresse</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="street">
              Straße
            </label>
            <input className={inputClass} id="street" name="street" defaultValue={d.street} maxLength={200} />
          </div>
          <div>
            <label className={labelClass} htmlFor="postalCode">
              PLZ
            </label>
            <input className={inputClass} id="postalCode" name="postalCode" defaultValue={d.postalCode} maxLength={20} />
          </div>
          <div>
            <label className={labelClass} htmlFor="city">
              Ort
            </label>
            <input className={inputClass} id="city" name="city" defaultValue={d.city} maxLength={200} />
          </div>
          <div>
            <label className={labelClass} htmlFor="country">
              Land
            </label>
            <input
              className={inputClass}
              id="country"
              name="country"
              defaultValue={d.country ?? "Deutschland"}
              maxLength={100}
            />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-dash-text">Notizen</h2>
        <div className="mt-3">
          <textarea
            className={`${inputClass} min-h-[100px] resize-y`}
            name="notes"
            defaultValue={d.notes}
            maxLength={5000}
            placeholder="Besondere Wünsche, interne Hinweise, wichtige Informationen …"
          />
        </div>
      </section>
    </>
  );
}
