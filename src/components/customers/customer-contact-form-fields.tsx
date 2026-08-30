import { dashInputClass as inputClass, dashLabelClass as labelClass } from "@/components/dashboard/dash-ui";

// Gemeinsame Felder fuer "Ansprechpartner hinzufügen" und "Ansprechpartner
// bearbeiten" (Phase 6.1, Punkt 27/29).
export function CustomerContactFormFields({
  defaults,
}: {
  defaults?: Partial<{
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    phone: string;
    isPrimary: boolean;
  }>;
}) {
  const d = defaults ?? {};
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClass} htmlFor="firstName">
          Vorname
        </label>
        <input className={inputClass} id="firstName" name="firstName" defaultValue={d.firstName} maxLength={200} />
      </div>
      <div>
        <label className={labelClass} htmlFor="lastName">
          Nachname
        </label>
        <input className={inputClass} id="lastName" name="lastName" defaultValue={d.lastName} maxLength={200} />
      </div>
      <div>
        <label className={labelClass} htmlFor="position">
          Position
        </label>
        <input className={inputClass} id="position" name="position" defaultValue={d.position} maxLength={200} />
      </div>
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
      <div className="flex items-center gap-2 pt-6">
        <input
          id="isPrimary"
          name="isPrimary"
          type="checkbox"
          defaultChecked={d.isPrimary}
          className="h-4 w-4 rounded border-dash-line text-dash-gold focus:ring-dash-gold/40"
        />
        <label htmlFor="isPrimary" className="text-sm font-medium text-dash-text">
          Hauptansprechpartner
        </label>
      </div>
    </div>
  );
}
