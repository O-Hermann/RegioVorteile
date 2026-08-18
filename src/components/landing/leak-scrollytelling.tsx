"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, SearchIcon } from "@/components/icons";

type BookingRow = { name: string; amount: string };

type StoryStep =
  | {
      id: string;
      title: string;
      details: string[];
      variant: "booking";
      datasetLabel: string;
      rows: BookingRow[];
      highlightIndexes: number[];
      potential: string;
    }
  | {
      id: string;
      title: string;
      variant: "summary";
    };

const STEPS: StoryStep[] = [
  {
    id: "doppelzahlung",
    title: "Eine Rechnung wird zweimal bezahlt.",
    details: ["Gleicher Lieferant.", "Gleicher Betrag.", "Ähnliche Rechnungsnummer."],
    variant: "booking",
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
    title: "Eine Gutschrift bleibt liegen.",
    details: ["Erfasst, aber nie verrechnet."],
    variant: "booking",
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
    title: "Ein weiterer ungewöhnlicher Zahlungsvorgang fällt auf.",
    details: ["Rundbetrag ohne Rechnungsbezug.", "Zahlung außerhalb des üblichen Rhythmus."],
    variant: "booking",
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
    title: "Einzeln unauffällig. Zusammen teuer.",
    variant: "summary",
  },
];

// Hoehe des fixen Landing-Headers (h-16 = 64px, siehe landing-header.tsx) +
// dezenter Abstand, damit die sticky Visualisierung sauber darunter bleibt
// statt vom Header ueberdeckt zu werden.
const STICKY_TOP_PX = 88;
// Dauer der Ausblend-Phase beim Schrittwechsel (danach wird der Inhalt
// getauscht und wieder eingeblendet) - siehe useStepCrossfade weiter unten.
const CROSSFADE_MS = 220;

