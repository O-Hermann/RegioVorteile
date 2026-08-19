"use client";

import { motion } from "framer-motion";
import { ShieldIcon, UsersIcon, CheckCircleIcon, FileTextIcon } from "@/components/icons";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const POINTS = [
  {
    icon: ShieldIcon,
    title: "Mandantentrennung",
    text: "Jedes Unternehmen sieht ausschließlich seine eigenen Daten.",
  },
  {
    icon: UsersIcon,
    title: "Zugriffskontrolle",
    text: "Zugriff nur für autorisierte Nutzer Ihres Unternehmens, geschützt durch individuelle Zugangsdaten.",
  },
  {
    icon: CheckCircleIcon,
    title: "Verschlüsselte Übertragung",
    text: "Daten werden verschlüsselt zwischen Ihrem Browser und Effivo übertragen.",
  },
  {
    icon: FileTextIcon,
    title: "Persönlich begleitete Pilotphase",
    text: "Einrichtung, Funktionsumfang und Datenverarbeitung werden gemeinsam mit Ihnen abgestimmt.",
  },
];

// Ruhiger, seriöser Vertrauensbereich - bewusst ohne erfundene
// Zertifizierungen oder überzogene Sicherheitsversprechen. Enthält den
// bestehenden rechtlichen Hinweis, dass Effivo keine Steuer-, Finanz- oder
// Unternehmensberatung ersetzt.
//
// Bewusst EIN ruhiges Panel statt vier einzelner Mini-Cards mit je eigener
// Border/Box: vier gleichrangige "Badges" nebeneinander wirken schnell wie
// eine Zertifikate-Wand ("schau, wie viele Security-Siegel wir haben") -
// das Gegenteil der gewuenschten Aussage "wir gehen bewusst und
// professionell mit diesen Daten um". Ein gemeinsames Panel mit klaren,
// durch duenne Trennlinien geordneten Aussagen wirkt dagegen wie EINE
// zusammenhaengende, seriöse Erklaerung.
export function SecuritySection() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section id="sicherheit" className="scroll-mt-20 bg-landing-bg py-24 sm:py-28">
      <motion.div
        className="mx-auto max-w-6xl px-4 sm:px-6"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">Sicherheit &amp; Vertrauen</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
            Ihre Daten bleiben Ihre Daten.
          </h2>
        </div>

        <div className="mt-10 rounded-3xl border border-landing-border bg-landing-card px-6 py-8 sm:px-10">
          <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 sm:divide-x sm:divide-landing-border">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4 sm:odd:pr-10 sm:even:pl-10">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-landing-accent-subtle text-landing-accent-light">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-landing-text-primary">{title}</h3>
                  <p className="mt-1 text-sm text-landing-text-secondary">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-sm text-landing-text-muted">
          Effivo stellt vorhandene Unternehmensdaten verständlich dar. Die Anwendung ersetzt keine Steuer-, Finanz- oder Unternehmensberatung.
        </p>
      </motion.div>
    </section>
  );
}
