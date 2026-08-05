import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { SectionNavLink } from "@/components/landing/section-nav-link";
import { SITE_NAME } from "@/lib/site-config";

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
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full border border-petrol-200 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-accent-subtle px-3 py-1 text-xs font-semibold tracking-wide uppercase text-petrol-800 dark:text-cockpit-accent-light">
              Das Dashboard für Geschäftsführer
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-cockpit-heading">
              <span className="block">Ihr Unternehmen.</span>
              <span className="block text-petrol-800 dark:text-cockpit-accent-light">
                Auf einen Blick.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-600 dark:text-cockpit-text">
              {SITE_NAME} führt Ihre wichtigsten Kennzahlen auf einer Seite zusammen.
              Vergleichen Sie Umsatz, Ergebnis und Aufträge mit dem Vormonat und
              erkennen Sie sofort, was sich verändert hat.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/kontakt"
                className="group inline-flex items-center gap-2 rounded-full bg-cockpit-accent hover:bg-cockpit-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                Kontakt aufnehmen
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <SectionNavLink
                href="/#funktionen"
                className="inline-flex items-center gap-2 rounded-full border border-petrol-200 bg-white px-6 py-3 text-sm font-semibold text-petrol-800 hover:bg-petrol-50 dark:border-cockpit-border dark:bg-transparent dark:text-cockpit-heading dark:hover:bg-cockpit-card transition-colors"
              >
                Funktionen entdecken
              </SectionNavLink>
            </div>
            <p className="mt-6 text-xs text-slate-500 dark:text-cockpit-text-weak">
              Beispieldarstellung mit Beispieldaten zur Veranschaulichung.
            </p>
          </div>
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
