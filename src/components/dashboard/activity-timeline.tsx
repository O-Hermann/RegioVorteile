import { relativeTimeDe } from "@/lib/time";
import {
  type DashAccent,
  dashFontDisplayClass,
  dashTextSectionHeading,
  dashTextBody,
  dashTextBodyLg,
  dashTextSecondaryLg,
  dashTextSecondarySm,
} from "@/components/dashboard/dash-ui";

export type ActivityTimelineItem = {
  id: string;
  category: string;
  title: string;
  detail: string;
  createdAt: Date;
  icon: (props: { className?: string }) => React.ReactElement;
  accent: DashAccent;
  highlight?: boolean;
};

const ICON_CLASS: Record<DashAccent, string> = {
  green: "text-emerald-600 dark:text-dash-green dark:border-dash-green/55",
  teal: "text-ink-700 dark:text-dash-teal dark:border-dash-teal/55",
  purple: "text-violet-600 dark:text-dash-purple dark:border-dash-purple/55",
  orange: "text-amber-600 dark:text-dash-orange dark:border-dash-orange/55",
  blue: "text-sky-600 dark:text-dash-blue dark:border-dash-blue/55",
  red: "text-rose-600 dark:text-dash-red dark:border-dash-red/55",
};

// "Letzte Aktivitäten"-Karte. Struktur 1:1 aus der V12-Referenz uebernommen:
// Timeline-Connector-Linie hinter den Zeilen, pro Zeile ein "ausgestanzter"
// Icon-Kreis (eigener Ring-Schatten durchbricht die Linie optisch), eine
// Zeile optional als "is-highlight" hervorgehoben, und ein separater
// Footer-Balken als eigene Grid-Zeile (kann daher nie von der Timeline
// ueberdeckt werden). Zeigt ausschliesslich echte Aktivitaeten aus
// ArbeitgeberDashboardPage (Einladungen/Aktivierungen/Importe) - "highlight"
// wird auf die neueste tatsaechlich positive Aktivitaet angewendet (z.B.
// "Datenimport verarbeitet"), nicht auf einen erfundenen "Fund", da es dafuer
// noch kein echtes Datenmodell gibt. Der Footer ist bewusst reiner Text ohne
// Link, da es noch keine eigene Aktivitaetsprotokoll-Seite gibt, auf die er
// echt verweisen koennte.
//
// Frueher gab es hier eine per Formel berechnete Mindesthoehe, damit Zeilen
// in der alten, auf eine feste Viewport-Hoehe begrenzten Seite nicht
// kollabierten/ueberlappten - mit dem MVP-Fokus (siehe findings-list.tsx)
// hat die Seite keine feste Hoehe mehr und fliesst natuerlich, daher faellt
// dieser Hack komplett weg.
export function ActivityTimeline({ items }: { items: ActivityTimelineItem[] }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[radial-gradient(310px_150px_at_94%_-5%,rgba(45,214,197,0.045),transparent_68%),linear-gradient(180deg,rgba(16,41,69,0.98),rgba(11,31,53,0.99))] p-3 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.032),0_16px_36px_rgba(0,0,0,0.19)]">
      <div className="mb-1 flex shrink-0 items-start justify-between gap-2">
        <div>
          <h3 className={`${dashFontDisplayClass} ${dashTextSectionHeading} font-bold tracking-tight text-sand-900 dark:text-dash-text`}>Letzte Aktivitäten</h3>
          <p className={`mt-0.5 ${dashTextBody} leading-snug text-sand-500 dark:text-dash-text-secondary`}>Chronologisches Protokoll deiner Aktivitäten.</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-card-border px-2 py-1 ${dashTextSecondaryLg} font-semibold text-sand-500 dark:border-[rgba(104,145,178,0.17)] dark:bg-white/[0.025] dark:text-dash-text-secondary`}>
          <i className="h-1.5 w-1.5 rounded-full bg-sand-400 dark:bg-dash-text-muted" />
          Heute
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-sand-500 dark:text-dash-text-secondary">Bisher sind keine Aktivitäten vorhanden.</p>
        </div>
      ) : (
        <div
          className="relative grid flex-1 gap-0.5 overflow-hidden before:absolute before:left-[19px] before:top-[18px] before:bottom-[18px] before:w-px before:content-[''] before:bg-sand-200 dark:before:bg-[linear-gradient(180deg,rgba(45,214,197,0.22),rgba(92,126,155,0.16)_58%,rgba(170,118,255,0.16))]"
          style={{ gridTemplateRows: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => (
            // "overflow-hidden" hier war unnoetig (border-radius clippt
            // background/border bereits nativ, ohne dass Inhalt beschnitten
            // wird) und schnitt bei der links buendig sitzenden 27px-
            // Icon-Kachel (0px Abstand zur Zeilen-Innenkante) sichtbar in den
            // Kreis + dessen "Ausstanz"-Ring hinein. Entfernt, zusaetzlich
            // etwas mehr Innenabstand (px-2.5 statt px-2) als Sicherheitsrand.
            // "py-1" wurde bewusst auf "py-0.5" reduziert: der 3-zeilige
            // Textblock (Kategorie/Zeit, Titel, Beschreibung) braucht bei den
            // im Readability-Pass vergroesserten Schriftgroessen mehr
            // Innenhoehe als die feste Zeilenhoehe hergab - dadurch war der
            // Textblock real hoeher als die Zeile, "items-center" zentrierte
            // ihn also innerhalb eines ueberlaufenden (nicht des sichtbaren)
            // Bereichs, wodurch Icon/Text optisch nach unten bzw. oben
            // verrutscht wirkten statt wirklich mittig zu sitzen. Gewonnene
            // Innenhoehe zusammen mit dem strafferen Leading unten (siehe
            // Text-Zeilen) schliesst diese Luecke, ohne Kartenhoehe oder
            // Schriftgroesse anzufassen.
            <div
              key={item.id}
              className={`relative z-[1] grid h-full min-h-0 grid-cols-[28px_minmax(0,1fr)_14px] items-center gap-2 rounded-xl border px-2.5 py-0.5 transition-[transform,background,border-color] duration-150 hover:-translate-y-px ${
                item.highlight
                  ? "border-emerald-300/50 bg-emerald-50/60 dark:border-[rgba(71,215,149,0.19)] dark:bg-transparent dark:bg-[linear-gradient(90deg,rgba(71,215,149,0.045),transparent_48%),linear-gradient(180deg,rgba(10,37,52,0.68),rgba(7,26,45,0.61))]"
                  : "border-card-border dark:border-[rgba(45,81,112,0.49)] bg-sand-50/50 dark:bg-[linear-gradient(180deg,rgba(8,29,50,0.66),rgba(7,25,44,0.58))]"
              }`}
            >
              <span
                className={`relative z-[2] flex h-[27px] w-[27px] items-center justify-center rounded-full border bg-card dark:bg-[#0a1f35] dark:shadow-[0_0_0_3px_#0d2139] ${ICON_CLASS[item.accent]}`}
              >
                <item.icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 leading-none">
                  <span className={`truncate ${dashTextSecondarySm} font-bold uppercase tracking-wide leading-none text-sand-400 dark:text-dash-text-muted`}>
                    {item.category}
                  </span>
                  <time className={`shrink-0 ${dashTextSecondaryLg} leading-none tabular-nums text-sand-400 dark:text-dash-text-secondary`}>
                    {relativeTimeDe(item.createdAt)}
                  </time>
                </div>
                <p className={`truncate ${dashTextBodyLg} font-bold leading-tight text-sand-900 dark:text-dash-text`}>{item.title}</p>
                <p className={`truncate ${dashTextSecondaryLg} leading-none text-sand-500 dark:text-dash-text-secondary`}>{item.detail}</p>
              </div>
              <span className="justify-self-end text-[12px] text-sand-300 dark:text-dash-text-muted">→</span>
            </div>
          ))}
        </div>
      )}

      <div className={`mt-1 flex shrink-0 items-center justify-between border-t border-card-border/70 dark:border-white/[0.055] pt-1 ${dashTextSecondaryLg}`}>
        <span className="text-sand-400 dark:text-dash-text-secondary">Vollständiges Aktivitätsprotokoll</span>
        <span className="font-semibold text-ink-600 dark:text-[#72eee6]">Bald verfügbar</span>
      </div>
    </div>
  );
}
