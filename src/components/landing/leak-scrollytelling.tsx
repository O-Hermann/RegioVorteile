"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { CheckIcon, EyeIcon, SearchIcon, TargetIcon } from "@/components/icons";

type Tone = "danger" | "warning" | "purple" | "accent";

type ReasonField = { label: string; value: string };

type Phase = {
  id: string;
  markerIndex: number; // Index in MARKERS (0-5) - "zusammenhang" und "effekt" teilen sich Index 4
  start: number; // Anteil am Gesamt-Scrollfortschritt der Section, 0..1
  end: number;
  tone: "neutral" | Tone;
  kicker: string;
  headline: string;
  copy: string;
  highlightRowIds?: string[];
  findingLabel?: string;
  findingAmount?: string;
  reasonFields?: ReasonField[];
};

const MARKERS = ["Analyse", "Doppelzahlung", "Gutschrift", "Muster", "Potenzial", "Kontrolle"];
const MARKER_RANGES: [number, number][] = [
  [0, 0.14],
  [0.14, 0.29],
  [0.29, 0.44],
  [0.44, 0.59],
  [0.59, 0.92],
  [0.92, 1],
];

const MASTER_ROWS: { id: string; name: string; amount: string }[] = [
  { id: "mueller-1", name: "Müller GmbH", amount: "2.480 €" },
  { id: "telekom", name: "Telekom", amount: "184 €" },
  { id: "mustertechnik", name: "Mustertechnik GmbH", amount: "4.820 €" },
  { id: "buerobedarf", name: "Bürobedarf GmbH", amount: "638 €" },
  { id: "logistik", name: "Logistik Partner GmbH", amount: "3.100 €" },
  { id: "marketing", name: "Marketing GmbH", amount: "1.050 €" },
  { id: "gutschrift-buerobedarf", name: "Gutschrift – Bürobedarf GmbH", amount: "1.240 €" },
  { id: "werbeagentur", name: "Werbeagentur Nord", amount: "780 €" },
  { id: "mueller-2", name: "Müller GmbH", amount: "2.480 €" },
];

const PHASES: Phase[] = [
  {
    id: "analyse",
    markerIndex: 0,
    start: 0,
    end: 0.14,
    tone: "neutral",
    kicker: "Analyse",
    headline: "Geld geht selten auf einmal verloren.",
    copy: "Oft sind es kleine Auffälligkeiten, die zwischen tausenden Buchungen unbemerkt bleiben. Effivo schaut dort hin, wo im Alltag niemand jede Buchung einzeln prüfen kann.",
  },
  {
    id: "doppelzahlung",
    markerIndex: 1,
    start: 0.14,
    end: 0.29,
    tone: "danger",
    kicker: "Doppelzahlung",
    headline: "Eine Rechnung fällt zweimal auf.",
    copy: "Gleicher Lieferant. Gleicher Betrag. Ähnliche Rechnungsdaten.",
    highlightRowIds: ["mueller-1", "mueller-2"],
    findingLabel: "Mögliche Doppelzahlung",
    findingAmount: "2.480 €",
    reasonFields: [
      { label: "Lieferant", value: "Müller GmbH" },
      { label: "Betrag", value: "2.480 €" },
      { label: "Buchung 1", value: "03.07.2026" },
      { label: "Buchung 2", value: "05.07.2026" },
      { label: "Ähnlichkeit", value: "hoch" },
    ],
  },
  {
    id: "gutschrift",
    markerIndex: 2,
    start: 0.29,
    end: 0.44,
    tone: "warning",
    kicker: "Offene Gutschrift",
    headline: "Eine Gutschrift bleibt liegen.",
    copy: "Erfasst – aber möglicherweise nie verrechnet.",
    highlightRowIds: ["gutschrift-buerobedarf"],
    findingLabel: "Offene Gutschrift",
    findingAmount: "1.240 €",
    reasonFields: [
      { label: "Bezug", value: "Bürobedarf GmbH" },
      { label: "Erfasst am", value: "12.07.2026" },
      { label: "Verrechnung", value: "nicht erkennbar" },
    ],
  },
  {
    id: "muster",
    markerIndex: 3,
    start: 0.44,
    end: 0.59,
    tone: "purple",
    kicker: "Auffälligkeit",
    headline: "Eine einzelne Buchung wirkt ungewöhnlich.",
    copy: "Effivo zeigt Vorgänge, bei denen sich ein genauerer Blick lohnen könnte.",
    highlightRowIds: ["logistik"],
    findingLabel: "Ungewöhnliche Zahlung",
    findingAmount: "3.100 €",
    reasonFields: [
      { label: "Üblicher Rhythmus", value: "240 € – 520 €" },
      { label: "Dieser Betrag", value: "3.100 €" },
      { label: "Rechnungsbezug", value: "kein eindeutiger Bezug" },
    ],
  },
  {
    id: "zusammenhang",
    markerIndex: 4,
    start: 0.59,
    end: 0.78,
    tone: "neutral",
    kicker: "Zusammenhang",
    headline: "Einzeln unauffällig. Zusammen teuer.",
    copy: "Effivo macht sichtbar, welches finanzielle Potenzial sich hinter vielen kleinen Auffälligkeiten verbergen kann.",
  },
  {
    id: "effekt",
    markerIndex: 4,
    start: 0.78,
    end: 0.92,
    tone: "accent",
    kicker: "Potenzial",
    headline: "Aus vielen kleinen Fällen entsteht ein Gesamtbild.",
    copy: "38.421 geprüfte Buchungen, 47 erkannte Auffälligkeiten, 32 nach erster Prüfung bestätigt.",
  },
  {
    id: "kontrolle",
    markerIndex: 5,
    start: 0.92,
    end: 1,
    tone: "accent",
    kicker: "Kontrolle",
    headline: "Effivo findet. Du entscheidest.",
    copy: "Jede Auffälligkeit bleibt nachvollziehbar und kann geprüft werden.",
  },
];

