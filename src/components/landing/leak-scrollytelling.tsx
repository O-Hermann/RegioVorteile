"use client";

import { useEffect, useRef, useState } from "react";
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

// Eine durchgehende Buchungsliste, die ueber alle Analyse-Phasen sichtbar
// bleibt - nur welche Zeile hervorgehoben ist, aendert sich weich mit dem
// Scrollfortschritt.
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

const FINDING_PHASES = PHASES.filter((p) => p.findingLabel);
const TALLY: { value: string; label: string }[] = [
  { value: "38.421", label: "Buchungen" },
  { value: "47", label: "Auffälligkeiten" },
  { value: "32", label: "bestätigt" },
];

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

// Gesamt-Scrollstrecke der gepinnten Story (500-650vh Zielbereich).
const STORY_VH = 560;
// Hoehe des fixen Landing-Headers (h-16 = 64px) + dezenter Abstand.
const STICKY_TOP_PX = 88;
// Zeitfenster fuer den Text-Crossfade (Headline/Copy muss diskret wechseln,
// bekommt dafuer aber ein weiches Aus-/Einblenden statt eines harten Schnitts).
const TEXT_CROSSFADE_MS = 200;

// Szenen- und Uebergangs-Bandbreiten (Anteil am Gesamtfortschritt). Innerhalb
// jeder Phase bleibt der grosse mittlere Bereich stabil ("Ruhephase"), nur an
// den Raendern wird ueber die Bandbreite weich ein-/ausgeblendet.
const LIST_RANGE: [number, number] = [0, 0.59];
const ZUSAMMENHANG_RANGE: [number, number] = [0.59, 0.78];
const EFFEKT_RANGE: [number, number] = [0.78, 0.92];
const KONTROLLE_RANGE: [number, number] = [0.92, 1];
const SCENE_BAND = 0.045;
const ROW_BAND = 0.05;
const CHIP_BAND = 0.06;
const PANEL_RANGE: [number, number] = [PHASES[1].start, PHASES[3].end];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

// Weiches Aktivierungsgewicht 0..1: haelt sich innerhalb [start,end] bei 1 und
// blendet symmetrisch um die Raender ueber `band` weich ein/aus - so entsteht
// eine Ruhephase in der Mitte jeder Phase statt eines harten Zustandswechsels
// genau an der Scrollgrenze. Die allererste bzw. allerletzte Phase blendet an
// ihrem offenen Ende gar nicht (nichts davor/danach).
function bandWeight(progress: number, start: number, end: number, band: number): number {
  const half = band / 2;
  const inW = start <= 0 ? 1 : smoothstep((progress - (start - half)) / band);
  const outW = end >= 1 ? 1 : 1 - smoothstep((progress - (end - half)) / band);
  return Math.max(0, Math.min(inW, outW));
}

