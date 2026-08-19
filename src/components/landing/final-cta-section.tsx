"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@/components/icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

// Bewusst schlank gehalten: die Seite hat bis hierhin bereits die ganze
// Geschichte erzaehlt (Buchungen -> Funde -> Pruefung -> Potenzial ->
// Report). Der Abschluss braucht deshalb keine weitere Feature-Liste mehr,
// nur noch EINE klare Frage und EINEN klaren naechsten Schritt - die drei
// vorherigen Ablauf-Boxen wichen einer einzigen, dezenten Zeile.
export function FinalCtaSection() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="relative overflow-hidden py-20 text-center sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-landing-accent-light/10 blur-3xl"
      />
      <motion.div
        className="relative mx-auto max-w-2xl px-4 sm:px-6"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
          Wie viel Geld bleibt in Ihren Daten unentdeckt?
        </h2>
        <p className="mt-4 text-landing-text-secondary">
          Effivo befindet sich in der Entwicklungs- und Pilotphase. Gemeinsam stimmen wir Einrichtung, Funktionsumfang und Konditionen
          individuell auf Ihr Unternehmen ab.
        </p>

        <Link
          href="/kontakt"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-landing-accent hover:bg-landing-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Pilotunternehmen werden
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <p className="mt-4 text-xs text-landing-text-muted">
          Analyse Ihrer Daten, Einrichtung der Übersicht und persönliche Begleitung während der Einführung.
        </p>
      </motion.div>
    </section>
  );
}
