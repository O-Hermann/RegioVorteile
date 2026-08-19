import Link from "next/link";
import { ArrowRightIcon, UploadIcon, ActivityIcon, UsersIcon } from "@/components/icons";

const STEPS = [
  { icon: UploadIcon, text: "Analyse der vorhandenen Daten und Exporte" },
  { icon: ActivityIcon, text: "Einrichtung der ersten Unternehmensübersicht" },
  { icon: UsersIcon, text: "Persönliche Begleitung während der Einführung" },
];

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-20 text-center sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-accent-light/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
          Wie viel Geld bleibt in Ihren Daten unentdeckt?
        </h2>
        <p className="mt-4 text-landing-text-secondary">
          Effivo befindet sich in der Entwicklungs- und Pilotphase. Gemeinsam stimmen wir Einrichtung, Funktionsumfang und Konditionen
          individuell auf Ihr Unternehmen ab.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex flex-col items-center gap-2.5 rounded-xl border border-landing-border bg-landing-card px-4 py-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-landing-accent-subtle text-landing-accent-light">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-landing-text-primary">{text}</p>
            </div>
          ))}
        </div>

        <Link
          href="/kontakt"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-landing-accent hover:bg-landing-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Pilotunternehmen werden
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
