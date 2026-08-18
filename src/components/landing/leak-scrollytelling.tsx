"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangleIcon, CheckCircleIcon, CheckIcon, EyeIcon, FileTextIcon, SearchIcon, TargetIcon } from "@/components/icons";

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

// Eine durchgehende Buchungsliste, die ueber alle Analyse-Phasen sichtbar
// bleibt (Punkt "Bestehende Liste bleibt sichtbar, kein neuer Screen") -
// nur die hervorgehobene Teilmenge aendert sich je Phase.
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

const TALLY = [
  { value: "38.421", label: "Buchungen", icon: FileTextIcon },
  { value: "47", label: "Auffälligkeiten", icon: AlertTriangleIcon },
  { value: "32", label: "bestätigt", icon: CheckCircleIcon },
];

const TONE_STYLES: Record<
  Tone,
  { kicker: string; icon: string; glow: string; stripe: string; rowBar: string; rowBg: string; rowText: string; ring: string }
> = {
  danger: {
    kicker: "bg-landing-danger-subtle text-landing-danger",
    icon: "bg-landing-danger-subtle text-landing-danger",
    glow: "bg-landing-danger",
    stripe: "from-landing-danger via-landing-danger to-transparent",
    rowBar: "bg-landing-danger",
    rowBg: "bg-landing-danger-subtle",
    rowText: "text-landing-danger",
    ring: "border-landing-danger bg-landing-danger-subtle text-landing-danger ring-landing-danger-subtle",
  },
  warning: {
    kicker: "bg-landing-warning-subtle text-landing-warning",
    icon: "bg-landing-warning-subtle text-landing-warning",
    glow: "bg-landing-warning",
    stripe: "from-landing-warning via-landing-warning to-transparent",
    rowBar: "bg-landing-warning",
    rowBg: "bg-landing-warning-subtle",
    rowText: "text-landing-warning",
    ring: "border-landing-warning bg-landing-warning-subtle text-landing-warning ring-landing-warning-subtle",
  },
  purple: {
    kicker: "bg-landing-purple-subtle text-landing-purple",
    icon: "bg-landing-purple-subtle text-landing-purple",
    glow: "bg-landing-purple",
    stripe: "from-landing-purple via-landing-purple to-transparent",
    rowBar: "bg-landing-purple",
    rowBg: "bg-landing-purple-subtle",
    rowText: "text-landing-purple",
    ring: "border-landing-purple bg-landing-purple-subtle text-landing-purple ring-landing-purple-subtle",
  },
  accent: {
    kicker: "bg-landing-accent-subtle text-landing-accent-light",
    icon: "bg-landing-accent-subtle text-landing-accent-light",
    glow: "bg-landing-accent-light",
    stripe: "from-landing-accent-light via-landing-accent to-transparent",
    rowBar: "bg-landing-accent-light",
    rowBg: "bg-landing-accent-subtle",
    rowText: "text-landing-accent-light",
    ring: "border-landing-accent-light bg-landing-accent-subtle text-landing-accent-light ring-landing-accent-subtle",
  },
};

// Gesamt-Scrollstrecke der gepinnten Story (500-650vh Zielbereich).
const STORY_VH = 560;
// Hoehe des fixen Landing-Headers (h-16 = 64px) + dezenter Abstand.
const STICKY_TOP_PX = 88;

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

// Zentrale Produktgeschichte der Startseite: EINE grosse gepinnte Section
// (kein IntersectionObserver, keine getrennten Bloecke mehr), deren
// Scrollfortschritt (0..1) ueber die tatsaechliche Position der Section im
// Dokument berechnet wird (Punkt "eine zentrale Berechnung des
// Scrollfortschritts"). Aus diesem einen Wert werden feste Phasen abgeleitet,
// die sowohl den Story-Text links als auch die sich weiterentwickelnde
// Produktbuehne rechts steuern - dieselbe Kartenh uelle bleibt dabei
// durchgehend sichtbar und veraendert nur ihren Inhalt, statt komplett
// getrennte Screens auszutauschen. Auf Mobile und bei reduzierter Bewegung
// (prefers-reduced-motion) wird stattdessen eine kompakte, statische
// vertikale Liste aller Phasen gerendert - ohne Pinning, ohne Scroll-Kopplung.
export function LeakScrollytelling() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);

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
      const clamped = Math.min(1, Math.max(0, raw));
      if (Math.abs(clamped - progressRef.current) < 0.0015) return;
      progressRef.current = clamped;
      setProgress(clamped);
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
    };
  }, [prefersReducedMotion]);

  const phaseIndex = resolvePhaseIndex(progress);
  const phase = PHASES[phaseIndex];
  const foundFindings = PHASES.filter((p) => p.findingLabel && progress >= p.start);

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
                <AmbientLayer phase={phase} />
                <div className="relative mx-auto grid w-full max-w-6xl grid-cols-[1.5rem_0.42fr_0.56fr] items-center gap-x-8 px-4 sm:px-6">
                  <StoryRail activeMarkerIndex={phase.markerIndex} />
                  <PhaseText phase={phase} />
                  <ProductStage phase={phase} foundFindings={foundFindings} />
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

