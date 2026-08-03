import { ArrowRightIcon } from "@/components/icons";
import { DashboardPreview } from "@/components/landing/dashboard-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-petrol-300/25 dark:bg-petrol-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-24 h-80 w-80 rounded-full bg-petrol-200/30 dark:bg-petrol-700/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full border border-petrol-200 dark:border-petrol-700/50 bg-petrol-50 dark:bg-petrol-900/30 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-petrol-700 dark:text-petrol-200">
              Für Unternehmen ohne eigenen Controller
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight text-sand-900">
              Ihre Zahlen. Endlich verständlich erklärt.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-sand-700">
              Controlling Cockpit liest Ihre gewohnten Buchhaltungs-Exporte und erklärt
              Ihnen in klarer Sprache, wie es um Umsatz, Kosten und Ergebnis wirklich
              steht – ganz ohne Controlling-Vorwissen.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#preise"
                className="group inline-flex items-center gap-2 rounded-full bg-petrol-600 px-6 py-3 text-sm font-semibold text-white shadow-warm hover:bg-petrol-700 hover:shadow-warm-lg transition-all"
              >
                Pilotphase anfragen
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#funktionen"
                className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-6 py-3 text-sm font-semibold text-sand-800 hover:bg-sand-100 transition-colors"
              >
                Funktionen entdecken
              </a>
            </div>
            <p className="mt-6 text-xs text-sand-500">
              Aktuell in der Pilotphase – Beispieldaten zur Veranschaulichung.
            </p>
          </div>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
