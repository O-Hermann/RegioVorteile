"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { CheckIcon } from "@/components/icons";

const CHECKLINES = [
  "bestätigte Fälle automatisch zusammenführen",
  "Betrag und Ursache pro Fund dokumentieren",
  "Ergebnis für Geschäftsführung und Buchhaltung aufbereiten",
  "später: zurückgeholte Beträge nachverfolgen",
];

// Kuerzere Distanzen als im ersten Entwurf: die Fund-Karten sollen wirken,
// als wuerden sie direkt am Report andocken, nicht als loeste Elemente aus
// dem freien Raum heranfliegen.
const FRAGMENTS: { label: string; dir: [number, number]; className: string }[] = [
  { label: "Doppelzahlung · 2.480 €", dir: [-54, -30], className: "left-0 top-[8%]" },
  { label: "Offene Gutschrift · 1.240 €", dir: [58, -22], className: "right-0 top-[28%]" },
  { label: "Skonto · 860 €", dir: [-60, 34], className: "left-0 bottom-[20%]" },
  { label: "Überzahlung · 1.120 €", dir: [62, 32], className: "right-0 bottom-[4%]" },
];

const REPORT_STATS = [
  { label: "Buchungen", value: "38.421" },
  { label: "Auffälligkeiten", value: "47" },
  { label: "Bestätigt", value: "32" },
  { label: "Verworfen", value: "15" },
];

// Choreografie-Fenster innerhalb des Durchlaufs der Kartenh uelle (siehe
// useScroll-Offset unten: 0 = Huelle bereits VOLLSTAENDIG sichtbar,
// 1 = Huelle vollstaendig verlassen). Weil Fortschritt 0 schon "komplett im
// Bild" bedeutet, reicht ein kurzer Ruhepuffer, statt - wie zuvor - fast bis
// zur Haelfte des Fortschritts warten zu muessen, nur um ueberhaupt volle
// Sichtbarkeit zu garantieren. Der fertige Report (REVEAL-Ende) liegt
// bewusst deutlich vor Fortschritt 1: von da bis 1 passiert nichts mehr -
// das ist ein Teil der geforderten Hold-Time. Gegenueber der letzten Version
// nochmal frueher abgeschlossen (Ende bei 0.58 statt 0.66), weil allein die
// interne Rest-Strecke der Huelle nicht ausreichte: der zweite, groessere
// Teil der Hold-Time kommt jetzt aus dem eigenen Abstandshalter direkt unter
// der Huelle (siehe JSX unten) - unabhaengig vom Fortschrittswert, rein
// physische Scrollstrecke im Dokumentfluss, die verhindert, dass die
// naechste Section auftaucht, bevor der Report wirklich ausreichend lange
// fertig da stand.
const CARDS_IN: [number, number] = [0.12, 0.26];
const LABEL_IN: [number, number] = [0.26, 0.34];
const LABEL_OUT: [number, number] = [0.36, 0.42];
const GATHER: [number, number] = [0.38, 0.56];
const REVEAL: [number, number] = [0.44, 0.58];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

