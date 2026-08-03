import { ArrowRightIcon } from "@/components/icons";
import { DashboardPreview } from "@/components/landing/dashboard-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-20 [background-image:radial-gradient(rgba(34,211,238,0.4)_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-transparent dark:bg-cyan-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-24 h-80 w-80 rounded-full bg-transparent dark:bg-blue-600/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full border border-petrol-200 dark:border-cyan-400/30 bg-petrol-50 dark:bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-petrol-800 dark:text-cyan-300">
              Für Unternehmen ohne eigenen Controller
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-white">
              Ihre Zahlen. Endlich{" "}
              <span className="text-petrol-800 dark:bg-gradient-to-r dark:from-cyan-300 dark:to-blue-400 dark:bg-clip-text dark:text-transparent">
                verständlich erklärt.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-600 dark:text-slate-300">
              Controlling Cockpit liest Ihre gewohnten Buchhaltungs-Exporte und erklärt
              Ihnen in klarer Sprache, wie es um Umsatz, Kosten und Ergebnis wirklich
              steht – ganz ohne Controlling-Vorwissen.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#preise"
                className="group inline-flex items-center gap-2 rounded-full bg-petrol-800 hover:bg-petrol-900 px-6 py-3 text-sm font-semibold text-white transition-all dark:bg-gradient-to-br dark:from-cyan-400 dark:to-blue-600 dark:shadow-[0_0_30px_-10px_rgba(37,99,235,0.6)] dark:hover:from-cyan-300 dark:hover:to-blue-500 dark:hover:shadow-[0_0_30px_-6px_rgba(37,99,235,0.7)]"
              >
                Pilotphase anfragen
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#funktionen"
                className="inline-flex items-center gap-2 rounded-full border border-petrol-200 bg-white px-6 py-3 text-sm font-semibold text-petrol-800 hover:bg-petrol-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                Funktionen entdecken
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
              Aktuell in der Pilotphase – Beispieldaten zur Veranschaulichung.
            </p>
          </div>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
