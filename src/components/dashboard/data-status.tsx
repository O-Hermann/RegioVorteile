import Link from "next/link";
import { ArrowRightIcon, UploadIcon } from "@/components/icons";
import { dashCardClass, dashIconBoxClass } from "@/components/dashboard/dash-ui";

// "Datenstatus"-Karte, optisch 1:1 das Mockup-Panel neben "Prüfübersicht"
// (gleiche schlichte ".panel"-Kartenoptik, keine Farbverlaeufe). Ersetzt an
// dieser Stelle die bisherige "StatusHero" (die grosse tuerkise Farbverlauf-
// karte mit "Analyse abgeschlossen"-Text) - die passt optisch zu keinem
// anderen Element mehr, seit die Seite auf den Fund-Kategorien-Fokus
// umgestellt wurde, und kommt im freigegebenen Mockup an dieser Stelle so
// auch nicht vor. StatusHero-Datei bleibt bewusst erhalten (nicht geloescht,
// siehe Kommentar in page.tsx zu KpiGrid/AnalysisCompare/TrendChart), nur
// nicht mehr gerendert.
//
// Alle vier Zeilen sind echte Werte (kein Referenz-Demowert wie in
// findings-list.tsx/review-donut.tsx): Verarbeitete Monate/Belege aus den
// tatsaechlich verarbeiteten Datenimporten, Offene Datenimporte aus der auf
// der Seite ohnehin vorhandenen pendingMappingCount, Offene Datenfehler aus
// echten FAILED/VALIDATION_FAILED-Importen.
export function DataStatusCard({
  processedMonthCount,
  processedRowCount,
  pendingMappingCount,
  failedImportCount,
  currentPeriodLabel,
}: {
  processedMonthCount: number;
  processedRowCount: number;
  pendingMappingCount: number;
  failedImportCount: number;
  currentPeriodLabel: string | null;
}) {
  return (
    <div className={`flex h-full flex-col gap-3.5 ${dashCardClass} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={dashIconBoxClass}>
            <UploadIcon className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-[15.5px] font-bold text-sand-900 dark:text-dash-text">Datenstatus</h3>
        </div>
        {currentPeriodLabel && (
          <span className="rounded-full border border-card-border dark:border-dash-line px-2.5 py-1 text-[11.5px] font-semibold text-sand-500 dark:text-dash-text-secondary">
            {currentPeriodLabel}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2.5">
        <StatusRow label="Verarbeitete Monate" value={processedMonthCount} />
        <StatusRow label="Verarbeitete Belege" value={processedRowCount.toLocaleString("de-DE")} />
        <StatusRow label="Offene Datenimporte" value={pendingMappingCount} valueClassName={pendingMappingCount > 0 ? "text-dash-orange" : undefined} />
        <StatusRow label="Offene Datenfehler" value={failedImportCount} valueClassName={failedImportCount > 0 ? "text-dash-red" : "text-dash-green"} />
      </div>

      <Link
        href="/arbeitgeber/dashboard/datenimporte"
        className="mt-auto flex items-center justify-between gap-2 rounded-xl border border-ink-400/20 bg-ink-50/60 px-3 py-2.5 text-[13px] font-semibold text-ink-700 transition-colors dark:border-dash-teal/15 dark:bg-[rgba(45,214,197,0.06)] dark:text-dash-teal"
      >
        Alle Datenimporte
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function StatusRow({ label, value, valueClassName }: { label: string; value: string | number; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12.5px] text-sand-500 dark:text-dash-text-secondary">{label}</span>
      <span className={`text-[13px] font-bold tabular-nums text-sand-900 dark:text-dash-text ${valueClassName ?? ""}`}>{value}</span>
    </div>
  );
}
