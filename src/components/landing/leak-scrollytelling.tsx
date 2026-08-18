"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CheckIcon,
  FileTextIcon,
  SearchIcon,
  TargetIcon,
} from "@/components/icons";

type Tone = "danger" | "warning" | "purple";

type BookingRow = { name: string; amount: string };

type StoryStepBase = { id: string; kicker: string; title: string };

type StoryStep =
  | (StoryStepBase & {
      variant: "booking";
      tone: Tone;
      details: string[];
      datasetLabel: string;
      rows: BookingRow[];
      highlightIndexes: number[];
      potential: string;
    })
  | (StoryStepBase & { variant: "summary" });

const STEPS: StoryStep[] = [
  {
    id: "doppelzahlung",
    kicker: "Doppelzahlung",
    title: "Eine Rechnung wird zweimal bezahlt.",
    details: ["Gleicher Lieferant.", "Gleicher Betrag.", "Ähnliche Rechnungsnummer."],
    variant: "booking",
    tone: "danger",
    datasetLabel: "Zahlungen – Buchhaltung",
    rows: [
      { name: "Müller GmbH", amount: "2.480 €" },
      { name: "Telekom", amount: "184 €" },
      { name: "Mustertechnik GmbH", amount: "4.820 €" },
      { name: "Bürobedarf GmbH", amount: "638 €" },
      { name: "Müller GmbH", amount: "2.480 €" },
    ],
    highlightIndexes: [0, 4],
    potential: "2.480 €",
  },
  {
    id: "gutschrift",
    kicker: "Offene Gutschrift",
    title: "Eine Gutschrift bleibt liegen.",
    details: ["Erfasst, aber nie verrechnet."],
    variant: "booking",
    tone: "warning",
    datasetLabel: "Gutschriften – Kreditorenkonto",
    rows: [
      { name: "Gutschrift – Bürobedarf GmbH", amount: "1.240 €" },
      { name: "Gutschrift – Mustertechnik GmbH", amount: "310 €" },
      { name: "Gutschrift – Telekom", amount: "96 €" },
    ],
    highlightIndexes: [0],
    potential: "1.240 €",
  },
  {
    id: "auffaelligkeit",
    kicker: "Auffälligkeit",
    title: "Ein weiterer ungewöhnlicher Zahlungsvorgang fällt auf.",
    details: ["Rundbetrag ohne Rechnungsbezug.", "Zahlung außerhalb des üblichen Rhythmus."],
    variant: "booking",
    tone: "purple",
    datasetLabel: "Zahlungen – Ungewöhnliches Muster",
    rows: [
      { name: "Logistik Partner GmbH", amount: "3.100 €" },
      { name: "Bürobedarf GmbH", amount: "412 €" },
      { name: "Werbeagentur Nord", amount: "1.050 €" },
    ],
    highlightIndexes: [0],
    potential: "3.100 €",
  },
  {
    id: "zusammenfuehrung",
    kicker: "Ergebnis",
    title: "Einzeln unauffällig. Zusammen teuer.",
    variant: "summary",
  },
];

const TONE_STYLES: Record<Tone, { kicker: string; icon: string; glow: string; stripe: string; rowBar: string; rowBg: string; rowText: string; ring: string }> = {
  danger: {
    kicker: "bg-landing-danger-subtle text-landing-danger",
    icon: "bg-landing-danger-subtle text-landing-danger",
    glow: "bg-landing-danger/10",
    stripe: "from-landing-danger via-landing-danger to-transparent",
    rowBar: "bg-landing-danger",
    rowBg: "bg-landing-danger-subtle",
    rowText: "text-landing-danger",
    ring: "border-landing-danger bg-landing-danger-subtle text-landing-danger ring-landing-danger-subtle",
  },
  warning: {
    kicker: "bg-landing-warning-subtle text-landing-warning",
    icon: "bg-landing-warning-subtle text-landing-warning",
    glow: "bg-landing-warning/10",
    stripe: "from-landing-warning via-landing-warning to-transparent",
    rowBar: "bg-landing-warning",
    rowBg: "bg-landing-warning-subtle",
    rowText: "text-landing-warning",
    ring: "border-landing-warning bg-landing-warning-subtle text-landing-warning ring-landing-warning-subtle",
  },
  purple: {
    kicker: "bg-landing-purple-subtle text-landing-purple",
    icon: "bg-landing-purple-subtle text-landing-purple",
    glow: "bg-landing-purple/10",
    stripe: "from-landing-purple via-landing-purple to-transparent",
    rowBar: "bg-landing-purple",
    rowBg: "bg-landing-purple-subtle",
    rowText: "text-landing-purple",
    ring: "border-landing-purple bg-landing-purple-subtle text-landing-purple ring-landing-purple-subtle",
  },
};

