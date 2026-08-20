"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type Row = { id: string; vendor: string; ref: string; date: string; amount: string; focus: boolean };

const ROWS: Row[] = [
  { id: "row-1", vendor: "Müller GmbH", ref: "RE-10024", date: "03.07.2026", amount: "2.480 €", focus: true },
  { id: "row-2", vendor: "Telekom AG", ref: "563482", date: "04.07.2026", amount: "184 €", focus: false },
  { id: "row-3", vendor: "Mustertechnik GmbH", ref: "MT-2249", date: "05.07.2026", amount: "4.820 €", focus: false },
  { id: "row-4", vendor: "Bürobedarf GmbH", ref: "100839", date: "07.07.2026", amount: "638 €", focus: false },
  { id: "row-5", vendor: "Müller GmbH", ref: "RE10024", date: "08.07.2026", amount: "2.480 €", focus: true },
  { id: "row-6", vendor: "Cloud Systems GmbH", ref: "CS-8821", date: "09.07.2026", amount: "1.240 €", focus: false },
];

const REASON_CHIPS = ["gleicher Kreditor", "gleicher Betrag", "ähnliche Rechnungsnummer", "5 Tage Abstand"];

type Step = { index: string; headline: string; copy: string; money?: string };

const STEPS: Step[] = [
  {
    index: "01 — Daten",
    headline: "Tausende Buchungen.",
    copy: "Auf den ersten Blick sieht alles normal aus. Genau darin liegt das Problem: Kleine Fehler verschwinden in der Masse.",
  },
  {
    index: "02 — Entdeckung",
    headline: "Bis eine Zahlung zweimal auffällt.",
    copy: "Im Übergang wird sichtbar, warum diese zwei Buchungen zusammengehören: gleicher Lieferant, gleicher Betrag, fast dieselbe Rechnungsnummer.",
    money: "2.480 € mögliches Potenzial",
  },
  {
    index: "03 — Prüfung",
    headline: "Effivo erklärt, warum der Fall auffällt.",
    copy: "Die beiden Buchungen werden isoliert. Effivo zeigt transparent, welche Merkmale übereinstimmen – damit der Fund nachvollziehbar geprüft werden kann.",
  },
  {
    index: "04 — Entscheidung",
    headline: "Sie prüfen nur noch das Wesentliche.",
    copy: "Effivo reduziert zehntausende Datensätze auf wenige nachvollziehbare Fälle. Sie bestätigen, verwerfen oder prüfen später.",
  },
];

// Zentren (Anteil am Kapitel-Scrollfortschritt 0..1) und Haltebreite jedes
// Story-Texts - identisch zur Referenz-Dramaturgie: jede Phase haelt lange
// zentriert und blendet erst zur naechsten Phase hin weich aus.
//
// STORY_WIDTH bestimmt, wie weit die Ein-/Ausblend-Glocke jeder Phase um
// ihr eigenes Zentrum reicht. Bei 0.24 (vorheriger Wert) und einem
// Zentrums-Abstand von nur ca. 0.27-0.29 ueberlappten sich die Glocken
// benachbarter Phasen SUBSTANZIELL: am Mittelpunkt zwischen zwei Zentren
// standen beide Headlines gleichzeitig bei ueber 35% Opacity - deutlich
// sichtbar und lesbar uebereinander (per Nachrechnung bestaetigt, nicht nur
// vermutet). Mit 0.185 bleibt jede Phase an ihrem eigenen Zentrum weiterhin
// voll sichtbar (Opacity exakt 1 dort, unveraendert), aber am Mittelpunkt
// zwischen zwei Phasen liegt die gemeinsame Opacity nur noch bei ca.
// 12-18% - ein weicher, aber deutlich unauffaelligerer Crossfade statt
// zwei gleichzeitig lesbaren Headlines.
const STORY_CENTERS = [0.07, 0.35, 0.64, 0.91];
const STORY_WIDTH = 0.185;
const DOT_POSITIONS = [8, 36, 64, 92];

const CHAPTER_VH = 420;
const STICKY_TOP_PX = 88;

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

