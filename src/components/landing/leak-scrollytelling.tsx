"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, SearchIcon } from "@/components/icons";

type BookingRow = { name: string; amount: string };

type StoryStep =
  | {
      id: string;
      eyebrow: string;
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
      eyebrow: string;
      title: string;
      variant: "summary";
    };

const STEPS: StoryStep[] = [
  {
    id: "doppelzahlung",
    eyebrow: "Story-Schritt 1",
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
    eyebrow: "Story-Schritt 2",
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
    eyebrow: "Story-Schritt 3",
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
    eyebrow: "Zusammenführung",
    title: "Einzeln unauffällig. Zusammen teuer.",
    variant: "summary",
  },
];

// Sticky Scrollytelling (Punkt "erstes Geldleck-Scrollytelling"): auf lg+
// bleibt die rechte Visualisierung stehen und wechselt per IntersectionObserver
// (gleiches Muster wie LandingNav) abhaengig vom aktuell im Viewport
// zentrierten Story-Schritt. Auf Mobile wird das Sticky-Konzept bewusst
// vereinfacht - jeder Schritt zeigt dort seine eigene, statische
// Visualisierung direkt unter dem Text, ohne Observer-Abhaengigkeit.
export function LeakScrollytelling() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

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
        if (index !== -1) setActiveStep(index);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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

      <div className="relative mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_420px] lg:items-start lg:gap-16">
        <div className="flex flex-col gap-14 lg:gap-0">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className="lg:flex lg:min-h-[80vh] lg:flex-col lg:justify-center"
            >
              <StepText step={step} active={activeStep === i} />
              <div className="mt-6 lg:hidden">
                <StoryVisual step={step} />
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-28">
            <StoryVisual step={STEPS[activeStep]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function StepText({ step, active }: { step: StoryStep; active: boolean }) {
  return (
    <div className={`max-w-md transition-opacity duration-500 ${active ? "lg:opacity-100" : "lg:opacity-45"}`}>
      <span className="inline-block rounded-full bg-landing-accent-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wide text-landing-accent-light">
        {step.eyebrow}
      </span>
      <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-landing-text-primary">{step.title}</h3>
      {step.variant === "booking" && (
        <ul className="mt-4 space-y-1.5 text-sm text-landing-text-secondary">
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
    <div className="overflow-hidden rounded-2xl border border-landing-border bg-landing-card-elevated shadow-lg shadow-slate-900/5 dark:shadow-xl dark:shadow-black/30">
      <div className="flex items-center justify-between border-b border-landing-border px-5 py-3.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-landing-text-muted">{step.datasetLabel}</span>
        <SearchIcon className="h-4 w-4 text-landing-text-muted" />
      </div>
      <ul className="divide-y divide-landing-border">
        {step.rows.map((row, i) => {
          const highlighted = step.highlightIndexes.includes(i);
          return (
            <li
              key={`${row.name}-${i}`}
              className={`flex items-center justify-between px-5 py-3 transition-colors ${highlighted ? "bg-landing-danger-subtle" : ""}`}
            >
              <span className={`text-sm ${highlighted ? "font-semibold text-landing-text-primary" : "text-landing-text-secondary"}`}>
                {row.name}
              </span>
              <span className={`text-sm font-semibold tabular-nums ${highlighted ? "text-landing-danger" : "text-landing-text-secondary"}`}>
                {row.amount}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-end border-t border-landing-border bg-landing-bg-alt px-5 py-4">
        <span className="rounded-full bg-landing-danger px-3 py-1.5 text-xs font-bold text-white">
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
    <div className="rounded-2xl border border-landing-border bg-landing-card-elevated p-6 shadow-lg shadow-slate-900/5 dark:shadow-xl dark:shadow-black/30">
      {FUNNEL.map((item, i) => (
        <div key={item.label}>
          <div
            className={`mx-auto rounded-xl border px-5 py-3.5 text-center ${
              item.accent ? "border-landing-accent-light/40 bg-landing-accent-subtle" : "border-landing-border bg-landing-bg-alt"
            }`}
            style={{ width: `${100 - i * 10}%` }}
          >
            <p className={`font-display text-xl font-extrabold ${item.accent ? "text-landing-accent-light" : "text-landing-text-primary"}`}>
              {item.value}
            </p>
            <p className="mt-0.5 text-xs text-landing-text-secondary">{item.label}</p>
          </div>
          {i < FUNNEL.length - 1 && (
            <div className="flex justify-center py-2">
              <ArrowRightIcon className="h-4 w-4 rotate-90 text-landing-text-muted" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
