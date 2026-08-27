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
//
// Mit dem MVP-Fokus (siehe findings-list.tsx) traegt dieser Kopf zusaetzlich
// die persoenliche Begruessung + Avatar + Rolle/Unternehmen, die vorher in
// der jetzt entfernten linken Spalte (KPI-Raster) lebten - die Seite hat
// keine Spalten mehr, daher braucht die Begruessung einen neuen, aber
// weiterhin einzigen Platz ganz oben.
export function Pagehead({
  greeting,
  avatarInitial,
  roleLabel,
  companyName,
  today,
  currentPeriodLabel,
  dataStatusReady,
  pendingMappingCount,
}: {
  greeting: string;
  avatarInitial: string;
  roleLabel: string;
  companyName: string;
  today: string;
  currentPeriodLabel: string | null;
  dataStatusReady: boolean;
  pendingMappingCount: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 dark:bg-[radial-gradient(circle_at_28%_20%,rgba(218,255,252,0.2),transparent_36%),linear-gradient(145deg,#31cfc6,#117d7a_72%)] font-display text-base font-bold text-white shadow-md shadow-ink-900/20 dark:border dark:border-[rgba(118,241,233,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_18px_rgba(4,94,91,0.17)]">
          {avatarInitial}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-400 shadow-[0_0_8px_rgba(88,227,166,0.42)] dark:border-[#0e223b] dark:bg-[#58e3a6]" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display truncate text-[24px] font-bold tracking-tight text-sand-900 dark:text-dash-text">{greeting}</h1>
            {dataStatusReady && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300/50 bg-emerald-50 px-2 py-1 text-[10.5px] font-semibold text-emerald-700 dark:border-[rgba(50,215,154,0.13)] dark:bg-[rgba(50,215,154,0.045)] dark:text-[#92cdb4]">
                <i className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-dash-green" />
                Daten aktuell
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-gold-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:bg-[linear-gradient(180deg,rgba(45,69,95,0.92),rgba(34,54,78,0.92))] dark:text-[#f2f7fb] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] dark:border dark:border-[rgba(113,150,181,0.13)]">
              {roleLabel}
            </span>
            <span className="truncate text-[11px] text-sand-500 dark:text-[#9eb8cf]">{companyName}</span>
            {currentPeriodLabel && (
              <span className="flex items-center gap-1.5 rounded-full border border-ink-400/30 bg-ink-50 px-2.5 py-1 text-[11px] text-ink-700 dark:border-dash-teal/20 dark:bg-transparent dark:bg-[linear-gradient(180deg,rgba(14,47,64,0.72),rgba(8,30,47,0.78))] dark:text-[#88a2bb]">
                <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-ink-500 dark:text-dash-teal" />
                <span className="text-sand-500 dark:text-[#88a2bb]">Analysezeitraum</span>
                <b className="font-semibold text-sand-900 dark:text-white">{currentPeriodLabel}</b>
              </span>
            )}
          </div>
        </div>
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
