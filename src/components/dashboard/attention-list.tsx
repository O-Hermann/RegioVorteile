import Link from "next/link";
import { AlertTriangleIcon, CheckCircleIcon } from "@/components/icons";
import { DASH_ACCENT_HEX, type DashAccent, dashFontDisplayClass, dashTextBody, dashTextBodyLg, dashTextSecondaryLg, dashTextSecondarySm } from "@/components/dashboard/dash-ui";

export type AttentionItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: (props: { className?: string }) => React.ReactElement;
  accent: DashAccent;
  priority?: boolean;
  href: string;
  cta: string;
};

const BUBBLE_CLASS: Record<DashAccent, string> = {
  red: "text-rose-600 bg-rose-500/10 border border-rose-500/30 dark:text-dash-red dark:bg-[rgba(255,117,109,0.12)] dark:border-dash-red/60",
  orange:
    "text-amber-600 bg-amber-500/10 border border-amber-500/30 dark:text-dash-orange dark:bg-[rgba(226,171,72,0.12)] dark:border-dash-orange/60",
  blue: "text-sky-600 bg-sky-500/10 border border-sky-500/30 dark:text-dash-blue dark:bg-[rgba(99,170,255,0.1)] dark:border-dash-blue/60",
  purple:
    "text-violet-600 bg-violet-500/10 border border-violet-500/30 dark:text-dash-purple dark:bg-[rgba(170,118,255,0.1)] dark:border-dash-purple/60",
  green:
    "text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 dark:text-dash-green dark:bg-[rgba(71,215,149,0.1)] dark:border-dash-green/60",
  teal: "text-ink-700 bg-ink-500/10 border border-ink-500/30 dark:text-dash-teal dark:bg-[rgba(45,214,197,0.09)] dark:border-dash-teal/60",
};

// "Handlungsbedarf"-Band, jetzt eine schlanke horizontale Leiste direkt unter
// dem Seitenkopf statt einer hohen Karte in einer dritten Spalte - die alte
// dritte Spalte (KPI-Raster/Analysevergleich/Handlungsbedarf nebeneinander,
// alle auf eine feste Viewport-Hoehe gepresst) gibt es mit dem MVP-Fokus auf
// die vier Fund-Kategorien (siehe findings-list.tsx) nicht mehr - die Seite
// fliesst jetzt natuerlich und scrollt bei Bedarf, wie jede andere Seite der
// App auch. Dadurch faellt der komplette bisherige Hoehen-Hack weg (feste
// "min-h"-Formel + "flex: 1.35" gegen die Nachbarkarte "Letzte Aktivitäten"),
// der ausschliesslich noetig war, damit Zeilen in der alten, hoehenbegrenzten
// Karte nicht kollabierten/ueberlappten.
//
// Inhaltlich weiterhin ausschliesslich echte offene Punkte aus
// ArbeitgeberDashboardPage (aktuell: fehlender Import / offene Zuordnung) -
// siehe Kommentar dort zu den bewusst nicht uebernommenen erfundenen
// Kennzahlen-Kacheln aus der Referenz.
export function AttentionList({ items }: { items: AttentionItem[] }) {
  const hasItems = items.length > 0;
  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 shadow-warm-sm ${
        hasItems
          ? "border-gold-300/50 bg-[linear-gradient(120deg,rgba(215,164,52,0.07),transparent_70%)] dark:border-[rgba(224,171,72,0.28)] dark:bg-[linear-gradient(120deg,rgba(224,171,72,0.055),transparent_70%),linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))]"
          : "border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))]"
      }`}
    >
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
            hasItems
              ? "bg-gold-100 text-gold-700 dark:bg-[rgba(224,171,72,0.13)] dark:text-[#e2ab48]"
              : "bg-emerald-100 text-emerald-600 dark:bg-[rgba(71,215,149,0.12)] dark:text-dash-green"
          }`}
        >
          {hasItems ? <AlertTriangleIcon className="h-[18px] w-[18px]" /> : <CheckCircleIcon className="h-[18px] w-[18px]" />}
        </span>
        <div>
          <strong className={`${dashFontDisplayClass} block ${dashTextBodyLg} font-bold text-sand-900 dark:text-dash-text`}>Handlungsbedarf</strong>
          <span className={`${dashTextSecondarySm} text-sand-500 dark:text-[#7fa1bd]`}>
            {hasItems ? `${items.length} ${items.length === 1 ? "Punkt braucht" : "Punkte brauchen"} heute deine Aufmerksamkeit` : "Alles erledigt"}
          </span>
        </div>
      </div>

      {!hasItems ? (
        <p className={`${dashTextBody} text-sand-500 dark:text-[#7fa1bd]`}>Aktuell besteht kein Handlungsbedarf.</p>
      ) : (
        <div className="flex min-w-0 flex-1 flex-wrap gap-2.5">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              style={{ "--case-accent": DASH_ACCENT_HEX[item.accent] } as React.CSSProperties}
              className="relative flex min-w-0 flex-1 basis-[240px] items-center gap-2.5 overflow-hidden rounded-xl border border-card-border dark:border-[rgba(39,71,101,0.5)] bg-sand-50/60 dark:bg-[linear-gradient(180deg,rgba(8,29,50,0.68),rgba(7,25,44,0.62))] py-2 pl-3 pr-3.5 transition-[transform,border-color] duration-150 hover:-translate-y-px hover:border-ink-400 dark:hover:border-[rgba(71,119,156,0.78)]"
            >
              <span
                aria-hidden
                className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full opacity-70"
                style={{ background: "var(--case-accent)" }}
              />
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${BUBBLE_CLASS[item.accent]}`}>
                <item.icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {item.priority && (
                    <span className="shrink-0 rounded-full border border-rose-300/50 bg-rose-100/70 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-rose-600 dark:border-dash-red/20 dark:bg-dash-red/10 dark:text-[#ff908a]">
                      Priorität
                    </span>
                  )}
                  <span className={`truncate ${dashTextBody} font-bold text-sand-900 dark:text-dash-text`}>{item.title}</span>
                </div>
                {item.subtitle && <span className={`truncate ${dashTextSecondaryLg} text-sand-500 dark:text-[#7897b3]`}>{item.subtitle}</span>}
              </div>
              <span className={`shrink-0 ${dashTextSecondaryLg} font-semibold text-ink-600 dark:text-[#8db2ca]`}>{item.cta} →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