const [ANALYSE_PHASE, DOPPELZAHLUNG_PHASE, GUTSCHRIFT_PHASE, MUSTER_PHASE, , EFFEKT_PHASE] = PHASES;
const FINDING_PHASES = PHASES.filter((p) => p.findingLabel);
const TALLY: { value: string; label: string }[] = [
  { value: "38.421", label: "Buchungen" },
  { value: "47", label: "Auffälligkeiten" },
  { value: "32", label: "bestätigt" },
];

// Choreografie einzelner Zeilen innerhalb ihrer jeweiligen Fund-Phase (lokaler
// Fortschritt 0..1 = Anteil am Scrollbereich DIESER Phase): erst die erste
// Buchung, kurz danach die zweite, dann ein Matching-Hinweis dazwischen. Die
// Fenster sind bewusst grosszuegig, damit ein einzelner Scroll-Impuls (Rad,
// Trackpad, Scrollbar) einen Teilschritt nicht in einem Ruck durchlaeuft.
const ROW_STAGE: Record<string, [number, number]> = {
  "mueller-1": [0, 0.26],
  "mueller-2": [0.2, 0.42],
  "gutschrift-buerobedarf": [0, 0.3],
  logistik: [0, 0.3],
};
const CONNECTION_STAGE: [number, number] = [0.36, 0.54];
const CHIP_STAGE: [number, number] = [0.5, 0.72];
const PANEL_STAGE: [number, number] = [0.68, 0.86];

const TONE_STYLES: Record<
  Tone,
  { kicker: string; glow: string; stripe: string; rowBar: string; rowBg: string; rowText: string; cssVar: string }
> = {
  danger: {
    kicker: "bg-landing-danger-subtle text-landing-danger",
    glow: "bg-landing-danger",
    stripe: "bg-gradient-to-r from-landing-danger via-landing-danger to-transparent",
    rowBar: "bg-landing-danger",
    rowBg: "bg-landing-danger-subtle",
    rowText: "text-landing-danger",
    cssVar: "--landing-danger",
  },
  warning: {
    kicker: "bg-landing-warning-subtle text-landing-warning",
    glow: "bg-landing-warning",
    stripe: "bg-gradient-to-r from-landing-warning via-landing-warning to-transparent",
    rowBar: "bg-landing-warning",
    rowBg: "bg-landing-warning-subtle",
    rowText: "text-landing-warning",
    cssVar: "--landing-warning",
  },
  purple: {
    kicker: "bg-landing-purple-subtle text-landing-purple",
    glow: "bg-landing-purple",
    stripe: "bg-gradient-to-r from-landing-purple via-landing-purple to-transparent",
    rowBar: "bg-landing-purple",
    rowBg: "bg-landing-purple-subtle",
    rowText: "text-landing-purple",
    cssVar: "--landing-purple",
  },
  accent: {
    kicker: "bg-landing-accent-subtle text-landing-accent-light",
    glow: "bg-landing-accent-light",
    stripe: "bg-gradient-to-r from-landing-accent-light via-landing-accent to-transparent",
    rowBar: "bg-landing-accent-light",
    rowBg: "bg-landing-accent-subtle",
    rowText: "text-landing-accent-light",
    cssVar: "--landing-accent-light",
  },
};

// Gesamt-Scrollstrecke der gepinnten Szene. Bewusst grosszuegig bemessen:
// jeder Choreografie-Teilschritt braucht genug Scroll-Wegstrecke, damit ein
// einzelner Scroll-Impuls ihn nicht in einem Ruck komplett durchlaeuft.
const STORY_VH = 900;
const STICKY_TOP_PX = 88;

const LIST_RANGE: [number, number] = [0, 0.59];
const ZUSAMMENHANG_RANGE: [number, number] = [0.59, 0.78];
const EFFEKT_RANGE: [number, number] = [0.78, 0.92];
const KONTROLLE_RANGE: [number, number] = [0.92, 1];
const SCENE_BAND = 0.035;
const ROW_BAND = 0.025;
const CHIP_BAND = 0.06;
const PANEL_RANGE: [number, number] = [DOPPELZAHLUNG_PHASE.start, MUSTER_PHASE.end];

// -----------------------------------------------------------------------
// Keyframe-Helfer: liefern reine [input, output]-Arrays fuer useTransform.
// Es wird bewusst NICHT mehr mit React-State/Prozentwerten pro Renderzyklus
// gerechnet - jede sichtbare Eigenschaft wird direkt als MotionValue aus
// scrollYProgress abgeleitet und von Framer Motion ausserhalb des React-
// Renderzyklus auf das DOM geschrieben (kein Re-Render pro Scroll-Frame).
// -----------------------------------------------------------------------

