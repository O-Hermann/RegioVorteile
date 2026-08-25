import Link from "next/link";
import { CheckCircleIcon } from "@/components/icons";
import { DASH_ACCENT_HEX, type DashAccent } from "@/components/dashboard/dash-ui";

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
  red: "text-rose-600 bg-rose-500/10 border border-rose-500/30 dark:text-dash-red dark:bg-[rgba(255,98,93,0.12)] dark:border-dash-red/60",
  orange:
    "text-amber-600 bg-amber-500/10 border border-amber-500/30 dark:text-dash-orange dark:bg-[rgba(240,162,62,0.12)] dark:border-dash-orange/60",
  blue: "text-sky-600 bg-sky-500/10 border border-sky-500/30 dark:text-dash-blue dark:bg-[rgba(79,159,255,0.1)] dark:border-dash-blue/60",
  purple:
    "text-violet-600 bg-violet-500/10 border border-violet-500/30 dark:text-dash-purple dark:bg-[rgba(170,118,255,0.1)] dark:border-dash-purple/60",
  green:
    "text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 dark:text-dash-green dark:bg-[rgba(50,215,154,0.1)] dark:border-dash-green/60",
  teal: "text-ink-700 bg-ink-500/10 border border-ink-500/30 dark:text-dash-teal dark:bg-[rgba(37,216,206,0.09)] dark:border-dash-teal/60",
};

// "Handlungsbedarf"-Karte, rechte Spalte. Diese Sektion ist laut Vorgabe der
// mit Abstand fragilste Teil der V12-Referenz (siehe deren eigene v11.2 bis
// v11.14-Korrekturebenen) - die Zeilen-Geometrie wird daher bewusst technisch
// 1:1 uebernommen: Icon+Text vertikal zentriert, Text linksbuendig, und die
// Akzentleiste links ist bei JEDER Zeile exakt 2px breit / 24px hoch / 72%
// Deckkraft - unabhaengig davon, ob "priority" gesetzt ist. Es gibt bewusst
// KEINEN zusaetzlichen inset-Schatten auf Prioritaets-Zeilen (das war genau
// der Fehler, den v11.11 in der Referenz behoben hat).
//
// Inhaltlich zeigt diese Komponente ausschliesslich echte offene Punkte aus
// ArbeitgeberDashboardPage (aktuell: fehlender Import / offene Zuordnung).
// Die Kennzahlen-Kacheln ("Offene Pruefungen 34" / "Hohe Prioritaet 5.630 €")
// und der Fusszeilen-Hinweis aus der Referenz sind bewusst NICHT uebernommen:
// beide beruhen dort auf einem Fallpruefungs-/Funde-Datenmodell, das es in
// diesem Projekt noch nicht gibt (Arbeitsliste/Fallpruefung sind explizit
// zukuenftige Arbeit) - erfundene Zahlen waeren Platzhalter-Content anstelle
// echter Werte.
export function AttentionList({ items }: { items: AttentionItem[] }) {
  return (
    <div className="flex flex-1 basis-0 flex-col overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-3 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.032),0_16px_36px_rgba(0,0,0,0.19)] min-[1400px]:min-h-0">
      <div className="mb-2 shrink-0">
        <h3 className="font-display text-[15px] font-bold tracking-tight text-sand-900 dark:text-dash-text">Handlungsbedarf</h3>
        <p className="mt-0.5 text-[11px] leading-snug text-sand-500 dark:text-[#7fa1bd]">
          Priorisierte Punkte, die heute Aufmerksamkeit brauchen.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 text-emerald-600 dark:text-emerald-200 border border-emerald-400/30 dark:border-emerald-300/25 ring-1 ring-inset ring-white/10">
            <CheckCircleIcon className="h-5 w-5" />
          </span>
          <p className="text-sm text-sand-500 dark:text-[#7fa1bd]">Aktuell besteht kein Handlungsbedarf.</p>
        </div>
      ) : (
        <div
          className="grid flex-1 gap-1.5 overflow-hidden"
          style={{ gridTemplateRows: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              style={{ "--case-accent": DASH_ACCENT_HEX[item.accent] } as React.CSSProperties}
              className={`relative grid h-full min-h-0 grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-xl border px-2.5 py-1 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-px ${
                item.priority
                  ? "border-rose-300/60 bg-rose-50/60 dark:border-[rgba(255,98,93,0.24)] dark:bg-[linear-gradient(90deg,rgba(82,33,40,0.28),rgba(8,29,50,0.72)_34%,rgba(7,25,44,0.66))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_8px_18px_rgba(42,10,13,0.09)]"
                  : "border-card-border dark:border-[rgba(39,71,101,0.5)] bg-sand-50/60 dark:bg-[linear-gradient(180deg,rgba(8,29,50,0.68),rgba(7,25,44,0.62))]"
              }`}
            >
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full opacity-70"
                style={{ background: "var(--case-accent)" }}
              />
              <span className={`flex h-7 w-7 items-center justify-center justify-self-center rounded-full ${BUBBLE_CLASS[item.accent]}`}>
                <item.icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex min-w-0 flex-col justify-center text-left">
                <span className="flex min-w-0 items-center gap-1.5">
                  {item.priority && (
                    <span className="shrink-0 rounded-full border border-rose-300/50 bg-rose-100/70 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-rose-600 dark:border-dash-red/20 dark:bg-dash-red/10 dark:text-[#ff908a]">
                      Priorität
                    </span>
                  )}
                  <span className="truncate text-[12.5px] font-bold text-sand-900 dark:text-dash-text">{item.title}</span>
                </span>
                {item.subtitle && (
                  <span className="truncate text-[10.5px] text-sand-500 dark:text-[#7897b3]">{item.subtitle}</span>
                )}
              </div>
              <span className="shrink-0 text-[10.5px] font-semibold text-ink-600 dark:text-[#8db2ca]">{item.cta} →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