// Nur ansteigende Blende (bleibt danach aktiv) - fuer Funde, die als Chip
// bestehen bleiben, sobald sie einmal erreicht wurden.
function riseWeight(progress: number, at: number, band: number): number {
  return smoothstep((progress - (at - band / 2)) / band);
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

// Zentrale Produktgeschichte der Startseite: EINE grosse gepinnte Section,
// deren Scrollfortschritt (0..1) ueber die tatsaechliche Position der Section
// im Dokument berechnet wird. Alle visuellen Zustaende der Produktbuehne
// (Zeilen-Highlights, Fund-Chips, Transparenzpanel, Szenenwechsel, Ambient-
// Glow, Rail) werden als STETIGE Funktionen dieses einen Fortschrittswerts
// berechnet (bandWeight/riseWeight), nicht als diskrete An/Aus-Zustaende -
// dadurch entwickelt sich die Buehne beim Scrollen weich statt zu springen.
// Nur der Story-Text (Headline/Copy) muss inhaltlich diskret wechseln; dafuer
// gibt es einen kurzen, im Scroll-Callback ausgeloesten Crossfade. Auf Mobile
// und bei reduzierter Bewegung wird eine statische, nicht gepinnte Liste
// aller Phasen gerendert (dort immer voll sichtbar, ohne Scroll-Kopplung).
export function LeakScrollytelling() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [displayPhaseIndex, setDisplayPhaseIndex] = useState(0);
  const [textFading, setTextFading] = useState(false);
  const progressRef = useRef(0);
  const displayPhaseRef = useRef(0);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const desktopMq = window.matchMedia("(min-width: 1024px)");
    let frame = 0;

    function evaluate() {
      frame = 0;
      if (!desktopMq.matches) return;
      const rect = section!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const raw = total > 0 ? -rect.top / total : 0;
      const clamped = clamp01(raw);
      if (Math.abs(clamped - progressRef.current) < 0.0012) return;
      progressRef.current = clamped;
      setProgress(clamped);

      const nextPhase = resolvePhaseIndex(clamped);
      if (nextPhase !== displayPhaseRef.current && !fadeTimeoutRef.current) {
        setTextFading(true);
        fadeTimeoutRef.current = setTimeout(() => {
          const latest = resolvePhaseIndex(progressRef.current);
          displayPhaseRef.current = latest;
          setDisplayPhaseIndex(latest);
          setTextFading(false);
          fadeTimeoutRef.current = null;
        }, TEXT_CROSSFADE_MS);
      }
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(evaluate);
    }

    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    desktopMq.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktopMq.removeEventListener("change", onScroll);
      if (frame) cancelAnimationFrame(frame);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [prefersReducedMotion]);

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
                <AmbientLayer progress={progress} />
                <div className="relative mx-auto grid w-full max-w-6xl grid-cols-[1.5rem_0.42fr_0.56fr] items-center gap-x-8 px-4 sm:px-6">
                  <StoryRail progress={progress} />
                  <PhaseText phaseIndex={displayPhaseIndex} fading={textFading} />
                  <ProductStage progress={progress} reveal={false} />
                </div>
              </div>
            </div>
          </div>
          <div className="py-20 lg:hidden">
            <StaticStory />
          </div>
        </>
      )}
    </section>
  );
}

function AmbientLayer({ progress }: { progress: number }) {
  const problemGlow = bandWeight(progress, PHASES[1].start, PHASES[3].end, 0.08);
  const resultGlow = Math.max(
    bandWeight(progress, EFFEKT_RANGE[0], EFFEKT_RANGE[1], SCENE_BAND),
    bandWeight(progress, KONTROLLE_RANGE[0], KONTROLLE_RANGE[1], SCENE_BAND) * 0.7
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-landing-danger blur-[120px]"
        style={{ opacity: problemGlow * 0.08 }}
      />
      <div
        className="absolute -left-24 bottom-1/4 h-[26rem] w-[26rem] rounded-full bg-landing-accent-light blur-[120px]"
        style={{ opacity: 0.03 + resultGlow * 0.11 }}
      />
      <div className="absolute inset-0 opacity-0 [background-image:radial-gradient(rgba(25,198,193,0.5)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:opacity-[0.06]" />
    </div>
  );
}

function StoryRail({ progress }: { progress: number }) {
  return (
    <div className="relative hidden h-full flex-col items-center justify-center gap-6 lg:flex">
      <span aria-hidden className="absolute inset-y-2 w-px bg-landing-border" />
      {MARKERS.map((label, i) => {
        const [start, end] = MARKER_RANGES[i];
        const weight = bandWeight(progress, start, end, 0.04);
        const size = 6 + 6 * weight;
        return (
          <span
            key={label}
            title={label}
            className="relative shrink-0 rounded-full border border-landing-border bg-landing-bg-alt"
            style={{ width: `${size}px`, height: `${size}px` }}
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-landing-accent-light"
              style={{ opacity: weight, boxShadow: weight > 0.4 ? "0 0 0 4px var(--landing-accent-subtle)" : "none" }}
            />
          </span>
        );
      })}
    </div>
  );
}