// Symmetrisches Auf-/Abblenden um [start,end] - fuer Szenen-Crossfades und
// die Kopf-Akzentfarbe. Am offenen Rand (Start der ersten / Ende der
// letzten Phase) wird nicht ausgeblendet, da davor/danach nichts folgt.
function bandKeyframes(start: number, end: number, band: number): [number[], number[]] {
  const half = band / 2;
  const xs: number[] = [];
  const ys: number[] = [];
  if (start <= 0) {
    xs.push(0);
    ys.push(1);
  } else {
    xs.push(Math.max(0, start - half), start + half);
    ys.push(0, 1);
  }
  if (end >= 1) {
    xs.push(1);
    ys.push(1);
  } else {
    xs.push(end - half, Math.min(1, end + half));
    ys.push(1, 0);
  }
  return [xs, ys];
}

// Choreografierter Teilschritt innerhalb einer Phase: steigt weich im
// lokalen Fenster [riseFromLocal, riseToLocal] und blendet symmetrisch am
// Phasenende wieder aus (Fokus wandert zur naechsten Phase).
function phaseStageKeyframes(
  phase: Phase,
  riseFromLocal: number,
  riseToLocal: number,
  fadeBand: number
): [number[], number[]] {
  const width = phase.end - phase.start;
  const riseFrom = phase.start + riseFromLocal * width;
  const riseTo = phase.start + riseToLocal * width;
  if (phase.end >= 1) return [[riseFrom, riseTo], [0, 1]];
  const half = fadeBand / 2;
  return [
    [riseFrom, riseTo, phase.end - half, Math.min(1, phase.end + half)],
    [0, 1, 1, 0],
  ];
}

// Nur ansteigend, kein Ausblenden - fuer Funde, die als Chip bestehen
// bleiben, sobald sie einmal erreicht wurden.
function riseKeyframes(phase: Phase, riseFromLocal: number, riseToLocal: number): [number[], number[]] {
  const width = phase.end - phase.start;
  return [[phase.start + riseFromLocal * width, phase.start + riseToLocal * width], [0, 1]];
}

function resolvePhaseIndex(progress: number): number {
  for (let i = 0; i < PHASES.length; i++) {
    if (progress < PHASES[i].end || i === PHASES.length - 1) return i;
  }
  return PHASES.length - 1;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    function handleChange(e: MediaQueryListEvent) {
      setReduced(e.matches);
    }
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);
  return reduced;
}

// Zentrale Produktgeschichte der Startseite: EINE grosse gepinnte Section.
// scrollYProgress (0..1, aus useScroll) ist die einzige Quelle der Wahrheit;
// jede sichtbare Eigenschaft der Produktbuehne wird per useTransform direkt
// daraus abgeleitet und als MotionValue an motion.*-Elemente gebunden -
// Framer Motion schreibt diese Werte bei jedem Scroll-Frame unabhaengig vom
// React-Renderzyklus direkt ins DOM (kein setState, kein Re-Render pro
// Pixel). React-State wird nur fuer echte Inhalts-/Accessibility-Zwecke
// verwendet (Screenreader-Ansage der aktuellen Phase) und aktualisiert sich
// nur bei tatsaechlichem Phasenwechsel, nicht pro Scroll-Event. Auf Mobile
// und bei reduzierter Bewegung wird eine statische, nicht gepinnte Liste
// aller Phasen gerendert.
export function LeakScrollytelling() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const [announcedPhase, setAnnouncedPhase] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = resolvePhaseIndex(latest);
    setAnnouncedPhase((prev) => (prev === next ? prev : next));
  });

  return (
    <section id="geldlecks" className="relative bg-landing-bg-alt">
      {prefersReducedMotion ? (
        <div className="py-20 sm:py-28">
          <StaticStory />
        </div>
      ) : (
        <>
          <div ref={sectionRef} className="relative hidden lg:block" style={{ height: `${STORY_VH}vh` }}>
            <div className="sticky" style={{ top: STICKY_TOP_PX, height: `calc(100vh - ${STICKY_TOP_PX}px)` }}>
              <div className="relative flex h-full items-center">
                <AmbientLayer scrollYProgress={scrollYProgress} />
                <div className="relative mx-auto grid w-full max-w-6xl grid-cols-[1.5rem_0.42fr_0.56fr] items-center gap-x-8 px-4 sm:px-6">
                  <StoryRail scrollYProgress={scrollYProgress} />
                  <PhaseTextStack scrollYProgress={scrollYProgress} />
                  <ProductStage scrollYProgress={scrollYProgress} />
                </div>
              </div>
            </div>
            <span className="sr-only" aria-live="polite">
              {PHASES[announcedPhase].kicker}: {PHASES[announcedPhase].headline}
            </span>
          </div>
          <div className="py-20 lg:hidden">
            <StaticStory />
          </div>
        </>
      )}
    </section>
  );
}

function AmbientLayer({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [problemIn, problemOut] = bandKeyframes(DOPPELZAHLUNG_PHASE.start, MUSTER_PHASE.end, 0.08);
  const problemGlow = useTransform(scrollYProgress, problemIn, problemOut);
  const [effektIn, effektOut] = bandKeyframes(EFFEKT_RANGE[0], EFFEKT_RANGE[1], SCENE_BAND);
  const effektGlow = useTransform(scrollYProgress, effektIn, effektOut);
  const [kontrolleIn, kontrolleOut] = bandKeyframes(KONTROLLE_RANGE[0], KONTROLLE_RANGE[1], SCENE_BAND);
  const kontrolleGlow = useTransform(scrollYProgress, kontrolleIn, kontrolleOut);
  const problemOpacity = useTransform(problemGlow, (v) => v * 0.08);
  const resultOpacity = useTransform(() => 0.03 + Math.max(effektGlow.get(), kontrolleGlow.get() * 0.7) * 0.11);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-landing-danger blur-[120px]"
        style={{ opacity: problemOpacity }}
      />
      <motion.div
        className="absolute -left-24 bottom-1/4 h-[26rem] w-[26rem] rounded-full bg-landing-accent-light blur-[120px]"
        style={{ opacity: resultOpacity }}
      />
      <div className="absolute inset-0 opacity-0 [background-image:radial-gradient(rgba(25,198,193,0.5)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:opacity-[0.06]" />
    </div>
  );
}

