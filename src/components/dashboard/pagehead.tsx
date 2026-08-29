import { CalendarIcon } from "@/components/icons";

// Titelzeile der Übersicht-Seite, 1:1 aus dem freigegebenen "Goldstandard"-
// Mockup (siehe [[effivo_mvp_roadmap]]): H1 40/48 statt vormals 26px, Pills
// mit 12px Radius statt Pille/999px, "Daten aktuell" jetzt in Gruen
// (dash-green) statt Emerald. Enthält bewusst KEIN Avatar/Rollen-Badge -
// siehe Kommentar-Historie, unveraendert seit dem V12-Port.
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
    <div className="flex flex-wrap items-end justify-between gap-4 pb-8 pt-2">
      <div className="min-w-0">
        <h1 className="truncate text-[40px] font-semibold leading-[48px] tracking-[-0.01em] text-dash-text">{greeting}</h1>
        <p className="mt-1.5 truncate text-[14px] leading-[20px] text-dash-text-muted">
          {companyName} · {today}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {currentPeriodLabel && (
          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-dash-line bg-dash-panel px-3.5 py-2.5 text-[12px] font-medium text-dash-text-secondary">
            <CalendarIcon className="h-[13px] w-[13px]" />
            Analysezeitraum: {currentPeriodLabel}
          </span>
        )}
        {dataStatusReady && (
          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-dash-good/30 bg-dash-panel px-3.5 py-2.5 text-[12px] font-medium text-dash-good">
            <i className="h-1.5 w-1.5 rounded-full bg-dash-good" />
            Daten aktuell
          </span>
        )}
      </div>
    </div>
  );
}
