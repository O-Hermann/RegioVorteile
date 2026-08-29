"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUpIcon } from "@/components/icons";

// Neuer Einstiegspunkt der Übersicht-Seite. totalAmount/totalCount/
// categoryList kommen bewusst als fertige Primitives von page.tsx
// (dort per getFindingsSummary() aus FINDINGS abgeleitet) statt die volle
// FindingCategory-Liste hier entgegenzunehmen - die enthaelt Icon-
// Komponenten (Funktionen), die sich nicht ueber die Server/Client-Grenze
// serialisieren lassen ("Functions cannot be passed directly to Client
// Components").
// "lastUpdated" kommt bewusst als fertig formatierter String von page.tsx
// (dort ohnehin schon `now = new Date()`) statt hier per `new Date()` im
// Client neu berechnet zu werden - vermeidet einen Hydration-Mismatch
// zwischen Server-Render-Zeit und Client-Hydration-Zeit.
//
// Verlaufskurve entfernt (Audit 2026-08-29, siehe [[effivo_mvp_roadmap]]):
// es gibt im Datenmodell keine Grundlage fuer einen echten monatlichen
// Verlauf (die vier Detect*()-Funktionen berechnen immer den AKTUELLEN
// Gesamtbestand, kein Snapshot je Periode) - eine erfundene Kurve waere
// wieder eine fabrizierte Zahl. Ersetzt durch eine rein dekorative,
// gedaempfte SVG-Wellenlinie ohne Datenbezug (siehe .hero-flourish im
// freigegebenen Mockup) sowie ein einmaliges Hochzaehlen des Betrags beim
// Laden (0 -> echter Wert, ~900ms, respektiert prefers-reduced-motion) -
// beides rein optischer "Premium"-Schliff (siehe [[effivo_mvp_roadmap]],
// "Goldstandard"-Design 2026-08-30), keine erfundenen Daten. Deshalb
// "use client" - der Rest der Seite bleibt Server-Komponente.
export function FindingsHero({
  totalAmount,
  totalCount,
  categoryList,
  currentPeriodLabel,
  lastUpdated,
}: {
  totalAmount: number;
  totalCount: number;
  categoryList: string;
  currentPeriodLabel: string | null;
  lastUpdated: string;
}) {
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : 900;
    let start: number | null = null;
    let frame: number;
    function step(ts: number) {
      if (start === null) start = ts;
      const progress = duration === 0 ? 1 : Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayAmount(Math.round(totalAmount * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [totalAmount]);

  return (
    <div className="relative flex min-w-0 flex-col gap-4.5 overflow-hidden rounded-xl border border-dash-gold/25 bg-[radial-gradient(560px_320px_at_8%_0%,rgba(226,188,107,0.07),transparent_65%)] bg-dash-panel p-7.5 shadow-[0_1px_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.35)]">
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-auto w-full text-dash-gold-deep opacity-50"
        viewBox="0 0 600 130"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="heroFlourishFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,86 C70,60 130,104 210,78 C290,52 340,96 430,70 C500,50 540,82 600,58 L600,130 L0,130 Z"
          fill="url(#heroFlourishFill)"
        />
        <path
          d="M0,86 C70,60 130,104 210,78 C290,52 340,96 430,70 C500,50 540,82 600,58"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </svg>

      <span className="relative z-[1] flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-dash-text-muted">
        <TrendingUpIcon className="h-3.5 w-3.5 text-dash-gold" />
        Gefundenes Potenzial{currentPeriodLabel ? ` · ${currentPeriodLabel}` : ""}
      </span>

      <div className="relative z-[1] flex-1">
        <span className="text-[44px] font-bold leading-[1.05] tracking-[-0.01em] tabular-nums text-dash-text">
          {displayAmount.toLocaleString("de-DE")}&nbsp;€
        </span>
        <p className="mt-2 text-[14px] leading-[20px] text-dash-text-secondary">
          In <b className="font-semibold text-dash-text">{totalCount} Fällen</b> über vier Kategorien: {categoryList}
        </p>
      </div>

      <div className="relative z-[1] flex flex-wrap items-center justify-between gap-3 border-t border-dash-line pt-5">
        <Link
          href="/arbeitgeber/dashboard/faelle"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-br from-dash-gold-deep to-dash-gold px-5 py-3 text-[14px] font-semibold text-dash-panel transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(226,188,107,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-dash-gold"
        >
          Alle Fälle prüfen
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <span className="text-[11px] text-dash-text-faint">Zuletzt aktualisiert: {lastUpdated}</span>
      </div>
    </div>
  );
}