// Sticky Scrollytelling: auf lg+ bleibt die rechte Visualisierung stehen und
// wechselt per IntersectionObserver (gleiches Muster wie LandingNav)
// abhaengig vom aktuell im Viewport zentrierten Story-Schritt, mit einer
// kurzen Ausblend-/Einblend-Ueberblendung statt eines abrupten Wechsels. Auf
// Mobile wird das Sticky-Konzept bewusst vereinfacht - jeder Schritt zeigt
// dort seine eigene, statische Visualisierung direkt unter dem Text, ohne
// Observer-/Crossfade-Abhaengigkeit.
export function LeakScrollytelling() {
  const [activeStep, setActiveStep] = useState(0);
  // displayStep/fadedOut steuern ausschliesslich die sticky Visualisierung
  // und hinken activeStep bewusst kurz hinterher (siehe Kommentar bei der
  // Observer-Callback weiter unten) - activeStep selbst aktualisiert die
  // Story-Texte (Hervorhebung/Nummerierung) weiterhin sofort.
  const [displayStep, setDisplayStep] = useState(0);
  const [fadedOut, setFadedOut] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeStepRef = useRef(0);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const elements = stepRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible[0]) return;
        const index = elements.indexOf(visible[0].target as HTMLDivElement);
        if (index === -1 || index === activeStepRef.current) return;
        activeStepRef.current = index;
        setActiveStep(index);

        // Zweiphasige Ueberblendung der sticky Visualisierung: zunaechst
        // ausblenden, den Inhalt erst danach tauschen und anschliessend
        // weich wieder einblenden - fuehlt sich als Crossfade an, ohne zwei
        // Kartenversionen gleichzeitig im DOM halten zu muessen. Die
        // State-Updates laufen bewusst innerhalb dieses (asynchronen)
        // Observer-Callbacks, nicht synchron im Effekt-Body selbst.
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        setFadedOut(true);
        transitionTimeoutRef.current = setTimeout(() => {
          setDisplayStep(index);
          setFadedOut(false);
        }, CROSSFADE_MS);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  return (
    <section id="geldlecks" className="relative bg-landing-bg-alt py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
              className="lg:flex lg:min-h-[60vh] lg:flex-col lg:justify-center"
            >
              <StepText step={step} index={i} active={activeStep === i} />
              <div className="mt-6 lg:hidden">
                <StoryVisual step={step} />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="sticky" style={{ top: STICKY_TOP_PX }}>
            <div className={`transition-opacity duration-200 ease-out ${fadedOut ? "opacity-0" : "opacity-100"}`}>
              <StoryVisual step={STEPS[displayStep]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepText({ step, index, active }: { step: StoryStep; index: number; active: boolean }) {
  return (
    <div className="max-w-md">
      <div className="flex items-center gap-2.5">
        <span className="font-display text-xs font-semibold tabular-nums text-landing-text-muted">
          {String(index + 1).padStart(2, "0")} / 04
        </span>
        <span className="h-px flex-1 max-w-10 bg-landing-border" />
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
          className={`mt-4 space-y-1.5 text-sm text-landing-text-secondary transition-opacity duration-500 ${
            active ? "lg:opacity-100" : "lg:opacity-45"
          }`}
        >
          {step.details.map((d) => (
            <li key={d} className="flex items-center gap-2">
              <span className="h-1 w-1 shrink-0 rounded-full bg-landing-text-muted" />
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
  return (
    <div className="overflow-hidden rounded-3xl border border-landing-border bg-landing-card-elevated shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40">
      <div className="flex items-center justify-between border-b border-landing-border px-7 py-5">
        <span className="text-sm font-semibold uppercase tracking-wide text-landing-text-muted">{step.datasetLabel}</span>
        <SearchIcon className="h-5 w-5 text-landing-text-muted" />
      </div>
      <ul className="divide-y divide-landing-border">
        {step.rows.map((row, i) => {
          const highlighted = step.highlightIndexes.includes(i);
          return (
            <li
              key={`${row.name}-${i}`}
              className={`flex items-center justify-between px-7 py-[1.125rem] transition-colors duration-300 ${
                highlighted ? "bg-landing-danger-subtle" : ""
              }`}
            >
              <span className={`text-base ${highlighted ? "font-semibold text-landing-text-primary" : "text-landing-text-secondary"}`}>
                {row.name}
              </span>
              <span className={`text-base font-semibold tabular-nums ${highlighted ? "text-landing-danger" : "text-landing-text-secondary"}`}>
                {row.amount}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-end border-t border-landing-border bg-landing-bg-alt px-7 py-5">
        <span className="rounded-full bg-landing-danger px-4 py-2 text-sm font-bold text-white">
          Potenzial: {step.potential}
        </span>
      </div>
    </div>
  );
}

const FUNNEL = [
  { label: "Buchungen analysiert", value: "38.421" },
  { label: "Auffälligkeiten erkannt", value: "47" },
  { label: "bestätigt", value: "32" },
  { label: "Potenzial", value: "18.740 €", accent: true },
];

function SummaryVisual() {
  return (
    <div className="rounded-3xl border border-landing-border bg-landing-card-elevated p-8 shadow-xl shadow-slate-900/5 dark:shadow-2xl dark:shadow-black/40">
      {FUNNEL.map((item, i) => (
        <div key={item.label}>
          <div
            className={`mx-auto rounded-2xl border px-6 py-[1.125rem] text-center ${
              item.accent ? "border-landing-accent-light/40 bg-landing-accent-subtle" : "border-landing-border bg-landing-bg-alt"
            }`}
            style={{ width: `${100 - i * 10}%` }}
          >
            <p className={`font-display text-2xl font-extrabold ${item.accent ? "text-landing-accent-light" : "text-landing-text-primary"}`}>
              {item.value}
            </p>
            <p className="mt-1 text-sm text-landing-text-secondary">{item.label}</p>
          </div>
          {i < FUNNEL.length - 1 && (
            <div className="flex justify-center py-2.5">
              <ArrowRightIcon className="h-5 w-5 rotate-90 text-landing-text-muted" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