const SUMMARY_RING = "border-landing-accent-light bg-landing-accent-subtle text-landing-accent-light ring-landing-accent-subtle";

// Hoehe des fixen Landing-Headers (h-16 = 64px, siehe landing-header.tsx) +
// dezenter Abstand, damit die sticky Visualisierung sauber darunter bleibt
// statt vom Header ueberdeckt zu werden.
const STICKY_TOP_PX = 88;
// Dauer der Ausblend-Phase beim Schrittwechsel (danach wird der Inhalt
// getauscht und wieder eingeblendet, siehe Kommentar am Scroll-Handler).
const CROSSFADE_MS = 200;
// Mindestvorsprung (px Abstand zur Viewport-Mitte), den ein neuer Schritt
// gegenueber dem aktuell aktiven haben muss, bevor gewechselt wird - reine
// Hysterese, damit das Umschalten nicht exakt am Uebergangspunkt flackert.
const SWITCH_HYSTERESIS_PX = 12;

// Sticky Scrollytelling: auf lg+ bleibt die rechte Visualisierung stehen.
// Welcher Schritt aktiv ist, wird NICHT mehr per IntersectionObserver-
// Schwellwerten bestimmt (das fuehlte sich am Uebergangspunkt ungenau/
// verzoegert an), sondern durchgehend waehrend des Scrollens: bei jedem
// (per rAF gedrosselten) Scroll-Event wird gemessen, welcher Story-Schritt
// mit seiner Mitte am naechsten an der Viewport-Mitte liegt - das ist exakt
// an den tatsaechlichen Scroll-Fortschritt gekoppelt und wechselt praezise
// im richtigen Moment, mit einer kleinen Hysterese gegen Flackern. Auf
// Mobile wird das Sticky-Konzept bewusst vereinfacht - jeder Schritt zeigt
// dort seine eigene, statische Visualisierung direkt unter dem Text.
export function LeakScrollytelling() {
  const [activeStep, setActiveStep] = useState(0);
  // displayStep/fadedOut steuern ausschliesslich die sticky Visualisierung
  // und hinken activeStep bewusst kurz hinterher - activeStep selbst
  // aktualisiert Timeline-Marker und Story-Texte weiterhin sofort.
  const [displayStep, setDisplayStep] = useState(0);
  const [fadedOut, setFadedOut] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeStepRef = useRef(0);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const elements = stepRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (elements.length === 0) return;

    let frame = 0;

    function evaluate() {
      frame = 0;
      const viewportCenter = window.innerHeight / 2;

      let closestIndex = activeStepRef.current;
      let closestDistance = Infinity;
      const distances = elements.map((el) => {
        const rect = el.getBoundingClientRect();
        return Math.abs(rect.top + rect.height / 2 - viewportCenter);
      });
      distances.forEach((distance, i) => {
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });

      if (closestIndex === activeStepRef.current) return;
      // Hysterese: nur wechseln, wenn der neue Schritt spuerbar naeher ist
      // als der bisher aktive - verhindert Flackern exakt am Wendepunkt.
      if (distances[activeStepRef.current] - closestDistance < SWITCH_HYSTERESIS_PX) return;

      activeStepRef.current = closestIndex;
      setActiveStep(closestIndex);

      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      setFadedOut(true);
      transitionTimeoutRef.current = setTimeout(() => {
        setDisplayStep(closestIndex);
        setFadedOut(false);
      }, CROSSFADE_MS);
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(evaluate);
    }

    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  return (
    <section id="geldlecks" className="relative bg-landing-bg-alt py-20 sm:py-28">
      {/* Ambiente-Tiefe: Glow-Zonen, gemaskertes Punktmuster, feines Noise -
          bewusst als eigenstaendiger Geschwister-Layer mit eigenem
          "overflow-hidden", NICHT auf der <section> selbst (das wuerde
          "position: sticky" bei der Visualisierung weiter unten brechen). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-16 h-[30rem] w-[30rem] rounded-full bg-landing-accent-light/0 blur-[110px] dark:bg-landing-accent-light/10" />
        <div className="absolute -left-32 top-[55%] h-[26rem] w-[26rem] rounded-full bg-landing-purple/0 blur-[110px] dark:bg-landing-purple/10" />
        <div className="absolute inset-0 opacity-0 [background-image:radial-gradient(rgba(25,198,193,0.5)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] dark:opacity-[0.08]" />
        <div
          className="absolute inset-0 opacity-0 mix-blend-overlay dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-landing-text-primary">
            Geld geht selten auf einmal verloren.
          </h2>
          <p className="mt-4 text-lg text-landing-text-secondary">
            Oft sind es kleine Fehler, die zwischen tausenden Buchungen unbemerkt bleiben.
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-[0.44fr_0.56fr] lg:gap-x-10">
        <div className="flex flex-col gap-10 lg:gap-0">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className="lg:flex lg:min-h-[60vh] lg:items-center lg:gap-6"
            >
              <div className="hidden lg:flex lg:h-full lg:w-6 lg:shrink-0 lg:flex-col lg:items-center">
                <span className={`w-px flex-1 ${i === 0 ? "bg-transparent" : "bg-landing-border"}`} />
                <StepMarker index={i} active={activeStep === i} step={step} />
                <span className={`w-px flex-1 ${i === STEPS.length - 1 ? "bg-transparent" : "bg-landing-border"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <StepText step={step} index={i} active={activeStep === i} />
                <div className="mt-6 lg:hidden">
                  <StoryVisual step={step} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="sticky" style={{ top: STICKY_TOP_PX }}>
            <div
              className={`transition-all duration-200 ease-out ${
                fadedOut ? "translate-y-1.5 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <StoryVisual key={STEPS[displayStep].id} step={STEPS[displayStep]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepMarker({ index, active, step }: { index: number; active: boolean; step: StoryStep }) {
  const ring = step.variant === "summary" ? SUMMARY_RING : TONE_STYLES[step.tone].ring;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border font-display text-xs font-bold tabular-nums transition-all duration-500 ${
        active ? `h-8 w-8 ring-4 ${ring}` : "h-2.5 w-2.5 border-landing-border bg-landing-bg-alt text-transparent"
      }`}
    >
      {active && String(index + 1).padStart(2, "0")}
    </span>
  );
}

function StepText({ step, index, active }: { step: StoryStep; index: number; active: boolean }) {
  const isSummary = step.variant === "summary";
  const kickerClass = isSummary ? "bg-landing-accent-subtle text-landing-accent-light" : TONE_STYLES[step.tone].kicker;
  const bulletClass = isSummary ? "" : TONE_STYLES[step.tone].icon;
  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-opacity duration-500 ${kickerClass} ${
            active ? "opacity-100" : "lg:opacity-55"
          }`}
        >
          {step.kicker}
        </span>
        <span className="text-xs font-semibold tabular-nums text-landing-text-muted">
          {String(index + 1).padStart(2, "0")} / 04
        </span>
      </div>
      <h3
        className={`mt-4 font-display font-bold text-landing-text-primary transition-all duration-500 ${
          active ? "text-2xl sm:text-3xl lg:text-4xl lg:opacity-100" : "text-2xl sm:text-3xl lg:opacity-45"
        }`}
      >
        {step.title}
      </h3>
      {step.variant === "booking" && (
        <ul
          className={`mt-4 space-y-2 text-sm text-landing-text-secondary transition-opacity duration-500 ${
            active ? "lg:opacity-100" : "lg:opacity-45"
          }`}
        >
          {step.details.map((d) => (
            <li key={d} className="flex items-center gap-2.5">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${bulletClass}`}>
                <CheckIcon className="h-3 w-3" />
              </span>
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StoryVisual({ step }: { step: StoryStep }) {
  if (step.variant === "summary") return <SummaryVisual />;
  return <BookingVisual step={step} />;
}

function BookingVisual({ step }: { step: Extract<StoryStep, { variant: "booking" }> }) {
  const tone = TONE_STYLES[step.tone];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40">
      <div aria-hidden className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl ${tone.glow}`} />
      <div className={`h-1 w-full bg-gradient-to-r ${tone.stripe}`} />
      <div className="relative flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone.icon}`}>
            <AlertTriangleIcon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-landing-text-muted">{step.datasetLabel}</span>
        </div>
        <SearchIcon className="h-5 w-5 text-landing-text-muted" />
      </div>
      <ul className="relative divide-y divide-landing-border">
        {step.rows.map((row, i) => {
          const highlighted = step.highlightIndexes.includes(i);
          return (
            <li
              key={`${row.name}-${i}`}
              className={`relative flex items-center justify-between px-7 py-[1.125rem] opacity-0 transition-colors duration-300 animate-fade-in-up ${
                highlighted ? tone.rowBg : ""
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {highlighted && <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${tone.rowBar}`} />}
              <span className={`text-base ${highlighted ? "font-semibold text-landing-text-primary" : "text-landing-text-secondary"}`}>
                {row.name}
              </span>
              <span className={`text-base font-semibold tabular-nums ${highlighted ? tone.rowText : "text-landing-text-secondary"}`}>
                {row.amount}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="relative flex items-center justify-between gap-3 border-t border-landing-border bg-landing-bg-alt px-7 py-5">
        <span className="text-xs text-landing-text-muted">Automatisch erkannt</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-landing-danger px-4 py-2 text-sm font-bold text-white shadow-lg shadow-landing-danger/30">
          Potenzial: {step.potential}
        </span>
      </div>
    </div>
  );
}

const FUNNEL = [
  { label: "Buchungen analysiert", value: "38.421", icon: FileTextIcon },
  { label: "Auffälligkeiten erkannt", value: "47", icon: AlertTriangleIcon },
  { label: "bestätigt", value: "32", icon: CheckCircleIcon },
];

function SummaryVisual() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-landing-accent-light/30 bg-landing-card-elevated shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-landing-accent-light/15 blur-3xl" />
      <div className="h-1 w-full bg-gradient-to-r from-landing-accent-light via-landing-accent to-transparent" />
      <div className="relative flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-landing-accent-subtle text-landing-accent-light">
            <TargetIcon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-landing-text-muted">Analyse-Ergebnis</span>
        </div>
        <CheckCircleIcon className="h-5 w-5 text-landing-accent-light" />
      </div>
      <div className="relative p-7 sm:p-8 pt-2">
        <ul className="space-y-3">
          {FUNNEL.map((item, i) => (
            <li
              key={item.label}
              className="flex items-center gap-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 110}ms` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-landing-border bg-landing-bg-alt text-landing-text-muted">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-display text-xl font-extrabold tabular-nums text-landing-text-primary">{item.value}</p>
                <p className="text-xs text-landing-text-secondary">{item.label}</p>
              </div>
            </li>
          ))}
        </ul>

        <div
          className="relative mt-6 overflow-hidden rounded-2xl border border-landing-accent-light/40 bg-gradient-to-br from-landing-accent-subtle to-landing-bg-alt p-6 text-center opacity-0 animate-fade-in-up"
          style={{ animationDelay: "440ms" }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-landing-accent-light/20" />
          <TargetIcon className="relative mx-auto h-6 w-6 text-landing-accent-light" />
          <p className="relative mt-2 font-display text-4xl font-extrabold text-landing-accent-light">18.740 €</p>
          <p className="relative mt-1 text-sm font-semibold text-landing-text-secondary">Potenzieller finanzieller Effekt</p>
        </div>
      </div>
    </div>
  );
}
