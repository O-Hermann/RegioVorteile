import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { dashCardClass, dashModuleHoverClass, dashIconBoxClass, dashModuleFootClass, dashTextTitle } from "@/components/dashboard/dash-ui";
import { getFindingsSummary, type FindingCategory } from "@/components/dashboard/findings-list";

// "Prüfstatus"-Karte neben FindingsHero, 1:1 aus dem "Goldstandard"-Mockup
// (siehe [[effivo_mvp_roadmap]]): Gold-Icon-Box statt Teal, 12px-Radius.
// Offene Faelle kommt aus getFindingsSummary() (wie FindingsHero/
// FindingsList). "Zuletzt geprüft" kommt echt aus getLastReviewedAt()
// (letzter Fall, der auf REVIEWED gesetzt wurde) - "Noch keine Prüfung",
// solange kein Fall abgeschlossen wurde. "Ø Prüfzeit" bleibt bewusst eine
// Demoangabe: dem Case-Modell fehlt ein Zeitstempel dafuer, wann eine
// Pruefung BEGONNEN wurde (nur reviewedAt, wann sie abgeschlossen wurde) -
// die Zeit von createdAt bis reviewedAt waere Durchlaufzeit inklusive
// Wartezeit, keine echte Bearbeitungsdauer, siehe review-donut.tsx.
export function ReviewStatusCard({ findings, lastReviewedAt }: { findings: FindingCategory[]; lastReviewedAt: Date | null }) {
  const { totalCount } = getFindingsSummary(findings);
  const lastChecked = lastReviewedAt
    ? `${lastReviewedAt.toLocaleDateString("de-DE") === new Date().toLocaleDateString("de-DE") ? "heute" : lastReviewedAt.toLocaleDateString("de-DE")}, ${lastReviewedAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`
    : "Noch keine Prüfung";

  return (
    <div className={`flex h-full min-h-[150px] flex-col gap-5 p-6 ${dashCardClass} ${dashModuleHoverClass}`}>
      <div className="flex items-center gap-3">
        <span className={dashIconBoxClass}>
          <SearchIcon className="h-4 w-4" />
        </span>
        <div>
          <strong className={`block ${dashTextTitle} font-semibold text-dash-text`}>Prüfstatus</strong>
          <span className="text-[12px] text-dash-text-muted">{findings.length} Kategorien aktiv überwacht</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-dash-text-muted">Offene Fälle</span>
          <span className="text-[14px] font-semibold tabular-nums text-dash-text">{totalCount}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-dash-text-muted">Ø Prüfzeit</span>
          <span className="text-[14px] font-semibold tabular-nums text-dash-text">11 Min.</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-dash-text-muted">Zuletzt geprüft</span>
          <span className="text-[14px] font-semibold tabular-nums text-dash-text">{lastChecked}</span>
        </div>
      </div>

      <Link href="/arbeitgeber/dashboard/faelle" className={dashModuleFootClass}>
        Alle Fälle prüfen
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
