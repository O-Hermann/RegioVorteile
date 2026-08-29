import Link from "next/link";
import { TrendingUpIcon } from "@/components/icons";
import { dashFontDisplayClass, dashTextSectionHeading } from "@/components/dashboard/dash-ui";
import { getFindingsSummary, type FindingCategory } from "@/components/dashboard/findings-list";

// Neuer Einstiegspunkt der Übersicht-Seite (ersetzt die bisherige, auf
// Umsatz ausgerichtete "StatusHero" + "KpiGrid"-Kombination der linken
// Spalte): die Kundenvorgabe fuer das MVP ist explizit, zuerst zu zeigen,
// wo Geld liegen bleibt (Doppelzahlungen/Skonto/Gutschriften/Überzahlung -
// siehe findings-list.tsx), nicht Umsatz/Kosten. Betrag und Fallzahl werden
// bewusst aus FINDINGS abgeleitet (getFindingsSummary()) statt hier separat
// gepflegt, damit Hero und Fund-Karten nie auseinanderlaufen koennen.
//
// Die 5 aelteren Monatswerte hier sind wie die FINDINGS-Betraege selbst
// Referenz-Demowerte (kein echtes Trend-Datenmodell fuer "gefundenes
// Potenzial" ueber Zeit) - bewusst NICHT hart in ein SVG-Pfad-Attribut
// gegossen wie im urspruenglichen HTML-Mockup, sondern aus einem echten
// Array berechnet: der letzte Punkt (August) und die Delta-Anzeige nutzen
// dadurch automatisch den echten totalAmount aus getFindingsSummary(),
// koennen also nie aus dem Takt geraten, wenn sich FINDINGS spaeter aendert
// - nur die 5 aelteren Referenzmonate bleiben fest.
const HISTORY_REFERENCE = [
  { label: "Mrz", amount: 47900 },
  { label: "Apr", amount: 53100 },
  { label: "Mai", amount: 49900 },
  { label: "Jun", amount: 66500 },
  { label: "Jul", amount: 61000 },
];

