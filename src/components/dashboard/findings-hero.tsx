import { TrendingUpIcon } from "@/components/icons";
import { dashFontDisplayClass, dashTextSectionHeading } from "@/components/dashboard/dash-ui";
import { FINDINGS, getFindingsSummary } from "@/components/dashboard/findings-list";

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

// "Alle Fälle prüfen" hat wie in QuickActions/AttentionList noch kein
// echtes Ziel (Arbeitsliste/Fallpruefung sind laut Aufgabenstellung
// zukuenftige Arbeit) und ist daher bewusst kein Link, sondern ein
// deaktiviert wirkender Button - siehe Kommentar in quick-actions.tsx.
export function FindingsHero({ currentPeriodLabel }: { currentPeriodLabel: string | null }) {
  const { totalAmount, totalCount } = getFindingsSummary();
  const categoryList = FINDINGS.map((f) => f.name).join(", ");

  const history = [...HISTORY_REFERENCE, { label: "Aug", amount: totalAmount }];
  const amounts = history.map((h) => h.amount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const range = max - min || 1;
  const width = 400;
  const stepX = width / (history.length - 1);
  const points = amounts.map((v, i) => [i * stepX, 110 - ((v - min) / range) * 100] as const);
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
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

      <div className="mt-auto">
        <svg viewBox="0 0 400 130" preserveAspectRatio="none" aria-hidden="true" className="h-[108px] w-full overflow-visible">
          <defs>
            <linearGradient id="heroFindingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="text-dash-teal" style={{ stopColor: "currentColor", stopOpacity: 0.32 }} />
              <stop offset="100%" className="text-dash-teal" style={{ stopColor: "currentColor", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <g stroke="currentColor" strokeWidth={1} className="text-sand-200 dark:text-white/[0.06]">
            <path d="M0,30 H400 M0,70 H400 M0,110 H400" />
          </g>
          <path d={areaPath} fill="url(#heroFindingsFill)" />
          <path d={linePath} fill="none" className="text-ink-600 dark:text-dash-teal" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastX} cy={lastY} r={10} className="text-ink-600 dark:text-dash-teal" fill="currentColor" opacity={0.16} />
          <circle cx={lastX} cy={lastY} r={4} className="fill-card text-ink-600 dark:text-dash-teal" stroke="currentColor" strokeWidth={2.4} />
        </svg>
        <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-sand-400 dark:text-dash-text-muted">
          {history.map((h, i) => (
            <span key={h.label} className={i === history.length - 1 ? "text-ink-600 dark:text-dash-teal" : undefined}>
              {h.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-4 dark:border-dash-line">
        <span
          aria-disabled
          title="Noch nicht verfügbar"
          className="inline-flex w-fit cursor-default items-center gap-1.5 rounded-[11px] border border-ink-400/40 bg-gradient-to-br from-ink-500 to-ink-700 px-4 py-2.5 text-[13.5px] font-bold text-white shadow-warm-sm dark:border-transparent dark:bg-[linear-gradient(150deg,#2dd6c5,#1fae9f)] dark:text-[#06231f]"
        >
          Alle Fälle prüfen
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
        <span className="text-[12.5px] text-sand-400 dark:text-dash-text-muted">Zuletzt aktualisiert: heute, {lastUpdated} Uhr</span>
      </div>
    </div>
  );
}