// Glockenkurve (Ein-/Ausblenden) um `center`, angenaehert durch mehrere
// vorab berechnete Stuetzstellen - fuer useTransform als reines
// [input,output]-Array, ohne Laufzeit-Mathematik pro Frame.
function tentKeyframes(center: number, width: number, resolution = 8): [number[], number[]] {
  const lo = Math.max(0, center - width);
  const hi = Math.min(1, center + width);
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= resolution; i++) {
    const x = lo + ((hi - lo) * i) / resolution;
    const d = Math.abs(x - center);
    xs.push(x);
    ys.push(smoothstep(1 - d / width));
  }
  return [xs, ys];
}

// Das erste grosse Scrollytelling: EIN gepinntes Kapitel, dessen
// Scrollfortschritt (scrollYProgress, via useScroll) die einzige Quelle der
// Wahrheit ist. Die vier Phasen (Daten -> Entdeckung -> Pruefung ->
// Entscheidung) sind keine diskreten Schritte, sondern stetige Funktionen
// dieses einen Werts: beide Müller-Buchungen werden synchron erkannt, die
// Fundkarte waechst weich aus der Analyseflaeche, und ab einem festen
// Fortschrittspunkt (0.56 fuer die Zeilen, 0.62 fuer die Fundkarte) wird der
// gesamte rechte Bereich bewusst PIXELSTABIL (feste Werte statt weiterer
// Interpolation), damit der Uebergang zu Phase 04 keinerlei Bewegung im
// Analysebereich mehr erzeugt. Auf Mobile und bei reduzierter Bewegung wird
// eine statische, nicht gepinnte Fassung gerendert.
export function LeakScrollytelling() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // Mit diesem Offset-Paar loest sich "sticky" rein rechnerisch immer exakt
  // bei Fortschritt 1 - ABER das ist nicht dasselbe wie "das Kapitel endet
  // dort": zwischen diesem Ausloese-Punkt und dem TATSAECHLICHEN Ende des
  // 420vh-Tracks liegt geometrisch bedingt immer genau eine Viewport-Hoehe
  // (der Unterschied zwischen "end end" [Zieluntergrenze beruehrt unteren
  // Viewport-Rand] und dem physischen Kapitelende). In genau dieser
  // Viewport-Hoehe passiert die eigentliche Ausschwing-Bewegung: die Karte
  // loest sich von "sticky" und scrollt ganz normal nach oben aus dem Bild -
  // das war schon immer so, unabhaengig von jeder Opacity-Anpassung. Ein
  // erster Versuch blendete Story-Spalte und Analysekarte VOR diesem
  // Fortschritt-1-Punkt auf eine niedrige Opacity herunter (per Definition
  // von useTransform mit clamp geblieben) - dadurch war die Szene waehrend
  // der GESAMTEN nachfolgenden Ausschwing-Viewport-Hoehe konstant dunkel,
  // was wie ein langer, fast leerer Bildschirm wirkte.
  //
  // Diese Version nutzt stattdessen einen ZWEITEN, unabhaengigen
  // Scroll-Fortschritt, der praezise NUR diese eine Viewport-Hoehe
  // Ausschwing-Strecke abdeckt ("end end" -> "end start" auf demselben
  // sectionRef: 0 = genau der Ausloese-Punkt, wo die Karte beginnt sich zu
  // loesen: 1 = die Karte hat den Viewport komplett verlassen, das Kapitel
  // endet). Der Fade laeuft dadurch WAEHREND der ohnehin stattfindenden
  // Scroll-Bewegung, statt sie vorher schon abzudunkeln - die Szene bleibt
  // beim eigentlichen Loesen sichtbar hell und wird erst beim Verlassen des
  // Bildschirms dezent dunkler, was sich wie ein ruhiges Verlassen der
  // Buehne anfuehlt statt wie eine lange, dunkle Leerflaeche.
  const { scrollYProgress: exitProgress } = useScroll({ target: sectionRef, offset: ["end end", "end start"] });
  const chapterExitOpacity = useTransform(exitProgress, [0, 1], [1, 0.55]);
  const chapterExitY = useTransform(exitProgress, [0, 1], [0, -18]);

  return (
    <section id="geldlecks" className="relative bg-landing-bg-alt">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
          Geld geht selten auf einmal verloren.
        </h2>
        <p className="mt-4 text-landing-text-secondary">
          Oft sind es kleine Fehler, die im Tagesgeschäft zwischen tausenden Buchungen verschwinden. Scrollen Sie weiter – Effivo macht sie sichtbar.
        </p>
      </div>

      {prefersReducedMotion ? (
        <div className="pb-20 sm:pb-28">
          <StaticStory />
        </div>
      ) : (
        <>
          <div ref={sectionRef} className="relative hidden lg:block" style={{ height: `${CHAPTER_VH}vh` }}>
            <div className="sticky overflow-hidden" style={{ top: STICKY_TOP_PX, height: `calc(100vh - ${STICKY_TOP_PX}px)` }}>
              <motion.div
                className="mx-auto grid h-full max-w-6xl grid-cols-[0.92fr_1.08fr] items-center gap-x-14 px-4 sm:px-6"
                style={{ opacity: chapterExitOpacity, y: chapterExitY }}
              >
                <StoryColumn scrollYProgress={scrollYProgress} />
                <VisualCard scrollYProgress={scrollYProgress} />
              </motion.div>
            </div>
          </div>
          <div className="pb-20 lg:hidden">
            <StaticStory />
          </div>
        </>
      )}
    </section>
  );
}