function AmbientLayer({ phase }: { phase: Phase }) {
  const problemActive = phase.tone === "danger" || phase.tone === "warning" || phase.tone === "purple";
  const resultActive = phase.tone === "accent";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full blur-[120px] transition-opacity duration-700"
        style={{ opacity: problemActive ? 0.08 : 0 }}
      >
        <div className="h-full w-full rounded-full bg-landing-danger" />
      </div>
      <div
        className="absolute -left-24 bottom-1/4 h-[26rem] w-[26rem] rounded-full blur-[120px] transition-opacity duration-700"
        style={{ opacity: resultActive ? 0.14 : 0.03 }}
      >
        <div className="h-full w-full rounded-full bg-landing-accent-light" />
      </div>
      <div className="absolute inset-0 opacity-0 [background-image:radial-gradient(rgba(25,198,193,0.5)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:opacity-[0.06]" />
    </div>
  );
}

function StoryRail({ activeMarkerIndex }: { activeMarkerIndex: number }) {
  return (
    <div className="relative hidden h-full flex-col items-center justify-center gap-6 lg:flex">
      <span aria-hidden className="absolute inset-y-2 w-px bg-landing-border" />
      {MARKERS.map((label, i) => (
        <span
          key={label}
          title={label}
          className={`relative shrink-0 rounded-full border transition-all duration-500 ${
            i === activeMarkerIndex
              ? "h-3 w-3 border-landing-accent-light bg-landing-accent-light ring-4 ring-landing-accent-subtle"
              : "h-1.5 w-1.5 border-landing-border bg-landing-border"
          }`}
        />
      ))}
    </div>
  );
}

