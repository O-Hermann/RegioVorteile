import { submitPartnerInquiry } from "@/actions/partner-inquiry";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

export default async function PartnerWerdenPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <>
      <LandingHeader />
      <main className="flex-1 mx-auto max-w-xl px-4 sm:px-6 py-16">
        <div className={cardClass}>
          <h1 className="font-display text-2xl font-semibold text-sand-900">
            Partnerbetrieb werden
          </h1>
          <p className="mt-1 text-sm text-sand-600">
            Erzählen Sie uns kurz von Ihrem Betrieb – wir melden uns bei Ihnen, um den
            Vorteil und die Einrichtung zu besprechen.
          </p>

          {sent && (
            <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Vielen Dank! Ihre Anfrage ist bei uns eingegangen, wir melden uns zeitnah.
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Bitte füllen Sie mindestens Betrieb, Ansprechpartner und E-Mail aus.
            </p>
          )}

          <form action={submitPartnerInquiry} className="mt-6 space-y-4">
            <div>
              <label className={labelClass} htmlFor="businessName">
                Name des Betriebs
              </label>
              <input className={inputClass} name="businessName" id="businessName" required />
            </div>
            <div>
              <label className={labelClass} htmlFor="contactName">
                Ansprechpartner
              </label>
              <input className={inputClass} name="contactName" id="contactName" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="email">
                  E-Mail
                </label>
                <input className={inputClass} type="email" name="email" id="email" required />
              </div>
              <div>
                <label className={labelClass} htmlFor="phone">
                  Telefon (optional)
                </label>
                <input className={inputClass} type="tel" name="phone" id="phone" />
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
                placeholder="Zum Beispiel: Art des Betriebs, gewünschter Vorteil, Region..."
              />
            </div>
            <button type="submit" className={`w-full ${primaryButtonClass}`}>
              Anfrage senden
            </button>
          </form>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