function StoryColumn({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  return (
    <div className="relative h-[68vh]">
      <RailDots scrollYProgress={scrollYProgress} />
      {STEPS.map((step, i) => (
        <StoryBlock key={step.index} step={step} center={STORY_CENTERS[i]} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function StoryBlock({ step, center, scrollYProgress }: { step: Step; center: number; scrollYProgress: MotionValue<number> }) {
  const [input, output] = tentKeyframes(center, STORY_WIDTH);
  const opacity = useTransform(scrollYProgress, input, output);
  const y = useTransform(scrollYProgress, (p) => (center - p) * 330);
  return (
    <motion.article className="absolute inset-x-0 top-0 pr-4" style={{ opacity, y }}>
      <div className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">{step.index}</div>
      <h3 className="mt-3 max-w-lg font-display text-3xl font-extrabold leading-[1.03] tracking-tight text-landing-text-primary sm:text-4xl lg:text-[2.75rem]">
        {step.headline}
      </h3>
      <p className="mt-4 max-w-md text-landing-text-secondary">{step.copy}</p>
      {step.money && <div className="mt-5 text-xl font-extrabold tracking-tight text-landing-text-primary">{step.money}</div>}
    </motion.article>
  );
}

function RailDots({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const fillHeight = useTransform(scrollYProgress, (p) => `${p * 100}%`);
  return (
    <div aria-hidden className="absolute -left-6 top-[6%] bottom-[6%] hidden w-px bg-landing-border lg:block">
      <motion.div className="w-px bg-landing-accent-light" style={{ height: fillHeight }} />
      {STORY_CENTERS.map((center, i) => (
        <RailDotItem key={center} top={DOT_POSITIONS[i]} center={center} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function RailDotItem({ top, center, scrollYProgress }: { top: number; center: number; scrollYProgress: MotionValue<number> }) {
  const active = useTransform(scrollYProgress, (p) => (p >= center - 0.08 ? 1 : 0));
  const borderColor = useTransform(active, (a) => (a ? "var(--landing-accent-light)" : "var(--landing-border)"));
  const backgroundColor = useTransform(active, (a) => (a ? "var(--landing-accent-light)" : "var(--landing-bg-alt)"));
  return (
    <motion.span
      className="absolute -left-[5px] h-2.5 w-2.5 rounded-full border-2"
      style={{ top: `${top}%`, borderColor, backgroundColor }}
    />
  );
}

function VisualCard({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const pairIn = useTransform(scrollYProgress, [0.205, 0.3], [0, 1]);
  const pairPeakOut = useTransform(scrollYProgress, [0.405, 0.51], [0, 1]);
  const pairPeak = useTransform(() => pairIn.get() * (1 - pairPeakOut.get()));
  const lockTransition = useTransform(scrollYProgress, [0.425, 0.52], [0, 1]);
  const rowsLocked = useTransform(scrollYProgress, (p) => Number(p >= 0.56));

  return (
    <div className="relative hidden min-h-[min(74vh,720px)] overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40 lg:block">
      <div
        aria-hidden
        className="h-[2px] w-full bg-gradient-to-r from-transparent via-landing-accent-light to-transparent opacity-70"
      />
      <div className="relative flex items-center justify-between border-b border-landing-border px-6 py-5">
        <span className="font-display text-base font-bold text-landing-text-primary">Effivo Analyse</span>
        <span className="text-xs font-medium text-landing-accent-light">38.421 Buchungen geladen</span>
      </div>
      <div className="relative px-4 pb-[220px] pt-4">
        {ROWS.map((row) => (
          <BookingRow key={row.id} row={row} pairPeak={pairPeak} lockTransition={lockTransition} rowsLocked={rowsLocked} scrollYProgress={scrollYProgress} />
        ))}
      </div>
      <FindingCard scrollYProgress={scrollYProgress} />
    </div>
  );
}

function BookingRow({
  row,
  pairPeak,
  lockTransition,
  rowsLocked,
  scrollYProgress,
}: {
  row: Row;
  pairPeak: MotionValue<number>;
  lockTransition: MotionValue<number>;
  rowsLocked: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
}) {
  const background = useTransform(() => {
    if (!row.focus) return "transparent";
    if (rowsLocked.get()) return "linear-gradient(90deg, rgba(25,198,193,.05), rgba(25,198,193,.016))";
    const tint = Math.max(0.1 * pairPeak.get(), 0.046 * lockTransition.get());
    return `linear-gradient(90deg, rgba(25,198,193,${tint}), rgba(25,198,193,${tint * 0.34}))`;
  });
  const borderColor = useTransform(() => {
    if (!row.focus) return "transparent";
    if (rowsLocked.get()) return "rgba(25,198,193,.22)";
    return `rgba(25,198,193,${0.08 + 0.3 * pairPeak.get() + 0.11 * lockTransition.get()})`;
  });
  const boxShadow = useTransform(() => {
    if (!row.focus) return "none";
    if (rowsLocked.get()) return "0 0 16px rgba(25,198,193,.03), inset 0 0 0 1px rgba(25,198,193,.025)";
    const peak = pairPeak.get();
    return `0 0 ${14 + 22 * peak}px rgba(25,198,193,${0.02 + 0.045 * peak})`;
  });
  const x = useTransform(() => {
    if (!row.focus) return 0;
    if (rowsLocked.get()) return 1.4;
    return 3.4 * pairPeak.get() + 1.4 * lockTransition.get();
  });
  const scale = useTransform(() => {
    if (!row.focus) return 1;
    if (rowsLocked.get()) return 1.002;
    return 1 + 0.006 * pairPeak.get() + 0.002 * lockTransition.get();
  });
  const opacity = useTransform(() => {
    if (row.focus) return 1;
    const p = scrollYProgress.get();
    if (p >= 0.56) return 0.64;
    const isolate = smoothstep(clamp01((p - 0.42) / 0.24));
    return 1 - (pairPeak.get() * 0.18 + isolate * 0.36);
  });
  const matchBadgeOpacity = useTransform(() => {
    if (!row.focus) return 0;
    if (rowsLocked.get()) return 0.8;
    const peak = pairPeak.get();
    return peak > 0.16 ? 1 : peak > 0.08 ? 0.48 : 0;
  });

  return (
    <motion.div
      className="relative mb-2 grid grid-cols-[1.3fr_0.6fr] items-center gap-3 rounded-2xl border px-4 py-4 sm:grid-cols-[1.3fr_0.7fr_0.55fr]"
      style={{ background, borderColor, boxShadow, x, scale, opacity }}
    >
      <div>
        <p className="text-sm font-semibold text-landing-text-primary">{row.vendor}</p>
        <p className="mt-0.5 text-xs text-landing-text-muted">{row.ref}</p>
        {row.focus && (
          <motion.span
            className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-landing-danger/30 bg-landing-danger-subtle px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-landing-danger"
            style={{ opacity: matchBadgeOpacity }}
          >
            <span aria-hidden className="h-1 w-1 rounded-full bg-landing-danger" />
            Möglicher Match
          </motion.span>
        )}
      </div>
      <p className="hidden text-xs text-landing-text-muted sm:block">{row.date}</p>
      <p className="text-right text-sm font-bold tabular-nums text-landing-text-primary">{row.amount}</p>
    </motion.div>
  );
}

function FindingCard({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const explainIn = useTransform(scrollYProgress, [0.485, 0.6], [0, 1]);
  const locked = useTransform(scrollYProgress, (p) => Number(p >= 0.62));
  const opacity = useTransform(() => (locked.get() ? 1 : explainIn.get()));
  const y = useTransform(() => (locked.get() ? 0 : 30 * (1 - explainIn.get())));
  const scale = useTransform(() => (locked.get() ? 1 : 0.982 + 0.018 * explainIn.get()));
  const blurPx = useTransform(() => (locked.get() ? 0 : 3 * (1 - explainIn.get())));
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);
  const decisionIn = useTransform(scrollYProgress, [0.795, 0.89], [0, 1]);
  const decisionY = useTransform(decisionIn, (d) => 6 * (1 - d));

  return (
    <motion.div
      className="absolute inset-x-4 bottom-4 rounded-2xl border border-landing-border bg-landing-card px-5 py-5 shadow-lg shadow-slate-900/10 dark:shadow-xl dark:shadow-black/40"
      style={{ opacity, y, scale, filter }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-display text-base font-bold text-landing-text-primary">Mögliche Doppelzahlung</h4>
          <p className="mt-1.5 text-xs font-bold text-landing-danger">Hohe Übereinstimmung</p>
          <p className="mt-0.5 text-[11px] text-landing-text-muted">Betrag · Kreditor · Rechnungsreferenz</p>
        </div>
        <div className="min-w-[112px] rounded-xl border border-landing-danger/25 bg-landing-danger-subtle px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-wide text-landing-text-muted">Mögliches Potenzial</p>
          <p className="mt-0.5 font-display text-2xl font-extrabold text-landing-text-primary">2.480 €</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-landing-text-secondary">
        Die beiden Buchungen stimmen in Lieferant und Betrag überein. Die Rechnungsnummer unterscheidet sich lediglich in der Formatierung.
      </p>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-landing-text-muted">Warum dieser Fall auffällt</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {REASON_CHIPS.map((chip, i) => (
          <ReasonChip key={chip} label={chip} index={i} locked={locked} scrollYProgress={scrollYProgress} />
        ))}
      </div>
      <div className="relative mt-3 h-9">
        <motion.div className="absolute inset-x-0 bottom-0 flex flex-nowrap gap-2" style={{ opacity: decisionIn, y: decisionY }}>
          <span className="inline-flex h-8 items-center rounded-lg border border-landing-accent-light/30 bg-landing-accent-subtle px-3 text-[10px] font-bold text-landing-accent-light">
            ✓ Bestätigen
          </span>
          <span className="inline-flex h-8 items-center rounded-lg border border-landing-border px-3 text-[10px] font-bold text-landing-text-secondary">
            Kein Fehler
          </span>
          <span className="inline-flex h-8 items-center rounded-lg border border-landing-border px-3 text-[10px] font-bold text-landing-text-muted">
            Später prüfen
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ReasonChip({
  label,
  index,
  locked,
  scrollYProgress,
}: {
  label: string;
  index: number;
  locked: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
}) {
  const start = 0.535 + index * 0.018;
  const cp = useTransform(scrollYProgress, [start, start + 0.075], [0, 1]);
  const opacity = useTransform(() => (locked.get() ? 1 : 0.28 + 0.72 * cp.get()));
  const y = useTransform(() => (locked.get() ? 0 : 5 * (1 - cp.get())));
  return (
    <motion.span className="rounded-full border border-landing-border px-2.5 py-1 text-[10px] text-landing-text-secondary" style={{ opacity, y }}>
      {label}
    </motion.span>
  );
}

// Kompakte, nicht gepinnte vertikale Fassung - fuer Mobile und fuer
// "prefers-reduced-motion": alle vier Phasen sofort vollstaendig sichtbar
// untereinander, keine Scroll-Kopplung.
function StaticStory() {
  return (
    <div className="mx-auto max-w-2xl space-y-12 px-4 sm:px-6">
      {STEPS.map((step) => (
        <div key={step.index}>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">{step.index}</div>
          <h3 className="mt-3 font-display text-2xl font-extrabold leading-[1.05] tracking-tight text-landing-text-primary sm:text-3xl">
            {step.headline}
          </h3>
          <p className="mt-3 text-landing-text-secondary">{step.copy}</p>
          {step.money && <div className="mt-4 text-lg font-extrabold tracking-tight text-landing-text-primary">{step.money}</div>}
        </div>
      ))}

      <div className="overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-landing-accent-light to-transparent opacity-70" />
        <div className="flex items-center justify-between border-b border-landing-border px-5 py-4">
          <span className="font-display text-sm font-bold text-landing-text-primary">Effivo Analyse</span>
          <span className="text-xs font-medium text-landing-accent-light">38.421 Buchungen geladen</span>
        </div>
        <div className="space-y-2 px-4 py-4">
          {ROWS.map((row) => (
            <div
              key={row.id}
              className={`rounded-2xl border px-4 py-3.5 ${
                row.focus ? "border-landing-danger/25 bg-landing-danger-subtle/40" : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-landing-text-primary">{row.vendor}</p>
                  <p className="mt-0.5 text-xs text-landing-text-muted">{row.ref}</p>
                </div>
                <p className="text-sm font-bold tabular-nums text-landing-text-primary">{row.amount}</p>
              </div>
              {row.focus && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-landing-danger/30 bg-landing-danger-subtle px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-landing-danger">
                  <span aria-hidden className="h-1 w-1 rounded-full bg-landing-danger" />
                  Möglicher Match
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-landing-border bg-landing-bg-alt px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-display text-base font-bold text-landing-text-primary">Mögliche Doppelzahlung</h4>
              <p className="mt-1.5 text-xs font-bold text-landing-danger">Hohe Übereinstimmung</p>
              <p className="mt-0.5 text-[11px] text-landing-text-muted">Betrag · Kreditor · Rechnungsreferenz</p>
            </div>
            <div className="min-w-[112px] rounded-xl border border-landing-danger/25 bg-landing-danger-subtle px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-wide text-landing-text-muted">Mögliches Potenzial</p>
              <p className="mt-0.5 font-display text-2xl font-extrabold text-landing-text-primary">2.480 €</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-landing-text-secondary">
            Die beiden Buchungen stimmen in Lieferant und Betrag überein. Die Rechnungsnummer unterscheidet sich lediglich in der Formatierung.
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-landing-text-muted">Warum dieser Fall auffällt</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REASON_CHIPS.map((chip) => (
              <span key={chip} className="rounded-full border border-landing-border px-2.5 py-1 text-[10px] text-landing-text-secondary">
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex h-8 items-center rounded-lg border border-landing-accent-light/30 bg-landing-accent-subtle px-3 text-[10px] font-bold text-landing-accent-light">
              ✓ Bestätigen
            </span>
            <span className="inline-flex h-8 items-center rounded-lg border border-landing-border px-3 text-[10px] font-bold text-landing-text-secondary">
              Kein Fehler
            </span>
            <span className="inline-flex h-8 items-center rounded-lg border border-landing-border px-3 text-[10px] font-bold text-landing-text-muted">
              Später prüfen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