function PhaseText({ phase, animate = true }: { phase: Phase; animate?: boolean }) {
  const kickerClass = phase.tone === "neutral" ? "bg-landing-bg-alt text-landing-text-muted" : TONE_STYLES[phase.tone].kicker;
  return (
    <div key={phase.id} className={`max-w-md ${animate ? "opacity-0 animate-fade-in-up" : ""}`}>
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${kickerClass}`}>
        {phase.kicker}
      </span>
      <h3 className="mt-4 font-display text-2xl font-bold text-landing-text-primary sm:text-3xl lg:text-4xl">{phase.headline}</h3>
      <p className="mt-4 text-landing-text-secondary">{phase.copy}</p>
    </div>
  );
}

function TallyStrip({ dim }: { dim?: boolean }) {
  return (
    <div className={`grid grid-cols-3 gap-3 text-center ${dim ? "opacity-70" : ""}`}>
      {TALLY.map((t) => (
        <div key={t.label} className="flex flex-col items-center gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-landing-border bg-landing-bg-alt text-landing-text-muted">
            <t.icon className="h-4 w-4" />
          </span>
          <p className="font-display text-base font-extrabold tabular-nums text-landing-text-primary">{t.value}</p>
          <p className="text-[11px] text-landing-text-secondary">{t.label}</p>
        </div>
      ))}
    </div>
  );
}

// Die Produktbuehne: EINE durchgehende Kartenh uelle (gleicher Rahmen, gleicher
// Glow-Rand ueber alle Phasen hinweg), deren INHALT sich je Phase
// weiterentwickelt - Buchungsliste mit wachsenden Fund-Chips waehrend der
// Analyse, dann Zusammenfuehrung, grosser Potenzial-Moment und abschliessend
// eine Kontroll-/Bewertungsansicht. Dadurch wirkt es wie eine sich
// entwickelnde Analyse statt vier getrennter Screens.
function ProductStage({ phase, foundFindings, animate = true }: { phase: Phase; foundFindings: Phase[]; animate?: boolean }) {
  const tone = phase.tone !== "neutral" ? TONE_STYLES[phase.tone] : null;
  const isListPhase = phase.id === "analyse" || phase.id === "doppelzahlung" || phase.id === "gutschrift" || phase.id === "muster";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40">
      {tone && (
        <div aria-hidden className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-10 blur-3xl transition-colors duration-700 ${tone.glow}`} />
      )}
      <div className={`h-1 w-full bg-gradient-to-r transition-colors duration-700 ${tone ? tone.stripe : "from-landing-border via-landing-border to-transparent"}`} />

      <div className="relative flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone ? tone.icon : "bg-landing-bg-alt text-landing-text-muted"}`}>
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
                const active = f.id === phase.id;
                return (
                  <span
                    key={f.id}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-opacity duration-500 ${t.kicker} ${
                      active ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    {f.findingLabel}
                    <span className="tabular-nums">{f.findingAmount}</span>
                  </span>
                );
              })}
            </div>
          )}

          <ul className="relative divide-y divide-landing-border">
            {MASTER_ROWS.map((row) => {
              const highlighted = phase.highlightRowIds?.includes(row.id) ?? false;
              return (
                <li
                  key={row.id}
                  className={`relative flex items-center justify-between px-7 py-3.5 transition-colors duration-500 ${highlighted && tone ? tone.rowBg : ""}`}
                >
                  {highlighted && tone && <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${tone.rowBar}`} />}
                  <span className={`text-sm ${highlighted ? "font-semibold text-landing-text-primary" : "text-landing-text-secondary"}`}>{row.name}</span>
                  <span className={`text-sm font-semibold tabular-nums ${highlighted && tone ? tone.rowText : "text-landing-text-secondary"}`}>
                    {row.amount}
                  </span>
                </li>
              );
            })}
          </ul>

          {phase.reasonFields && (
            <div className={`relative border-t border-landing-border bg-landing-bg-alt px-7 py-5 ${animate ? "opacity-0 animate-fade-in-up" : ""}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-landing-text-muted">Warum auffällig?</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {phase.reasonFields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-2">
                    <dt className="text-landing-text-muted">{f.label}</dt>
                    <dd className="text-right font-medium text-landing-text-primary">{f.value}</dd>
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
            {PHASES.filter((p) => p.findingLabel).map((f) => {
              const t = TONE_STYLES[f.tone as Tone];
              return (
                <div key={f.id} className={`min-w-[9rem] flex-1 rounded-2xl border border-landing-border p-4 ${t.rowBg}`}>
                  <p className={`text-xs font-semibold ${t.rowText}`}>{f.kicker}</p>
                  <p className="mt-1 font-display text-lg font-bold tabular-nums text-landing-text-primary">{f.findingAmount}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 border-t border-landing-border pt-6">
            <TallyStrip />
          </div>
        </div>
      )}

      {phase.id === "effekt" && (
        <div className="relative px-7 py-8">
          <TallyStrip dim />
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-landing-accent-light/40 bg-gradient-to-br from-landing-accent-subtle to-landing-bg-alt p-7 text-center">
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-landing-accent-light/20" />
            <TargetIcon className="relative mx-auto h-6 w-6 text-landing-accent-light" />
            <p className="relative mt-2 font-display text-4xl font-extrabold text-landing-accent-light">18.740 €</p>
            <p className="relative mt-1 text-sm font-semibold text-landing-text-secondary">Potenzieller finanzieller Effekt</p>
          </div>
        </div>
      )}

      {phase.id === "kontrolle" && (
        <div className="relative px-7 py-8">
          <div className="border-b border-landing-border pb-6">
            <TallyStrip dim />
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

// Kompakte, nicht gepinnte vertikale Fassung der Story - fuer Mobile
// (Punkt 25) und fuer "prefers-reduced-motion" (Punkt 27): keine
// scrollgekoppelten Transformationen, alle Phasen direkt lesbar
// untereinander, keine Sticky-/Observer-Logik.
function StaticStory() {
  return (
    <div className="mx-auto max-w-2xl space-y-14 px-4 sm:px-6">
      {PHASES.map((phase, i) => {
        const foundFindings = PHASES.slice(0, i + 1).filter((p) => p.findingLabel);
        return (
          <div key={phase.id}>
            <PhaseText phase={phase} animate={false} />
            <div className="mt-6">
              <ProductStage phase={phase} foundFindings={foundFindings} animate={false} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
