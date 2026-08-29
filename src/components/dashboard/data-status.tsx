import Link from "next/link";
import { ArrowRightIcon, UploadIcon } from "@/components/icons";
import { dashCardClass, dashModuleHoverClass, dashIconBoxClass, dashModuleFootClass } from "@/components/dashboard/dash-ui";

// "Datenstatus"-Karte, 1:1 aus dem "Goldstandard"-Mockup (siehe
// [[effivo_mvp_roadmap]]): Gold-Icon-Box statt Teal, 12px-Radius. Ersetzt
// an dieser Stelle die bisherige "StatusHero", siehe Kommentar-Historie in
// page.tsx zu KpiGrid/AnalysisCompare/TrendChart (bewusst geparkt, nicht
// geloescht).
//
// Alle vier Zeilen sind echte Werte: Verarbeitete Monate/Belege aus den
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
    <div className={`flex h-full flex-col gap-4 p-6 ${dashCardClass} ${dashModuleHoverClass}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className={dashIconBoxClass}>
            <UploadIcon className="h-4 w-4" />
          </span>
          <h3 className="text-[16px] font-semibold text-dash-text">Datenstatus</h3>
        </div>
        {currentPeriodLabel && (
          <span className="rounded-lg border border-dash-line px-2.5 py-1 text-[12px] font-semibold text-dash-text-muted">{currentPeriodLabel}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        <StatusRow label="Verarbeitete Monate" value={processedMonthCount} />
        <StatusRow label="Verarbeitete Belege" value={processedRowCount.toLocaleString("de-DE")} />
        <StatusRow label="Offene Datenimporte" value={pendingMappingCount} valueClassName={pendingMappingCount > 0 ? "text-dash-warn" : undefined} />
        <StatusRow label="Offene Datenfehler" value={failedImportCount} valueClassName={failedImportCount > 0 ? "text-dash-bad" : "text-dash-good"} />
      </div>

      <Link href="/arbeitgeber/dashboard/datenimporte" className={dashModuleFootClass}>
        Alle Datenimporte
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function StatusRow({ label, value, valueClassName }: { label: string; value: string | number; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-dash-text-muted">{label}</span>
      <span className={`text-[14px] font-semibold tabular-nums text-dash-text ${valueClassName ?? ""}`}>{value}</span>
    </div>
  );
}