function PhaseText({ phaseIndex, fading }: { phaseIndex: number; fading: boolean }) {
  const phase = PHASES[phaseIndex];
  const kickerClass = phase.tone === "neutral" ? "bg-landing-bg-alt text-landing-text-muted" : TONE_STYLES[phase.tone].kicker;
  return (
    <div
      className={`max-w-md transition-all duration-200 ease-out ${fading ? "translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"}`}
    >
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${kickerClass}`}>
        {phase.kicker}
      </span>
      <h3 className="mt-4 font-display text-2xl font-bold text-landing-text-primary sm:text-3xl lg:text-4xl">{phase.headline}</h3>
      <p className="mt-4 text-landing-text-secondary">{phase.copy}</p>
    </div>
  );
}

// `reveal=false` (Desktop-Buehne): jedes Element blendet stetig ueber den
// Scrollfortschritt ein. `reveal=true` (statische Fassung): sofort voll
// sichtbar, keine Teil-Deckkraft - wichtig fuer Mobile/reduced-motion, wo
// nichts an Sichtbarkeit von Scroll-Interaktion abhaengen darf.
function TallyStrip({ progress, sceneStart, reveal }: { progress: number; sceneStart: number; reveal: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      {TALLY.map((t, i) => {
        const w = reveal ? 1 : clamp01((progress - (sceneStart + i * 0.012)) / 0.05);
        return (
          <div
            key={t.label}
            className="flex flex-col items-center gap-1.5"
            style={{ opacity: w, transform: `translateY(${(1 - w) * 6}px)` }}
          >
            <p className="font-display text-base font-extrabold tabular-nums text-landing-text-primary">{t.value}</p>
            <p className="text-[11px] text-landing-text-secondary">{t.label}</p>
          </div>
        );
      })}
    </div>
  );
}

// Die Produktbuehne: EINE Kartenh uelle, deren INHALT sich stetig ueber den
// Scrollfortschritt entwickelt. Statt Szenen diskret zu montieren/demontieren
// werden alle gerade relevanten Szenen in derselben Grid-Zelle uebereinander
// gerendert (row-start-1/col-start-1) und per stetigem Opacity-/Transform-
// Gewicht (bandWeight) uebereinander weich ausgeblendet - das ergibt eine
// echte Transformation statt eines Zustandssprungs. `reveal=true` schaltet
// alle Teil-Deckkraft-Effekte auf "voll sichtbar" fuer die statische Fassung.
function ProductStage({ progress, reveal }: { progress: number; reveal: boolean }) {
  const listWeight = reveal ? 1 : bandWeight(progress, LIST_RANGE[0], LIST_RANGE[1], SCENE_BAND);
  const zusammenhangWeight = reveal ? 1 : bandWeight(progress, ZUSAMMENHANG_RANGE[0], ZUSAMMENHANG_RANGE[1], SCENE_BAND);
  const effektWeight = reveal ? 1 : bandWeight(progress, EFFEKT_RANGE[0], EFFEKT_RANGE[1], SCENE_BAND);
  const kontrolleWeight = reveal ? 1 : bandWeight(progress, KONTROLLE_RANGE[0], KONTROLLE_RANGE[1], SCENE_BAND);
  const sceneActive = progress >= LIST_RANGE[0] && progress < LIST_RANGE[1] + 0.001;
  const inZusammenhang = progress >= ZUSAMMENHANG_RANGE[0] && progress < ZUSAMMENHANG_RANGE[1];
  const inEffekt = progress >= EFFEKT_RANGE[0] && progress < EFFEKT_RANGE[1];
  const inKontrolle = progress >= KONTROLLE_RANGE[0];

  const stripeWeights: Record<Tone, number> = reveal
    ? { danger: 0, warning: 0, purple: 0, accent: 1 }
    : {
        danger: bandWeight(progress, PHASES[1].start, PHASES[1].end, ROW_BAND),
        warning: bandWeight(progress, PHASES[2].start, PHASES[2].end, ROW_BAND),
        purple: bandWeight(progress, PHASES[3].start, PHASES[3].end, ROW_BAND),
        accent: Math.max(bandWeight(progress, 0, PHASES[0].end, ROW_BAND), zusammenhangWeight, effektWeight, kontrolleWeight),
      };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40">
      {(Object.keys(TONE_STYLES) as Tone[]).map((tone) => (
        <div
          key={tone}
          aria-hidden
          className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl ${TONE_STYLES[tone].glow}`}
          style={{ opacity: stripeWeights[tone] * 0.1 }}
        />
      ))}
      <div className="relative h-1 w-full">
        {(Object.keys(TONE_STYLES) as Tone[]).map((tone) => (
          <div
            key={tone}
            aria-hidden
            className={`absolute inset-0 ${TONE_STYLES[tone].stripe}`}
            style={{ opacity: stripeWeights[tone] }}
          />
        ))}
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
        {(reveal ? sceneActive : listWeight > 0.005) && (
          <div className="col-start-1 row-start-1" style={{ opacity: listWeight }}>
            <ListScene progress={progress} reveal={reveal} />
          </div>
        )}
        {(reveal ? inZusammenhang : zusammenhangWeight > 0.005) && (
          <div
            className="col-start-1 row-start-1 px-7 py-8"
            style={{ opacity: zusammenhangWeight, transform: reveal ? undefined : `translateY(${(1 - zusammenhangWeight) * 10}px)` }}
          >
            <div className="flex flex-wrap gap-3">
              {FINDING_PHASES.map((f, i) => {
                const t = TONE_STYLES[f.tone as Tone];
                const w = reveal ? 1 : clamp01((progress - (ZUSAMMENHANG_RANGE[0] + i * 0.015)) / 0.05);
                return (
                  <div
                    key={f.id}
                    className={`min-w-[9rem] flex-1 rounded-2xl border border-landing-border p-4 ${t.rowBg}`}
                    style={{ opacity: w, transform: reveal ? undefined : `translateY(${(1 - w) * 8}px)` }}
                  >
                    <p className={`text-xs font-semibold ${t.rowText}`}>{f.kicker}</p>
                    <p className="mt-1 font-display text-lg font-bold tabular-nums text-landing-text-primary">{f.findingAmount}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 border-t border-landing-border pt-6">
              <TallyStrip progress={progress} sceneStart={ZUSAMMENHANG_RANGE[0] + 0.06} reveal={reveal} />
            </div>
          </div>
        )}
        {(reveal ? inEffekt : effektWeight > 0.005) && (
          <div
            className="col-start-1 row-start-1 px-7 py-8"
            style={{ opacity: effektWeight, transform: reveal ? undefined : `translateY(${(1 - effektWeight) * 10}px)` }}
          >
            <TallyStrip progress={progress} sceneStart={EFFEKT_RANGE[0] - 0.04} reveal={reveal} />
            <div
              className="relative mt-6 overflow-hidden rounded-2xl border border-landing-accent-light/40 bg-gradient-to-br from-landing-accent-subtle to-landing-bg-alt p-7 text-center"
              style={{ transform: reveal ? undefined : `scale(${0.96 + 0.04 * effektWeight})` }}
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-landing-accent-light/20" />
              <TargetIcon className="relative mx-auto h-6 w-6 text-landing-accent-light" />
              <p className="relative mt-2 font-display text-4xl font-extrabold text-landing-accent-light">18.740 €</p>
              <p className="relative mt-1 text-sm font-semibold text-landing-text-secondary">Potenzieller finanzieller Effekt</p>
            </div>
          </div>
        )}
        {(reveal ? inKontrolle : kontrolleWeight > 0.005) && (
          <div
            className="col-start-1 row-start-1 px-7 py-8"
            style={{ opacity: kontrolleWeight, transform: reveal ? undefined : `translateY(${(1 - kontrolleWeight) * 10}px)` }}
          >
            <div className="border-b border-landing-border pb-6 opacity-80">
              <TallyStrip progress={progress} sceneStart={KONTROLLE_RANGE[0] - 0.06} reveal={reveal} />
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
    </div>
  );
}

// Die "Analyse"-Szene deckt Analyse/Doppelzahlung/Gutschrift/Auffaelligkeit
// als EINE zusammenhaengende Ansicht ab: dieselbe Buchungsliste bleibt
// durchgehend sichtbar, nur welche Zeile hervorgehoben ist, welche Fund-Chips
// bereits sichtbar sind und welcher Inhalt im Transparenzpanel steht, aendert
// sich stetig mit dem Scrollfortschritt.
function ListScene({ progress, reveal }: { progress: number; reveal: boolean }) {
  const chipEntries = FINDING_PHASES.map((f) => {
    const rise = reveal ? (progress >= f.start ? 1 : 0) : riseWeight(progress, f.start, CHIP_BAND);
    const focus = reveal ? 1 : bandWeight(progress, f.start, f.end, CHIP_BAND);
    return { phase: f, opacity: reveal ? rise : rise * (0.55 + 0.45 * focus), rise };
  }).filter((c) => c.rise > 0.01);

  const panelWeight = reveal
    ? PHASES.some((f) => f.reasonFields && progress >= f.start - 0.001 && progress < f.end + 0.001)
      ? 1
      : 0
    : bandWeight(progress, PANEL_RANGE[0], PANEL_RANGE[1], SCENE_BAND);

  return (
    <>
      {chipEntries.length > 0 && (
        <div className="relative flex flex-wrap gap-2 px-7 pb-4">
          {chipEntries.map(({ phase, opacity, rise }) => {
            const t = TONE_STYLES[phase.tone as Tone];
            return (
              <span
                key={phase.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${t.kicker}`}
                style={{ opacity, transform: reveal ? undefined : `scale(${0.92 + 0.08 * rise})` }}
              >
                {phase.findingLabel}
                <span className="tabular-nums">{phase.findingAmount}</span>
              </span>
            );
          })}
        </div>
      )}

      <ul className="relative divide-y divide-landing-border">
        {MASTER_ROWS.map((row) => {
          const owner = FINDING_PHASES.find((p) => p.highlightRowIds?.includes(row.id));
          const weight = owner ? (reveal ? (progress >= owner.start && progress < owner.end ? 1 : 0) : bandWeight(progress, owner.start, owner.end, ROW_BAND)) : 0;
          const t = owner ? TONE_STYLES[owner.tone as Tone] : null;
          return (
            <li key={row.id} className="relative flex items-center justify-between px-7 py-3.5">
              {t && (
                <>
                  <span aria-hidden className={`absolute inset-0 ${t.rowBg}`} style={{ opacity: weight }} />
                  <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${t.rowBar}`} style={{ opacity: weight }} />
                </>
              )}
              <span
                className="relative text-sm text-landing-text-secondary transition-colors duration-150"
                style={{ color: weight > 0.5 ? "var(--landing-text-primary)" : undefined, fontWeight: weight > 0.5 ? 600 : 400 }}
              >
                {row.name}
              </span>
              <span
                className="relative text-sm font-semibold tabular-nums text-landing-text-secondary transition-colors duration-150"
                style={{ color: t && weight > 0.5 ? `var(${t.cssVar})` : undefined }}
              >
                {row.amount}
              </span>
            </li>
          );
        })}
      </ul>

      {panelWeight > 0.01 && (
        <div
          className="relative border-t border-landing-border bg-landing-bg-alt px-7 py-5"
          style={{ opacity: panelWeight, transform: reveal ? undefined : `translateY(${(1 - panelWeight) * 6}px)` }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-landing-text-muted">Warum auffällig?</p>
          <div className="relative mt-3 grid grid-cols-1">
            {FINDING_PHASES.map((f) => {
              const w = reveal ? (progress >= f.start && progress < f.end ? 1 : 0) : bandWeight(progress, f.start, f.end, ROW_BAND);
              if (w < 0.01 || !f.reasonFields) return null;
              return (
                <dl key={f.id} className="col-start-1 row-start-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm" style={{ opacity: w }}>
                  {f.reasonFields.map((field) => (
                    <div key={field.label} className="flex items-center justify-between gap-2">
                      <dt className="text-landing-text-muted">{field.label}</dt>
                      <dd className="text-right font-medium text-landing-text-primary">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              );
            })}
          </div>
        </div>
      )}
    </>
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
          <PhaseText phaseIndex={i} fading={false} />
          <div className="mt-6">
            <ProductStage progress={(phase.start + phase.end) / 2} reveal />
          </div>
        </div>
      ))}
    </div>
  );
}
