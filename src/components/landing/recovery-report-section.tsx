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

// Vorherige Versionen versuchten die Hold-Phase entweder rein ueber
// Fortschritts-Werte (Report bleibt bei Fortschritt>REVEAL.Ende optisch
// unveraendert) oder ueber einen Abstandshalter im Dokumentfluss zu bauen.
// Beides schlug fehl: die Report-Karte war nie sticky/gepinnt, sie scrollte
// ganz normal mit - "unveraendert bleiben" bedeutete also nur "unveraendert
// WAEHREND sie ohnehin schon aus dem Bild scrollt", nicht "bleibt sichtbar
// stehen". Der Abstandshalter-Versuch tauschte das gegen eine leere Flaeche
// nach dem Wegscrollen der Karte ein - sichtbar, aber nicht das Gewuenschte.
//
// Diese Version nutzt deshalb dasselbe Muster wie die Partikel-Zahlen-Szene
// (impact-numbers-section.tsx): ein hoher, unsichtbarer "Track" liefert die
// Scrollstrecke, waehrend der eigentliche Inhalt darin "sticky" am oberen
// Rand haengen bleibt, bis der Track durchgescrollt ist. So kann die Karte
// tatsaechlich fertig aufgebaut werden UND danach pixelstabil im Viewport
// stehen bleiben, bevor sie sich mit dem Track-Ende loest.
// WICHTIG: "sticky" loest sich nicht erst bei Fortschritt 1 (Track-Ende),
// sondern sobald der gepinnte Innenbereich (Hoehe ~ 100vh-STICKY_TOP_PX)
// keinen Platz mehr im VERBLEIBENDEN Track hat - also bei ungefaehr
// Fortschritt = 1 - (100/TRACK_VH). Mit dem ersten Versuch (TRACK_VH=260)
// loeste sich sticky bereits bei Fortschritt ~0.62 - deutlich VOR dem
// gewuenschten Hold-Ende (0.85), die Karte scrollte also schon waehrend der
// vermeintlichen Hold-Phase normal weg (per Messung im echten Browser
// bestaetigt: stickyTop war bei Fortschritt 0.7 bereits -81px statt 88px).
// TRACK_VH muss deshalb gross genug sein, dass dieser Ausloese-Punkt klar
// NACH dem Hold-Ende liegt.
const TRACK_VH = 450;
const STICKY_TOP_PX = 88;

// Choreografie-Fenster als Bruchteil des TRACK_VH-Durchlaufs (0 = Track-
// Oberkante beruehrt Viewport-Oberkante, sticky beginnt zu pinnen). Ab
// REVEAL-Ende (0.58) aendert sich an KEINEM Motion-Value mehr etwas (siehe
// reportY/Scale/Opacity, gatherEased, labelOpacity - alle sind dank
// { clamp: true } ab da konstant), waehrend der Report dank sticky
// weiterhin PIXELSTABIL im Viewport steht: das ist die Hold-Phase. Bei
// TRACK_VH=450 loest sich sticky (siehe Erklaerung oben) rechnerisch bei
// Fortschritt ~0.78-0.81 (je nach Viewport-Hoehe) - die Karte bleibt also
// von 0.58 bis dorthin tatsaechlich gepinnt sichtbar, bevor sie sich fuer
// den letzten kurzen Rest bis Fortschritt 1 natuerlich (ohne zusaetzliche
// Animation) loest und mit dem Track-Ende nach oben aus dem Bild geht.
const CARDS_IN: [number, number] = [0.15, 0.28];
const LABEL_IN: [number, number] = [0.28, 0.32];
const LABEL_OUT: [number, number] = [0.34, 0.36];
const GATHER: [number, number] = [0.36, 0.52];
const REVEAL: [number, number] = [0.42, 0.58];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