// Catmull-Rom-zu-Bezier-Interpolation (Standardtechnik, Tension 1/6): baut
// aus den Datenpunkten eine sanfte Kurve statt scharfer Geraden-Knicke
// zwischen jedem Monat - der vorherige, rein lineare Pfad wirkte bei der
// kompakten Kartenhoehe wie grob "verkantet" statt wie eine echte Kurve.
function smoothLinePath(points: readonly (readonly [number, number])[]) {
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

// "Alle Fälle prüfen" verlinkt seit MVP-Roadmap Phase 2.3 (siehe
// [[effivo_mvp_roadmap]]) echt auf die Fallpruefungs-Arbeitsliste
// (/arbeitgeber/dashboard/faelle).
export function FindingsHero({ findings, currentPeriodLabel }: { findings: FindingCategory[]; currentPeriodLabel: string | null }) {
  const { totalAmount, totalCount } = getFindingsSummary(findings);
  const categoryList = findings.map((f) => f.name).join(", ");

  const history = [...HISTORY_REFERENCE, { label: "Aug", amount: totalAmount }];
  const amounts = history.map((h) => h.amount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const range = max - min || 1;
  const width = 400;
  const stepX = width / (history.length - 1);
  const points = amounts.map((v, i) => [i * stepX, 110 - ((v - min) / range) * 100] as const);
  const linePath = smoothLinePath(points);
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)},120 L${points[0][0].toFixed(1)},120 Z`;
  const [lastX, lastY] = points[points.length - 1];
  const previousReferenceAmount = HISTORY_REFERENCE[HISTORY_REFERENCE.length - 1].amount;
  const delta = totalAmount - previousReferenceAmount;
  const lastUpdated = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[radial-gradient(520px_240px_at_88%_-10%,rgba(45,214,197,0.09),transparent_60%),linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-5 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_16px_36px_rgba(0,0,0,0.19)]">
      <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-sand-400 dark:text-dash-text-muted">
        <TrendingUpIcon className="h-3.5 w-3.5 text-ink-500 dark:text-dash-teal" />
        Gefundenes Potenzial{currentPeriodLabel ? ` · ${currentPeriodLabel}` : ""}
      </span>

      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className={`${dashFontDisplayClass} text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] font-extrabold tabular-nums tracking-tight text-sand-900 dark:text-dash-text`}>
            {totalAmount.toLocaleString("de-DE")}&nbsp;€
          </span>
          {delta > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-1 text-[13px] font-bold text-ink-700 dark:bg-[rgba(45,214,197,0.10)] dark:text-dash-teal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M6 15l6-6 6 6" />
              </svg>
              {delta.toLocaleString("de-DE")}&nbsp;€ mehr als im {HISTORY_REFERENCE[HISTORY_REFERENCE.length - 1].label === "Jul" ? "Juli" : HISTORY_REFERENCE[HISTORY_REFERENCE.length - 1].label}
            </span>
          )}
        </div>
        <p className={`mt-1.5 ${dashTextSectionHeading} leading-snug text-sand-600 dark:text-[#a5bbcf]`}>
          In <b className="font-bold text-sand-900 dark:text-dash-text">{totalCount} Fällen</b> über vier Kategorien: {categoryList}
        </p>
      </div>

      <div className="relative mt-auto">
        {/* h-20 statt vormals h-14: bei h-14 (56px) blieb fuer die
            Wertschwankungen kaum sichtbare Hoehe uebrig, wodurch die Kurve wie
            ein flacher, in die Breite gezogener Strich wirkte ("kuenstlich
            gestreckt") statt wie eine lesbare Trendlinie - mehr Hoehe gibt der
            Kurvenform wieder echte Kontur. Dazu Catmull-Rom-Bezier statt
            gerader Liniensegmente (smoothLinePath) fuer eine weiche statt
            eckige Linie, sowie ein dezenter Teal-Glow (drop-shadow, nur im
            Dark Mode) als Premium-Touch.
            preserveAspectRatio="none" streckt den viewBox weiterhin nicht
            gleichmaessig auf die tatsaechliche Kartenbreite - fuer eine
            Sparkline (kategorische X-Achse, kein raeumliches Seitenverhaeltnis
            zu wahren) ist das grundsaetzlich korrekt, nur der Endpunkt-Kreis
            braeuchte dafuer einen echten Kreis: er wird daher bewusst NICHT
            als SVG-Kreis gezeichnet (wuerde zur Ellipse verzerrt), sondern als
            eigenes HTML-Element prozentual positioniert, mit vectorEffect auf
            der Linie fuer eine konstante Strichstaerke in echten Pixeln. */}
        <svg viewBox="0 0 400 130" preserveAspectRatio="none" aria-hidden="true" className="h-20 w-full overflow-visible">
          <defs>
            <linearGradient id="heroFindingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="text-dash-teal" style={{ stopColor: "currentColor", stopOpacity: 0.32 }} />
              <stop offset="100%" className="text-dash-teal" style={{ stopColor: "currentColor", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#heroFindingsFill)" />
          <path
            d={linePath}
            fill="none"
            className="text-ink-600 dark:text-dash-teal dark:drop-shadow-[0_0_6px_rgba(45,214,197,0.45)]"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          aria-hidden
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-600/15 dark:bg-dash-teal/25"
          style={{ left: `${(lastX / width) * 100}%`, top: `${(lastY / 130) * 100}%` }}
        />
        <span
          aria-hidden
          className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-600 bg-card dark:border-dash-teal dark:shadow-[0_0_8px_rgba(45,214,197,0.6)]"
          style={{ left: `${(lastX / width) * 100}%`, top: `${(lastY / 130) * 100}%` }}
        />
        <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-sand-400 dark:text-dash-text-muted">
          {history.map((h, i) => (
            <span key={h.label} className={i === history.length - 1 ? "text-ink-600 dark:text-dash-teal" : undefined}>
              {h.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-4 dark:border-dash-line">
        <Link
          href="/arbeitgeber/dashboard/faelle"
          className="inline-flex w-fit items-center gap-1.5 rounded-[11px] border border-ink-400/40 bg-gradient-to-br from-ink-500 to-ink-700 px-4 py-2.5 text-[13.5px] font-bold text-white shadow-warm-sm transition-transform hover:-translate-y-px dark:border-transparent dark:bg-[linear-gradient(150deg,#2dd6c5,#1fae9f)] dark:text-[#06231f]"
        >
          Alle Fälle prüfen
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <span className="text-[12.5px] text-sand-400 dark:text-dash-text-muted">Zuletzt aktualisiert: heute, {lastUpdated} Uhr</span>
      </div>
    </div>
  );
}
