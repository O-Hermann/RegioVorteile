import Link from "next/link";
import { ActivityIcon, UploadIcon, UsersIcon, ArrowRightIcon } from "@/components/icons";
import { SITE_NAME } from "@/lib/site-config";

const STEPS = [
  { icon: UploadIcon, text: "Analyse der vorhandenen Daten und Exporte" },
  { icon: ActivityIcon, text: "Einrichtung der ersten Unternehmensübersicht" },
  { icon: UsersIcon, text: "Persönliche Begleitung während der Einführung" },
];

export function IntroSection() {
  return (
    <section id="preise" className="scroll-mt-20 py-12 bg-white dark:bg-cockpit-section">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-petrol-100 dark:border-white/10 bg-petrol-50 dark:bg-gradient-to-br dark:from-cockpit-card dark:to-cockpit-card-dark p-7 sm:p-9 text-center shadow-sm dark:shadow-xl dark:shadow-black/30">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 hidden h-64 w-64 rounded-full bg-cockpit-accent-light/10 blur-3xl dark:block" />

          <h2 className="relative font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
            Zum Start individuell auf Ihr Unternehmen abgestimmt
          </h2>
          <p className="relative mt-3.5 text-slate-600 dark:text-cockpit-text-secondary max-w-xl mx-auto">
            {SITE_NAME} befindet sich in einer begrenzten Pilotphase. Gemeinsam stimmen
            wir Einrichtung, Funktionsumfang und Konditionen individuell auf Ihr
            Unternehmen ab.
          </p>

          <div className="relative mt-7 grid gap-4 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-petrol-200 dark:border-white/10 bg-white dark:bg-cockpit-card-dark/60 px-4 py-4 shadow-sm dark:shadow-lg dark:shadow-black/20"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-petrol-400/30 to-petrol-500/10 dark:from-cockpit-accent-light/25 dark:to-cockpit-accent/10 text-petrol-700 dark:text-cockpit-accent-light border border-petrol-200/60 dark:border-cockpit-accent-light/25">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-[15px] font-medium text-slate-800 dark:text-cockpit-text">{text}</p>
              </div>
            ))}
          </div>

          <Link
            href="/kontakt"
            className="group relative mt-7 inline-flex items-center gap-2 rounded-full bg-cockpit-accent hover:bg-cockpit-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            Kontakt aufnehmen
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
