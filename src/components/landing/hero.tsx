import { ArrowRightIcon } from "@/components/icons";
import { DashboardPreview } from "@/components/landing/dashboard-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-cockpit-hero">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-20 [background-image:radial-gradient(rgba(30,151,148,0.4)_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-transparent dark:bg-cockpit-accent/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full border border-petrol-200 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-accent-subtle px-3 py-1 text-xs font-semibold tracking-wide uppercase text-petrol-800 dark:text-cockpit-accent-light">
              Das Dashboard für Geschäftsführer
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-cockpit-heading">
              Ihr Unternehmen.{" "}
              <span className="text-petrol-800 dark:text-cockpit-accent-light">
                Auf einen Blick.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-600 dark:text-cockpit-text">
              UnternehmensCockpit führt Ihre wichtigsten Unternehmenszahlen auf einer
              übersichtlichen Seite zusammen. Vergleichen Sie Umsatz, Kosten, Ergebnis,
              Aufträge und weitere Kennzahlen mit dem Vormonat und erkennen Sie sofort,
              was sich verändert hat.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#preise"
                className="group inline-flex items-center gap-2 rounded-full bg-cockpit-accent hover:bg-cockpit-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                Pilotphase anfragen
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#funktionen"
                className="inline-flex items-center gap-2 rounded-full border border-petrol-200 bg-white px-6 py-3 text-sm font-semibold text-petrol-800 hover:bg-petrol-50 dark:border-cockpit-border dark:bg-transparent dark:text-cockpit-heading dark:hover:bg-cockpit-card transition-colors"
              >
                Funktionen entdecken
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-500 dark:text-cockpit-text-weak">
              Aktuell in der Pilotphase – Beispieldaten zur Veranschaulichung.
            </p>
          </div>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
