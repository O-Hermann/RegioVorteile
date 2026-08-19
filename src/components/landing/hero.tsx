import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { RecoveryPreview } from "@/components/landing/recovery-preview";
import { SectionNavLink } from "@/components/landing/section-nav-link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-landing-bg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-20 [background-image:radial-gradient(rgba(25,198,193,0.4)_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-landing-accent-light/10"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-[1.15] tracking-tight text-landing-text-primary">
              Finden Sie Geld, das Ihrem Unternehmen verloren geht.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-landing-text-secondary">
              Effivo analysiert Ihre Finanz- und Zahlungsdaten und erkennt auffällige
              Vorgänge wie mögliche Doppelzahlungen, offene Gutschriften und weitere
              finanzielle Lecks.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/kontakt"
                className="group inline-flex items-center gap-2 rounded-full bg-landing-accent hover:bg-landing-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                Potenzial prüfen
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <SectionNavLink
                href="/#geldlecks"
                className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-card px-6 py-3 text-sm font-semibold text-landing-text-primary hover:bg-landing-bg-alt transition-colors"
              >
                So funktioniert Effivo
              </SectionNavLink>
            </div>
            <p className="mt-6 text-xs text-landing-text-muted">
              Beispieldarstellung mit Beispieldaten zur Veranschaulichung.
            </p>
          </div>
          <RecoveryPreview />
        </div>
        <p className="relative mt-14 text-center text-xs font-medium text-landing-text-muted sm:mt-16">
          Scrollen, um die Analyse zu starten ↓
        </p>
      </div>
    </section>
  );
}
