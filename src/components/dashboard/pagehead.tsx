import { CalendarIcon } from "@/components/icons";
import { dashFontDisplayClass } from "@/components/dashboard/dash-ui";

// Titelzeile der Übersicht-Seite, optisch 1:1 die ".page-head"-Sektion des
// freigegebenen HTML-Mockups: Begrüßung + Unterzeile (Unternehmen · Datum)
// links, zwei Status-Pills (Analysezeitraum, Daten aktuell) rechts. Enthält
// bewusst KEIN Avatar/Rollen-Badge/Zuordnungs-Button mehr (frühere Version
// dieser Komponente hatte das, weil die inzwischen entfernte linke
// KPI-Spalte dafür keinen Platz mehr bot) - im Mockup selbst gibt es diese
// Elemente im Seitenkopf nicht, "Datenimporte prüfen" wird bereits über die
// Handlungsbedarf-Leiste (attention-list.tsx) abgedeckt, nicht doppelt hier.
export function Pagehead({
  greeting,
  companyName,
  today,
  currentPeriodLabel,
  dataStatusReady,
}: {
  greeting: string;
  companyName: string;
  today: string;
  currentPeriodLabel: string | null;
  dataStatusReady: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-1">
      <div className="min-w-0">
        <h1 className={`${dashFontDisplayClass} truncate text-[26px] font-bold tracking-tight text-sand-900 dark:text-dash-text`}>{greeting}</h1>
        <p className="mt-1 truncate text-[14px] text-sand-500 dark:text-dash-text-secondary">
          {companyName} · {today}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {currentPeriodLabel && (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-card-border dark:border-dash-line bg-card dark:bg-dash-panel px-3 py-1.5 text-[12.5px] font-semibold text-sand-600 dark:text-dash-text-secondary">
            <CalendarIcon className="h-[13px] w-[13px]" />
            Analysezeitraum: {currentPeriodLabel}
          </span>
        )}
        {dataStatusReady && (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/40 bg-emerald-50 px-3 py-1.5 text-[12.5px] font-semibold text-emerald-700 dark:border-dash-green/40 dark:bg-[rgba(71,215,149,0.10)] dark:text-dash-green">
            <i className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-dash-green" />
            Daten aktuell
          </span>
        )}
      </div>
    </div>
  );
}
