import { CATEGORIES } from "@/lib/categories";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";
import type { Region, PartnerBusiness } from "@/generated/prisma/client";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultContractEndDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return toDateInputValue(date);
}

export function PartnerForm({
  action,
  regions,
  partner,
}: {
  action: (formData: FormData) => void;
  regions: Region[];
  partner?: PartnerBusiness;
}) {
  return (
    <form action={action} className="space-y-4">
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <div>
        <label className={labelClass} htmlFor="name">
          Name
        </label>
        <input
          className={inputClass}
          name="name"
          id="name"
          defaultValue={partner?.name}
          placeholder="z.B. Bäckerei Krumm"
          required
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="category">
          Kategorie
        </label>
        <select className={inputClass} name="category" id="category" defaultValue={partner?.category} required>
          <option value="" disabled>
            Bitte wählen
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="description">
          Beschreibung
        </label>
        <textarea
          className={inputClass}
          name="description"
          id="description"
          rows={3}
          defaultValue={partner?.description}
          placeholder="Kurze Beschreibung des Betriebs"
          required
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="discountText">
          Rabatt-Angebot
        </label>
        <input
          className={inputClass}
          name="discountText"
          id="discountText"
          defaultValue={partner?.discountText}
          placeholder="z.B. 15% auf alle Backwaren"
          required
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="regionId">
          Region
        </label>
        <select className={inputClass} name="regionId" id="regionId" defaultValue={partner?.regionId} required>
          <option value="" disabled>
            Bitte wählen
          </option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-sand-500">
          Bestimmt, welche Arbeitgeber diesen Betrieb ihren Mitarbeitenden anzeigen.
        </p>
      </div>
      <div>
        <label className={labelClass} htmlFor="street">
          Straße und Hausnummer
        </label>
        <input
          className={inputClass}
          name="street"
          id="street"
          defaultValue={partner?.street}
          placeholder="z.B. Marktstraße 12"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="plz">
            PLZ
          </label>
          <input className={inputClass} name="plz" id="plz" defaultValue={partner?.plz} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="city">
            Ort
          </label>
          <input
            className={inputClass}
            name="city"
            id="city"
            defaultValue={partner?.city}
            placeholder="z.B. Musterstadt"
            required
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="logoUrl">
          Logo/Bild-URL (optional)
        </label>
        <input
          className={inputClass}
          name="logoUrl"
          id="logoUrl"
          defaultValue={partner?.logoUrl ?? ""}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="contractEndDate">
          Vertragslaufzeit bis
        </label>
        <input
          className={inputClass}
          type="date"
          name="contractEndDate"
          id="contractEndDate"
          defaultValue={
            partner ? toDateInputValue(partner.contractEndDate) : defaultContractEndDate()
          }
          required
        />
      </div>
      <button type="submit" className={primaryButtonClass}>
        {partner ? "Änderungen speichern" : "Partnerbetrieb anlegen"}
      </button>
    </form>
  );
}