export function RecoveryReportSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

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
    <section id="report" className="scroll-mt-20 border-y border-landing-border bg-landing-bg">
      {prefersReducedMotion ? (
        <div className="py-24 sm:py-28">
          <StaticRecoveryReport />
        </div>
      ) : (
        <>
          <div ref={trackRef} className="relative hidden lg:block" style={{ height: `${TRACK_VH}vh` }}>
            <div
              className="sticky overflow-hidden"
              style={{ top: STICKY_TOP_PX, height: `calc(100vh - ${STICKY_TOP_PX}px)` }}
            >
              <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">Recovery Report</span>
                <h2 className="max-w-2xl font-display text-2xl font-extrabold tracking-tight text-landing-text-primary sm:text-3xl">
                  Aus bestätigten Funden wird ein klares Ergebnis.
                </h2>
                <p className="mt-1 max-w-xl text-sm text-landing-text-secondary">
                  Kein Analysechaos. Der Kunde bekommt eine verständliche Zusammenfassung und kann jeden Fund nachvollziehen.
                </p>

                <div className="mt-2 grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                  <ul className="space-y-3">
                    {CHECKLINES.map((line) => (
                      <li key={line} className="flex items-start gap-3 text-landing-text-secondary">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-landing-accent-subtle text-xs font-bold text-landing-accent-light">
                          ✓
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>

                  <div className="relative mx-8 my-2 sm:mx-16">
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 -top-14 hidden flex-col items-center text-center lg:flex"
                      style={{ x: "-50%", y: labelY, scale: labelScale, opacity: labelOpacity }}
                    >
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-landing-accent-light">32 bestätigte Funde</span>
                      <b className="mt-2 max-w-[14rem] font-display text-xl font-bold text-landing-text-primary">werden zusammengeführt</b>
                    </motion.div>
                    <div aria-hidden className="pointer-events-none absolute -inset-8">
                      {FRAGMENTS.map((fragment) => (
                        <ReportFragment key={fragment.label} fragment={fragment} cardsIn={cardsIn} gather={gatherEased} />
                      ))}
                    </div>

                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-landing-accent-light/10 blur-2xl dark:bg-landing-accent-light/15"
                    />
                    <motion.div
                      className="relative overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated p-4 shadow-xl shadow-slate-900/10 ring-1 ring-landing-accent-light/15 dark:shadow-2xl dark:shadow-black/50"
                      style={{ y: reportY, scale: reportScale, opacity: reportOpacity }}
                    >
                      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-landing-accent-light via-landing-accent to-transparent" />
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-landing-accent-subtle text-landing-accent-light">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                        <p className="font-display text-base font-extrabold tracking-tight text-landing-text-primary">effivo</p>
                      </div>
                      <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight text-landing-text-primary">Recovery Report</h3>
                      <p className="mt-1 text-xs text-landing-text-muted">Analysezeitraum: Juli 2026</p>
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        {REPORT_STATS.map((stat) => (
                          <div key={stat.label} className="rounded-xl border border-landing-border bg-landing-bg-alt p-2">
                            <p className="text-[10px] uppercase tracking-wide text-landing-text-muted">{stat.label}</p>
                            <p className="mt-0.5 text-lg font-bold text-landing-text-primary">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="relative mt-2 overflow-hidden rounded-xl bg-gradient-to-br from-landing-accent-subtle to-landing-accent-subtle/50 p-3 ring-1 ring-inset ring-landing-accent-light/25">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-landing-accent-light">Bestätigtes Potenzial</p>
                        <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-landing-accent-light">18.740 €</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="py-24 sm:py-28 lg:hidden">
            <StaticRecoveryReport />
          </div>
        </>
      )}
    </section>
  );
}

// Statische Fassung fuer Mobile und "prefers-reduced-motion": keine
// Scroll-Kopplung, Report direkt vollstaendig sichtbar - identischer Inhalt
// wie die gepinnte Desktop-Szene, nur ohne Animation/Sticky-Traeger.
function StaticRecoveryReport() {
  return (
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

        <div className="relative mx-8 my-10 sm:mx-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-landing-accent-light/10 blur-2xl dark:bg-landing-accent-light/15"
          />
          <div className="relative overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated p-7 shadow-xl shadow-slate-900/10 ring-1 ring-landing-accent-light/15 dark:shadow-2xl dark:shadow-black/50">
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
          </div>
        </div>
      </div>
    </div>
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