// Der Recovery Report entsteht sichtbar AUS der vorherigen Geschichte, aber
// erst NACHDEM die Kartenh uelle selbst vollstaendig im Viewport steht - die
// Choreografie darf nicht schon unterhalb des sichtbaren Bereichs laufen.
// "start end" (Oberkante beruehrt unteren Viewport-Rand) war dafuer die
// falsche Wahl: Fortschritt 0 bedeutete dort "gerade erst am Reinschieben",
// nicht "sichtbar". "end end" (Unterkante beruehrt unteren Viewport-Rand)
// ist dagegen der fruehestmoegliche Punkt, an dem die GESAMTE Huelle bereits
// im Bild steht (reines Schluesselwort-Offset, kein anfaelliger
// Bruchzahl-Offset). Der Durchlauf endet, wenn die Huelle komplett verlassen
// ist ("end start") - dieses Punktepaar bildet unabhaengig von der Huellen-
// hoehe exakt eine Viewport-Hoehe Scrollstrecke ab (die Unterkante wandert
// dabei immer von "ganz unten" zu "ganz oben"), was reichlich Raum fuer eine
// ruhige Choreografie UND fuer echte Hold-Time nach dem fertigen Report
// gibt (siehe REVEAL oben, endet bereits bei 0.58 statt bei 1). Der interne
// Rest bis Fortschritt 1 ist aber NUR die halbe Miete fuer die Hold-Time -
// wie lange die naechste Section tatsaechlich noch verdeckt bleibt, haengt
// zusaetzlich vom physischen Abstand im Dokumentfluss ab (siehe Abstands-
// halter am Ende der JSX unten).
export function RecoveryReportSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["end end", "end start"] });

  const cardsIn = useTransform(scrollYProgress, CARDS_IN, [0, 1], { clamp: true });
  const gather = useTransform(scrollYProgress, GATHER, [0, 1], { clamp: true });
  const gatherEased = useTransform(gather, smoothstep);
  const reveal = useTransform(scrollYProgress, REVEAL, [0, 1], { clamp: true });
  const revealEased = useTransform(reveal, smoothstep);

  const labelIn = useTransform(scrollYProgress, LABEL_IN, [0, 1], { clamp: true });
  const labelOut = useTransform(scrollYProgress, LABEL_OUT, [0, 1], { clamp: true });
  const labelOpacity = useTransform(() => smoothstep(labelIn.get()) * (1 - smoothstep(labelOut.get())));
  const labelY = useTransform(labelOpacity, (o) => 10 * (1 - o));
  const labelScale = useTransform(labelOpacity, (o) => 0.96 + 0.04 * o);

  const reportY = useTransform(revealEased, (r) => 34 * (1 - r));
  const reportScale = useTransform(revealEased, (r) => 0.955 + 0.045 * r);
  const reportOpacity = useTransform(revealEased, (r) => 0.16 + 0.84 * r);

  return (
    <section id="report" className="scroll-mt-20 border-y border-landing-border bg-landing-bg py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">Recovery Report</span>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
          Aus bestätigten Funden wird ein klares Ergebnis.
        </h2>
        <p className="mt-4 max-w-xl text-landing-text-secondary">
          Kein Analysechaos. Der Kunde bekommt eine verständliche Zusammenfassung und kann jeden Fund nachvollziehen.
        </p>

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <ul className="space-y-4">
            {CHECKLINES.map((line) => (
              <li key={line} className="flex items-start gap-3 text-landing-text-secondary">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-landing-accent-subtle text-xs font-bold text-landing-accent-light">
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>

          <div ref={wrapRef} className="relative mx-8 my-10 sm:mx-16">
            {!prefersReducedMotion && (
              <>
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 -top-14 hidden flex-col items-center text-center lg:flex"
                  style={{ x: "-50%", y: labelY, scale: labelScale, opacity: labelOpacity }}
                >
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-landing-accent-light">32 bestätigte Funde</span>
                  <b className="mt-2 max-w-[14rem] font-display text-xl font-bold text-landing-text-primary">werden zusammengeführt</b>
                </motion.div>
                <div aria-hidden className="pointer-events-none absolute -inset-8 hidden lg:block">
                  {FRAGMENTS.map((fragment) => (
                    <ReportFragment key={fragment.label} fragment={fragment} cardsIn={cardsIn} gather={gatherEased} />
                  ))}
                </div>
              </>
            )}

            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-landing-accent-light/10 blur-2xl dark:bg-landing-accent-light/15"
            />
            <motion.div
              className="relative overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated p-7 shadow-xl shadow-slate-900/10 ring-1 ring-landing-accent-light/15 dark:shadow-2xl dark:shadow-black/50"
              style={prefersReducedMotion ? undefined : { y: reportY, scale: reportScale, opacity: reportOpacity }}
            >
              <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-landing-accent-light via-landing-accent to-transparent" />
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-landing-accent-subtle text-landing-accent-light">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="font-display text-base font-extrabold tracking-tight text-landing-text-primary">effivo</p>
              </div>
              <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-landing-text-primary">Recovery Report</h3>
              <p className="mt-1 text-xs text-landing-text-muted">Analysezeitraum: Juli 2026</p>
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                {REPORT_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-landing-border bg-landing-bg-alt p-3">
                    <p className="text-[10px] uppercase tracking-wide text-landing-text-muted">{stat.label}</p>
                    <p className="mt-0.5 text-xl font-bold text-landing-text-primary">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="relative mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-landing-accent-subtle to-landing-accent-subtle/50 p-5 ring-1 ring-inset ring-landing-accent-light/25">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-landing-accent-light">Bestätigtes Potenzial</p>
                <p className="mt-1 font-display text-4xl font-extrabold tracking-tight text-landing-accent-light">18.740 €</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Reiner Abstandshalter, kein Animationsziel: sorgt fuer physische
            Scrollstrecke im Dokumentfluss NACH der Kartenh uelle. Die Karte
            selbst ist NICHT sticky/pinned - sie scrollt normal mit, ihre
            Motion-Werte steuern nur die Erscheinung (Fade/Skalierung/
            Position), nicht ob sie im Viewport bleibt. Deshalb muss dieser
            Puffer in vh (viewport-relativ) und nicht in einer festen
            Pixelgroesse angegeben sein: ein fixer Wert waere auf hohen
            Bildschirmen viel zu klein und die naechste Section wuerde schon
            von unten hereinrutschen, waehrend der Report gerade erst fertig
            wurde (genau der gemeldete Bug). Bei reduzierter Bewegung ist der
            Report ohnehin nie "im Aufbau" sichtbar, deshalb entfaellt der
            Puffer dort. */}
        {!prefersReducedMotion && <div aria-hidden className="h-[95vh] sm:h-[110vh] lg:h-[130vh]" />}
      </div>
    </section>
  );
}

function ReportFragment({
  fragment,
  cardsIn,
  gather,
}: {
  fragment: { label: string; dir: [number, number]; className: string };
  cardsIn: MotionValue<number>;
  gather: MotionValue<number>;
}) {
  const x = useTransform(gather, (g) => fragment.dir[0] * (1 - g));
  const y = useTransform(gather, (g) => fragment.dir[1] * (1 - g));
  const scale = useTransform(gather, (g) => 1 - 0.18 * g);
  const blurPx = useTransform(gather, (g) => 1.5 * g);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);
  const opacity = useTransform(() => cardsIn.get() * 0.84 * (1 - smoothstep((gather.get() - 0.66) / 0.28)));

  return (
    <motion.div
      className={`absolute w-[9.5rem] overflow-hidden rounded-xl border border-landing-accent-light/20 bg-landing-card px-3 py-2.5 text-[11px] text-landing-text-secondary shadow-lg shadow-slate-900/10 ${fragment.className}`}
      style={{ x, y, scale, filter, opacity }}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-landing-accent-light" />
      <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-landing-accent-light">Bestätigt</span>
      {fragment.label}
    </motion.div>
  );
}
