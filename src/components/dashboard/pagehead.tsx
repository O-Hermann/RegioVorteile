import Link from "next/link";
import { CalendarIcon } from "@/components/icons";

// Titelzeile + Filter-/Fokusreihe der Übersicht-Seite, optisch die V12-
// ".pagehead"-Sektion. Bewusst NUR auf dieser Seite (nicht im geteilten
// App-Header aus layout.tsx) - siehe Rueckfrage/Entscheidung im Rahmen des
// V12-Portierungsauftrags. Von den vier Demo-Filterchips der Referenz
// ("Analysezeitraum/Ansicht/Quelle/Fokus") bleibt nur "Analysezeitraum"
// erhalten, da nur dafuer ein echter Wert existiert (aktueller verarbeiteter
// Zeitraum) - die uebrigen drei waeren in der Referenz ohnehin rein
// dekorative, nicht verdrahtete Buttons ohne echte Funktion dahinter; sie
// hier mit erfundenen Werten ("Alle Unternehmen", "DATEV-Importe") zu
// fuellen wuerde echte Funktionalitaet vortaeuschen, die es nicht gibt.
export function Pagehead({
  today,
  currentPeriodLabel,
  dataStatusReady,
  pendingMappingCount,
}: {
  today: string;
  currentPeriodLabel: string | null;
  dataStatusReady: boolean;
  pendingMappingCount: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-[26px] font-bold tracking-tight text-sand-900 dark:text-dash-text">Effivo-Übersicht</h1>
          {dataStatusReady && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/50 bg-emerald-50 px-2 py-1 text-[10.5px] font-semibold text-emerald-700 dark:border-[rgba(50,215,154,0.13)] dark:bg-[rgba(50,215,154,0.045)] dark:text-[#92cdb4]">
              <i className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-dash-green" />
              Daten aktuell
            </span>
          )}
        </div>
        {currentPeriodLabel && (
          <div className="mt-1.5 flex items-center gap-1.5 rounded-full border border-ink-400/30 bg-ink-50 px-2.5 py-1.5 text-[11px] text-ink-700 dark:border-dash-teal/20 dark:bg-[linear-gradient(180deg,rgba(14,47,64,0.72),rgba(8,30,47,0.78))] dark:text-[#88a2bb] w-fit">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-ink-500 dark:text-dash-teal" />
            <span className="text-sand-500 dark:text-[#88a2bb]">Analysezeitraum</span>
            <b className="font-semibold text-sand-900 dark:text-white">{currentPeriodLabel}</b>
          </div>
        )}
      </div>

      <div className="flex items-end gap-3">
        <div className="text-right leading-snug">
          <b className="block text-[13px] font-semibold text-sand-800 dark:text-[#dce9f5]">{today}</b>
        </div>
        {pendingMappingCount > 0 && (
          <Link
            href="/arbeitgeber/dashboard/datenimporte"
            className="flex h-11 items-center gap-2.5 rounded-xl border border-ink-400/40 bg-gradient-to-b from-ink-600 to-ink-800 px-3.5 text-white shadow-warm-sm transition-transform hover:-translate-y-px dark:border-dash-teal/30 dark:bg-[linear-gradient(135deg,rgba(17,101,105,0.72),rgba(8,50,67,0.95))]"
          >
            <span className="flex flex-col items-start leading-tight">
              <small className="text-[8.5px] uppercase tracking-wide text-white/70">Zuordnung</small>
              <strong className="text-[11.5px] font-bold">Datenimporte prüfen</strong>
            </span>
            <span className="ml-1 rounded-full bg-white/15 px-2 py-1 text-[11px] font-extrabold">{pendingMappingCount}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
