"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

// Ausblick auf Continuous Monitoring - bewusst als ZUKUNFT gekennzeichnet,
// nicht als heute bereits verfuegbares Feature. Deutlich ruhiger als das
// Scrollytelling und die Zahlen-Szene: statischer Mockup, keine
// scrollgekoppelte Animation - nur derselbe dezente Einblend-Effekt wie in
// den anderen ruhigen Sections nach dem Scrollytelling. Der leichte
// Verlaufsrand + das dezente Glow-Panel darunter geben dem Mockup etwas
// mehr technische Praesenz als eine reine Textsection, ohne eine neue
// Partikelshow oder grosse Animation zu sein.
export function FutureSection() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="border-y border-landing-border/60 bg-landing-bg-alt/72 py-24 text-center sm:py-28">
      <motion.div
        className="mx-auto max-w-2xl px-4 sm:px-6"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">Ausblick · Continuous Monitoring</span>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
          Finden ist der Anfang. Verhindern ist das Ziel.
        </h2>
        <p className="mt-4 text-landing-text-secondary">
          <b className="text-landing-text-primary">Heute:</b> Geldlecks finden.{" "}
          <b className="text-landing-text-primary">Morgen:</b> mögliche Verluste erkennen, bevor Geld tatsächlich verloren geht.
        </p>

        <div className="relative mx-auto mt-10 max-w-lg">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-landing-accent-light/10 blur-2xl dark:bg-landing-accent-light/15"
          />
          <div className="relative overflow-hidden rounded-2xl border border-landing-border bg-landing-card text-left shadow-sm shadow-slate-900/5 dark:shadow-xl dark:shadow-black/30">
            <div
              aria-hidden
              className="h-[2px] w-full bg-gradient-to-r from-transparent via-landing-accent-light to-transparent opacity-70"
            />
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 border-b border-landing-border pb-4">
                <div>
                  <p className="text-sm font-semibold text-landing-text-primary">Neue Zahlung</p>
                  <p className="mt-0.5 text-xs text-landing-text-muted">Müller GmbH · RE10024</p>
                </div>
                <p className="font-display text-base font-bold tabular-nums text-landing-text-primary">2.480 €</p>
              </div>
              <div className="mt-4 rounded-xl border border-landing-danger/30 bg-landing-danger-subtle p-4">
                <p className="text-sm font-bold text-landing-danger">Mögliche Doppelzahlung erkannt</p>
                <p className="mt-1 text-xs leading-relaxed text-landing-text-secondary">
                  Ähnlicher Vorgang bereits am 03.07.2026 gefunden. Bitte vor Freigabe prüfen.
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-landing-text-muted">Beispielhafte Darstellung einer zukünftigen Funktion – noch nicht Teil des heutigen Funktionsumfangs.</p>
      </motion.div>
    </section>
  );
}