function StoryRail({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  return (
    <div className="relative hidden h-full flex-col items-center justify-center gap-6 lg:flex">
      <span aria-hidden className="absolute inset-y-2 w-px bg-landing-border" />
      {MARKERS.map((label, i) => (
        <RailDot key={label} label={label} range={MARKER_RANGES[i]} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function RailDot({
  label,
  range,
  scrollYProgress,
}: {
  label: string;
  range: [number, number];
  scrollYProgress: MotionValue<number>;
}) {
  const [input, output] = bandKeyframes(range[0], range[1], 0.04);
  const weight = useTransform(scrollYProgress, input, output);
  const scale = useTransform(weight, (w) => 0.55 + 0.45 * w);
  return (
    <motion.span
      title={label}
      className="relative h-3 w-3 shrink-0 rounded-full border border-landing-border bg-landing-bg-alt"
      style={{ scale }}
    >
      <motion.span aria-hidden className="absolute inset-0 rounded-full bg-landing-accent-light" style={{ opacity: weight }} />
    </motion.span>
  );
}

// Alle sieben Story-Texte liegen uebereinander gestapelt (CSS-Grid-Overlap)
// und blenden rein ueber ihre eigene, aus scrollYProgress abgeleitete
// Opacity ein/aus - kein Timer, kein setTimeout-Crossfade.
function PhaseTextStack({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  return (
    <div className="relative grid max-w-md grid-cols-1">
      {PHASES.map((phase) => (
        <PhaseTextBlock key={phase.id} phase={phase} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function PhaseTextBlock({ phase, scrollYProgress }: { phase: Phase; scrollYProgress: MotionValue<number> }) {
  const [input, output] = bandKeyframes(phase.start, phase.end, 0.03);
  const weight = useTransform(scrollYProgress, input, output);
  const y = useTransform(weight, (w) => (1 - w) * 8);
  const kickerClass = phase.tone === "neutral" ? "bg-landing-bg-alt text-landing-text-muted" : TONE_STYLES[phase.tone].kicker;
  return (
    <motion.div className="col-start-1 row-start-1" style={{ opacity: weight, y }}>
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${kickerClass}`}>
        {phase.kicker}
      </span>
      <h3 className="mt-4 font-display text-2xl font-bold text-landing-text-primary sm:text-3xl lg:text-4xl">{phase.headline}</h3>
      <p className="mt-4 text-landing-text-secondary">{phase.copy}</p>
    </motion.div>
  );
}

function TallyStrip({ scrollYProgress, sceneStart }: { scrollYProgress: MotionValue<number>; sceneStart: number }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      {TALLY.map((t, i) => (
        <TallyItem key={t.label} value={t.value} label={t.label} start={sceneStart + i * 0.02} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function TallyItem({
  value,
  label,
  start,
  scrollYProgress,
}: {
  value: string;
  label: string;
  start: number;
  scrollYProgress: MotionValue<number>;
}) {
  const weight = useTransform(scrollYProgress, [start, start + 0.08], [0, 1]);
  const y = useTransform(weight, (w) => (1 - w) * 6);
  return (
    <motion.div className="flex flex-col items-center gap-1.5" style={{ opacity: weight, y }}>
      <p className="font-display text-base font-extrabold tabular-nums text-landing-text-primary">{value}</p>
      <p className="text-[11px] text-landing-text-secondary">{label}</p>
    </motion.div>
  );
}

// Die Produktbuehne: EINE Kartenh uelle. Alle vier "Szenen" liegen
// uebereinander in derselben Grid-Zelle und ihre Deckkraft folgt direkt
// scrollYProgress - keine Montage/Demontage anhand von React-State.
function ProductStage({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [listIn, listOut] = bandKeyframes(LIST_RANGE[0], LIST_RANGE[1], SCENE_BAND);
  const listWeight = useTransform(scrollYProgress, listIn, listOut);
  const [zIn, zOut] = bandKeyframes(ZUSAMMENHANG_RANGE[0], ZUSAMMENHANG_RANGE[1], SCENE_BAND);
  const zusammenhangWeight = useTransform(scrollYProgress, zIn, zOut);
  const [eIn, eOut] = bandKeyframes(EFFEKT_RANGE[0], EFFEKT_RANGE[1], SCENE_BAND);
  const effektWeight = useTransform(scrollYProgress, eIn, eOut);
  const [kIn, kOut] = bandKeyframes(KONTROLLE_RANGE[0], KONTROLLE_RANGE[1], SCENE_BAND);
  const kontrolleWeight = useTransform(scrollYProgress, kIn, kOut);

  const [dIn, dOut] = bandKeyframes(DOPPELZAHLUNG_PHASE.start, DOPPELZAHLUNG_PHASE.end, ROW_BAND);
  const dangerWeight = useTransform(scrollYProgress, dIn, dOut);
  const [gIn, gOut] = bandKeyframes(GUTSCHRIFT_PHASE.start, GUTSCHRIFT_PHASE.end, ROW_BAND);
  const warningWeight = useTransform(scrollYProgress, gIn, gOut);
  const [mIn, mOut] = bandKeyframes(MUSTER_PHASE.start, MUSTER_PHASE.end, ROW_BAND);
  const purpleWeight = useTransform(scrollYProgress, mIn, mOut);
  const [aIn, aOut] = bandKeyframes(0, ANALYSE_PHASE.end, ROW_BAND);
  const analyseWeight = useTransform(scrollYProgress, aIn, aOut);
  const accentWeight = useTransform(() => Math.max(analyseWeight.get(), zusammenhangWeight.get(), effektWeight.get(), kontrolleWeight.get()));

  const zusammenhangY = useTransform(zusammenhangWeight, (w) => (1 - w) * 10);
  const effektY = useTransform(effektWeight, (w) => (1 - w) * 10);
  const kontrolleY = useTransform(kontrolleWeight, (w) => (1 - w) * 10);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40">
      <ToneGlow tone="danger" weight={dangerWeight} />
      <ToneGlow tone="warning" weight={warningWeight} />
      <ToneGlow tone="purple" weight={purpleWeight} />
      <ToneGlow tone="accent" weight={accentWeight} />
      <div className="relative h-1 w-full">
        <ToneStripe tone="danger" weight={dangerWeight} />
        <ToneStripe tone="warning" weight={warningWeight} />
        <ToneStripe tone="purple" weight={purpleWeight} />
        <ToneStripe tone="accent" weight={accentWeight} />
      </div>

      <div className="relative flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-landing-bg-alt text-landing-text-muted">
            <SearchIcon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-landing-text-muted">Effivo Analyse</span>
        </div>
        <span className="text-xs font-medium text-landing-text-muted">Juli 2026</span>
      </div>

      <div className="relative grid grid-cols-1">
        <motion.div className="col-start-1 row-start-1" style={{ opacity: listWeight }}>
          <ListScene scrollYProgress={scrollYProgress} listWeight={listWeight} />
        </motion.div>

        <motion.div className="col-start-1 row-start-1 px-7 py-8" style={{ opacity: zusammenhangWeight, y: zusammenhangY }}>
          <div className="flex flex-wrap gap-3">
            {FINDING_PHASES.map((f, i) => (
              <ZusammenhangTile key={f.id} phase={f} start={ZUSAMMENHANG_RANGE[0] + i * 0.025} scrollYProgress={scrollYProgress} />
            ))}
          </div>
          <div className="mt-6 border-t border-landing-border pt-6">
            <TallyStrip scrollYProgress={scrollYProgress} sceneStart={ZUSAMMENHANG_RANGE[0] + 0.06} />
          </div>
        </motion.div>

        <motion.div className="col-start-1 row-start-1 px-7 py-8" style={{ opacity: effektWeight, y: effektY }}>
          <EffektScene scrollYProgress={scrollYProgress} />
        </motion.div>

        <motion.div className="col-start-1 row-start-1 px-7 py-8" style={{ opacity: kontrolleWeight, y: kontrolleY }}>
          <div className="border-b border-landing-border pb-6 opacity-80">
            <TallyStrip scrollYProgress={scrollYProgress} sceneStart={KONTROLLE_RANGE[0] - 0.06} />
          </div>
          <div className="mt-6 rounded-2xl border border-landing-border bg-landing-bg-alt p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-landing-text-primary">Müller GmbH</p>
                <p className="text-xs text-landing-text-muted">Mögliche Doppelzahlung</p>
              </div>
              <p className="font-display text-lg font-bold tabular-nums text-landing-danger">2.480 €</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-border px-3 py-1.5 text-xs font-semibold text-landing-text-secondary">
                <EyeIcon className="h-3.5 w-3.5" />
                Details ansehen
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-landing-accent px-3 py-1.5 text-xs font-semibold text-white">
                <CheckIcon className="h-3.5 w-3.5" />
                Bestätigen
              </span>
              <span className="inline-flex items-center rounded-full border border-landing-border px-3 py-1.5 text-xs font-semibold text-landing-text-secondary">
                Kein Problem
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ToneGlow({ tone, weight }: { tone: Tone; weight: MotionValue<number> }) {
  const opacity = useTransform(weight, (w) => w * 0.1);
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl ${TONE_STYLES[tone].glow}`}
      style={{ opacity }}
    />
  );
}

function ToneStripe({ tone, weight }: { tone: Tone; weight: MotionValue<number> }) {
  return <motion.div aria-hidden className={`absolute inset-0 ${TONE_STYLES[tone].stripe}`} style={{ opacity: weight }} />;
}

function ZusammenhangTile({
  phase,
  start,
  scrollYProgress,
}: {
  phase: Phase;
  start: number;
  scrollYProgress: MotionValue<number>;
}) {
  const t = TONE_STYLES[phase.tone as Tone];
  const weight = useTransform(scrollYProgress, [start, start + 0.09], [0, 1]);
  const y = useTransform(weight, (w) => (1 - w) * 8);
  const scale = useTransform(weight, (w) => 0.94 + 0.06 * w);
  return (
    <motion.div className={`min-w-[9rem] flex-1 rounded-2xl border border-landing-border p-4 ${t.rowBg}`} style={{ opacity: weight, y, scale }}>
      <p className={`text-xs font-semibold ${t.rowText}`}>{phase.kicker}</p>
      <p className="mt-1 font-display text-lg font-bold tabular-nums text-landing-text-primary">{phase.findingAmount}</p>
    </motion.div>
  );
}

function EffektScene({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [surfaceIn, surfaceOut] = riseKeyframes(EFFEKT_PHASE, 0, 0.28);
  const surfaceW = useTransform(scrollYProgress, surfaceIn, surfaceOut);
  const [numberIn, numberOut] = riseKeyframes(EFFEKT_PHASE, 0.28, 0.54);
  const numberW = useTransform(scrollYProgress, numberIn, numberOut);
  const [labelIn, labelOut] = riseKeyframes(EFFEKT_PHASE, 0.5, 0.78);
  const labelW = useTransform(scrollYProgress, labelIn, labelOut);

  const tallyOpacity = useTransform(surfaceW, (w) => 0.5 + 0.5 * w);
  const surfaceScale = useTransform(surfaceW, (w) => 0.9 + 0.1 * w);
  const numberY = useTransform(numberW, (w) => (1 - w) * 6);

  return (
    <>
      <motion.div style={{ opacity: tallyOpacity }}>
        <TallyStrip scrollYProgress={scrollYProgress} sceneStart={EFFEKT_RANGE[0] - 0.04} />
      </motion.div>
      <motion.div
        className="relative mt-6 overflow-hidden rounded-2xl border border-landing-accent-light/40 bg-gradient-to-br from-landing-accent-subtle to-landing-bg-alt p-7 text-center"
        style={{ opacity: surfaceW, scale: surfaceScale }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-landing-accent-light/20" />
        <motion.span className="relative mx-auto block h-6 w-6" style={{ opacity: numberW }}>
          <TargetIcon className="h-6 w-6 text-landing-accent-light" />
        </motion.span>
        <motion.p
          className="relative mt-2 font-display text-4xl font-extrabold text-landing-accent-light"
          style={{ opacity: numberW, y: numberY }}
        >
          18.740 €
        </motion.p>
        <motion.p className="relative mt-1 text-sm font-semibold text-landing-text-secondary" style={{ opacity: labelW }}>
          Potenzieller finanzieller Effekt
        </motion.p>
      </motion.div>
    </>
  );
}

// Die "Analyse"-Szene deckt Analyse/Doppelzahlung/Gutschrift/Auffaelligkeit
// als EINE zusammenhaengende Ansicht ab: dieselbe Buchungsliste bleibt
// immer im DOM, nur ihre Zeilen-Hervorhebung, Fund-Chips und das
// Transparenzpanel aendern kontinuierlich ihre Deckkraft.
function ListScene({
  scrollYProgress,
  listWeight,
}: {
  scrollYProgress: MotionValue<number>;
  listWeight: MotionValue<number>;
}) {
  const counterOpacity = useTransform(
    scrollYProgress,
    [DOPPELZAHLUNG_PHASE.start - CHIP_BAND / 2, DOPPELZAHLUNG_PHASE.start + CHIP_BAND / 2],
    [0, 1]
  );
  // Stufenfunktion (keine lineare Rampe): der Zaehler soll bei 1/2/3 stehen
  // bleiben statt zwischen den Werten durchzuinterpolieren.
  const foundCountMV = useTransform(
    scrollYProgress,
    [
      DOPPELZAHLUNG_PHASE.start,
      GUTSCHRIFT_PHASE.start - 0.0001,
      GUTSCHRIFT_PHASE.start,
      MUSTER_PHASE.start - 0.0001,
      MUSTER_PHASE.start,
      1,
    ],
    [1, 1, 2, 2, 3, 3]
  );
  const [foundCount, setFoundCount] = useState(0);
  useMotionValueEvent(foundCountMV, "change", (latest) => {
    const rounded = Math.max(0, Math.round(latest));
    setFoundCount((prev) => (prev === rounded ? prev : rounded));
  });

  const [panelIn, panelOut] = bandKeyframes(PANEL_RANGE[0], PANEL_RANGE[1], SCENE_BAND);
  const panelOuterWeight = useTransform(scrollYProgress, panelIn, panelOut);
  const groupScale = useTransform(listWeight, (w) => 1 - (1 - w) * 0.05);
  const groupY = useTransform(listWeight, (w) => -(1 - w) * 5);

  return (
    <>
      <motion.div className="relative flex flex-wrap items-center gap-2 px-7 pb-4" style={{ scale: groupScale, y: groupY }}>
        {FINDING_PHASES.map((f) => (
          <FindingChip key={f.id} phase={f} scrollYProgress={scrollYProgress} />
        ))}
        <motion.span className="text-[11px] font-medium text-landing-text-muted" style={{ opacity: counterOpacity }}>
          {foundCount || 1} {foundCount === 1 ? "Auffälligkeit" : "Auffälligkeiten"} erkannt
        </motion.span>
      </motion.div>

      <ul className="relative divide-y divide-landing-border">
        {MASTER_ROWS.map((row) => (
          <BookingRow key={row.id} row={row} scrollYProgress={scrollYProgress} />
        ))}
      </ul>

      <motion.div className="relative border-t border-landing-border bg-landing-bg-alt px-7 py-5" style={{ opacity: panelOuterWeight }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-landing-text-muted">Warum auffällig?</p>
        <div className="relative mt-3 grid grid-cols-1">
          {FINDING_PHASES.map((f) => (
            <ReasonBlock key={f.id} phase={f} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </motion.div>
    </>
  );
}

function FindingChip({ phase, scrollYProgress }: { phase: Phase; scrollYProgress: MotionValue<number> }) {
  const t = TONE_STYLES[phase.tone as Tone];
  const focusStage = ROW_STAGE[phase.highlightRowIds![phase.highlightRowIds!.length - 1]];
  const [riseIn, riseOut] = riseKeyframes(phase, CHIP_STAGE[0], CHIP_STAGE[1]);
  const rise = useTransform(scrollYProgress, riseIn, riseOut);
  const [focusIn, focusOut] = phaseStageKeyframes(phase, focusStage[0], focusStage[1], ROW_BAND);
  const focus = useTransform(scrollYProgress, focusIn, focusOut);
  const opacity = useTransform(() => rise.get() * (0.6 + 0.4 * focus.get()));
  const scale = useTransform(focus, (f) => 0.86 + 0.14 * f);
  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${t.kicker}`}
      style={{ opacity, scale }}
    >
      {phase.findingLabel}
      <span className="tabular-nums">{phase.findingAmount}</span>
    </motion.span>
  );
}

function BookingRow({
  row,
  scrollYProgress,
}: {
  row: { id: string; name: string; amount: string };
  scrollYProgress: MotionValue<number>;
}) {
  const owner = FINDING_PHASES.find((p) => p.highlightRowIds?.includes(row.id));
  const stage = owner ? ROW_STAGE[row.id] : undefined;
  const [wIn, wOut] = owner && stage ? phaseStageKeyframes(owner, stage[0], stage[1], ROW_BAND) : [[0, 1], [0, 0]];
  const weight = useTransform(scrollYProgress, wIn, wOut);
  const t = owner ? TONE_STYLES[owner.tone as Tone] : null;

  const isConnectionRow = owner?.id === "doppelzahlung" && row.id === "mueller-2";
  const [cIn, cOut] = isConnectionRow && owner
    ? phaseStageKeyframes(owner, CONNECTION_STAGE[0], CONNECTION_STAGE[1], ROW_BAND)
    : [[0, 1], [0, 0]];
  const connectionWeight = useTransform(scrollYProgress, cIn, cOut);
  const connectionScale = useTransform(connectionWeight, (w) => 0.85 + 0.15 * w);

  return (
    <li className="relative flex items-center justify-between px-7 py-3.5">
      {t && (
        <>
          <motion.span aria-hidden className={`absolute inset-0 ${t.rowBg}`} style={{ opacity: weight }} />
          <motion.span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${t.rowBar}`} style={{ opacity: weight }} />
        </>
      )}
      <span className="relative inline-grid">
        <span className="col-start-1 row-start-1 text-sm text-landing-text-secondary">{row.name}</span>
        <motion.span className="col-start-1 row-start-1 text-sm font-semibold text-landing-text-primary" style={{ opacity: weight }}>
          {row.name}
        </motion.span>
      </span>
      <span className="relative flex items-center gap-2">
        {isConnectionRow && (
          <motion.span
            className="rounded-full border border-landing-danger/40 bg-landing-danger-subtle px-1.5 py-0.5 text-[10px] font-semibold text-landing-danger"
            style={{ opacity: connectionWeight, scale: connectionScale }}
          >
            ≈ Buchung 1
          </motion.span>
        )}
        <span className="relative inline-grid">
          <span className="col-start-1 row-start-1 text-sm font-semibold tabular-nums text-landing-text-secondary">{row.amount}</span>
          {t && (
            <motion.span
              className="col-start-1 row-start-1 text-sm font-semibold tabular-nums"
              style={{ opacity: weight, color: `var(${t.cssVar})` }}
            >
              {row.amount}
            </motion.span>
          )}
        </span>
      </span>
    </li>
  );
}

function ReasonBlock({ phase, scrollYProgress }: { phase: Phase; scrollYProgress: MotionValue<number> }) {
  const [input, output] = phaseStageKeyframes(phase, PANEL_STAGE[0], PANEL_STAGE[1], ROW_BAND);
  const weight = useTransform(scrollYProgress, input, output);
  const y = useTransform(weight, (w) => (1 - w) * 4);
  if (!phase.reasonFields) return null;
  return (
    <motion.dl className="col-start-1 row-start-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm" style={{ opacity: weight, y }}>
      {phase.reasonFields.map((field) => (
        <div key={field.label} className="flex items-center justify-between gap-2">
          <dt className="text-landing-text-muted">{field.label}</dt>
          <dd className="text-right font-medium text-landing-text-primary">{field.value}</dd>
        </div>
      ))}
    </motion.dl>
  );
}

// Kompakte, nicht gepinnte vertikale Fassung der Story - fuer Mobile und fuer
// "prefers-reduced-motion": keine scrollgekoppelten Transformationen, jede
// Phase sofort voll sichtbar und direkt lesbar untereinander.
function StaticStory() {
  return (
    <div className="mx-auto max-w-2xl space-y-14 px-4 sm:px-6">
      {PHASES.map((phase, i) => (
        <div key={phase.id}>
          <StaticPhaseText phase={phase} />
          <div className="mt-6">
            <StaticProductStage phase={phase} phaseIndex={i} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StaticPhaseText({ phase }: { phase: Phase }) {
  const kickerClass = phase.tone === "neutral" ? "bg-landing-bg-alt text-landing-text-muted" : TONE_STYLES[phase.tone].kicker;
  return (
    <div className="max-w-md">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${kickerClass}`}>
        {phase.kicker}
      </span>
      <h3 className="mt-4 font-display text-2xl font-bold text-landing-text-primary sm:text-3xl lg:text-4xl">{phase.headline}</h3>
      <p className="mt-4 text-landing-text-secondary">{phase.copy}</p>
    </div>
  );
}

function StaticProductStage({ phase, phaseIndex }: { phase: Phase; phaseIndex: number }) {
  const tone = phase.tone !== "neutral" ? TONE_STYLES[phase.tone] : null;
  const isListPhase = phaseIndex <= 3;
  const foundFindings = FINDING_PHASES.filter((f) => PHASES.indexOf(f) <= phaseIndex);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40">
      <div className={`h-1 w-full bg-gradient-to-r ${tone ? tone.stripe : "from-landing-border via-landing-border to-transparent"}`} />
      <div className="relative flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-landing-bg-alt text-landing-text-muted">
            <SearchIcon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-landing-text-muted">Effivo Analyse</span>
        </div>
        <span className="text-xs font-medium text-landing-text-muted">Juli 2026</span>
      </div>

      {isListPhase && (
        <>
          {foundFindings.length > 0 && (
            <div className="relative flex flex-wrap gap-2 px-7 pb-4">
              {foundFindings.map((f) => {
                const t = TONE_STYLES[f.tone as Tone];
                return (
                  <span key={f.id} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${t.kicker}`}>
                    {f.findingLabel}
                    <span className="tabular-nums">{f.findingAmount}</span>
                  </span>
                );
              })}
            </div>
          )}
          <ul className="relative divide-y divide-landing-border">
            {MASTER_ROWS.map((row) => {
              const owner = FINDING_PHASES.find((p) => p.highlightRowIds?.includes(row.id));
              const highlighted = owner?.id === phase.id;
              const t = highlighted && owner ? TONE_STYLES[owner.tone as Tone] : null;
              return (
                <li key={row.id} className={`relative flex items-center justify-between px-7 py-3.5 ${t ? t.rowBg : ""}`}>
                  {t && <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${t.rowBar}`} />}
                  <span className={`text-sm ${highlighted ? "font-semibold text-landing-text-primary" : "text-landing-text-secondary"}`}>
                    {row.name}
                  </span>
                  <span className={`text-sm font-semibold tabular-nums ${t ? t.rowText : "text-landing-text-secondary"}`}>{row.amount}</span>
                </li>
              );
            })}
          </ul>
          {phase.reasonFields && (
            <div className="relative border-t border-landing-border bg-landing-bg-alt px-7 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-landing-text-muted">Warum auffällig?</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {phase.reasonFields.map((field) => (
                  <div key={field.label} className="flex items-center justify-between gap-2">
                    <dt className="text-landing-text-muted">{field.label}</dt>
                    <dd className="text-right font-medium text-landing-text-primary">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </>
      )}

      {phase.id === "zusammenhang" && (
        <div className="relative px-7 py-8">
          <div className="flex flex-wrap gap-3">
            {FINDING_PHASES.map((f) => {
              const t = TONE_STYLES[f.tone as Tone];
              return (
                <div key={f.id} className={`min-w-[9rem] flex-1 rounded-2xl border border-landing-border p-4 ${t.rowBg}`}>
                  <p className={`text-xs font-semibold ${t.rowText}`}>{f.kicker}</p>
                  <p className="mt-1 font-display text-lg font-bold tabular-nums text-landing-text-primary">{f.findingAmount}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-landing-border pt-6 text-center">
            {TALLY.map((t) => (
              <div key={t.label}>
                <p className="font-display text-base font-extrabold tabular-nums text-landing-text-primary">{t.value}</p>
                <p className="text-[11px] text-landing-text-secondary">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase.id === "effekt" && (
        <div className="relative px-7 py-8">
          <div className="grid grid-cols-3 gap-3 text-center">
            {TALLY.map((t) => (
              <div key={t.label}>
                <p className="font-display text-base font-extrabold tabular-nums text-landing-text-primary">{t.value}</p>
                <p className="text-[11px] text-landing-text-secondary">{t.label}</p>
              </div>
            ))}
          </div>
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-landing-accent-light/40 bg-gradient-to-br from-landing-accent-subtle to-landing-bg-alt p-7 text-center">
            <TargetIcon className="relative mx-auto h-6 w-6 text-landing-accent-light" />
            <p className="relative mt-2 font-display text-4xl font-extrabold text-landing-accent-light">18.740 €</p>
            <p className="relative mt-1 text-sm font-semibold text-landing-text-secondary">Potenzieller finanzieller Effekt</p>
          </div>
        </div>
      )}

      {phase.id === "kontrolle" && (
        <div className="relative px-7 py-8">
          <div className="grid grid-cols-3 gap-3 border-b border-landing-border pb-6 text-center opacity-80">
            {TALLY.map((t) => (
              <div key={t.label}>
                <p className="font-display text-base font-extrabold tabular-nums text-landing-text-primary">{t.value}</p>
                <p className="text-[11px] text-landing-text-secondary">{t.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-landing-border bg-landing-bg-alt p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-landing-text-primary">Müller GmbH</p>
                <p className="text-xs text-landing-text-muted">Mögliche Doppelzahlung</p>
              </div>
              <p className="font-display text-lg font-bold tabular-nums text-landing-danger">2.480 €</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-landing-border px-3 py-1.5 text-xs font-semibold text-landing-text-secondary">
                <EyeIcon className="h-3.5 w-3.5" />
                Details ansehen
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-landing-accent px-3 py-1.5 text-xs font-semibold text-white">
                <CheckIcon className="h-3.5 w-3.5" />
                Bestätigen
              </span>
              <span className="inline-flex items-center rounded-full border border-landing-border px-3 py-1.5 text-xs font-semibold text-landing-text-secondary">
                Kein Problem
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
