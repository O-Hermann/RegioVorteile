import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20 border-t border-petrol-100 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-section-alt">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent dark:bg-cockpit-accent/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
          Bereit für verständliches Controlling?
        </h2>
        <p className="mt-4 text-slate-600 dark:text-cockpit-text">
          Melden Sie sich für die Pilotphase und erfahren Sie, wie Controlling Cockpit
          Ihre Zahlen für Sie erklärt.
        </p>
        <Link
          href="/kontakt"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-cockpit-accent hover:bg-cockpit-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Jetzt Kontakt aufnehmen
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
