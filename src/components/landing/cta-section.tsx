import { ArrowRightIcon } from "@/components/icons";
import { CONTACT_EMAIL } from "@/lib/site-config";

export function CtaSection() {
  return (
    <section className="py-20 border-t border-card-border bg-card">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-sand-900">
          Bereit für verständliches Controlling?
        </h2>
        <p className="mt-4 text-sand-700">
          Melden Sie sich für die Pilotphase und erfahren Sie, wie Controlling Cockpit
          Ihre Zahlen für Sie erklärt.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-petrol-600 px-6 py-3 text-sm font-semibold text-white shadow-warm hover:bg-petrol-700 hover:shadow-warm-lg transition-all"
        >
          Jetzt Kontakt aufnehmen
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
