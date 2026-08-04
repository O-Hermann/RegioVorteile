import { submitContactRequest } from "@/actions/contact-request";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";

const inputClass =
  "w-full rounded-lg border border-petrol-200 dark:border-cockpit-border bg-white dark:bg-cockpit-card-dark px-3 py-2 text-sm text-slate-900 dark:text-cockpit-heading placeholder:text-slate-400 dark:placeholder:text-cockpit-text-weak focus:outline-none focus:ring-2 focus:ring-cockpit-accent focus:border-cockpit-accent transition-colors";

const labelClass = "block text-sm font-medium text-slate-700 dark:text-cockpit-text mb-1";

export default async function KontaktPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <>
      <LandingHeader />
      <main className="flex-1 bg-white dark:bg-cockpit-hero">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-16">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
            Jetzt Kontakt aufnehmen
          </h1>
          <p className="mt-3 text-slate-600 dark:text-cockpit-text">
            Hinterlassen Sie uns Ihre Daten – wir melden uns bei Ihnen und besprechen die
            nächsten Schritte für die Pilotphase.
          </p>

          <div className="mt-8 rounded-2xl border border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-card p-6 sm:p-8">
            {sent && (
              <p className="mb-4 rounded-lg bg-petrol-50 dark:bg-cockpit-accent-subtle px-3 py-2 text-sm text-petrol-800 dark:text-cockpit-accent-light">
                Vielen Dank! Ihre Anfrage ist bei uns eingegangen, wir melden uns zeitnah.
              </p>
            )}
            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-cockpit-negative">
                Bitte füllen Sie alle Pflichtfelder aus.
              </p>
            )}

            <form action={submitContactRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="firstName">
                    Vorname
                  </label>
                  <input className={inputClass} name="firstName" id="firstName" required />
                </div>
                <div>
                  <label className={labelClass} htmlFor="lastName">
                    Nachname
                  </label>
                  <input className={inputClass} name="lastName" id="lastName" required />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="companyName">
                  Unternehmensname
                </label>
                <input className={inputClass} name="companyName" id="companyName" required />
              </div>
              <div>
                <label className={labelClass} htmlFor="street">
                  Straße und Hausnummer
                </label>
                <input className={inputClass} name="street" id="street" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} htmlFor="postalCode">
                    Postleitzahl
                  </label>
                  <input className={inputClass} name="postalCode" id="postalCode" required />
                </div>
                <div>
                  <label className={labelClass} htmlFor="phone">
                    Handynummer
                  </label>
                  <input className={inputClass} type="tel" name="phone" id="phone" required />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="message">
                  Nachricht (optional)
                </label>
                <textarea
                  className={inputClass}
                  name="message"
                  id="message"
                  rows={4}
                  placeholder="Erzählen Sie uns kurz von Ihrem Unternehmen oder Ihren Fragen..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-cockpit-accent hover:bg-cockpit-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                Anfrage senden
              </button>
            </form>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
