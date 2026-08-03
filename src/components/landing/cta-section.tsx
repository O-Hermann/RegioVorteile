import { ArrowRightIcon } from "@/components/icons";
import { CONTACT_EMAIL } from "@/lib/site-config";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20 border-t border-petrol-100 dark:border-white/10 bg-petrol-50 dark:bg-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent dark:bg-cyan-500/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Bereit für verständliches Controlling?
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Melden Sie sich für die Pilotphase und erfahren Sie, wie Controlling Cockpit
          Ihre Zahlen für Sie erklärt.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-petrol-800 hover:bg-petrol-900 px-6 py-3 text-sm font-semibold text-white transition-all dark:bg-gradient-to-br dark:from-cyan-400 dark:to-blue-600 dark:shadow-[0_0_30px_-10px_rgba(37,99,235,0.6)] dark:hover:from-cyan-300 dark:hover:to-blue-500 dark:hover:shadow-[0_0_30px_-6px_rgba(37,99,235,0.7)]"
        >
          Jetzt Kontakt aufnehmen
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
