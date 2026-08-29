import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { dashFontDisplayClass } from "@/components/dashboard/dash-ui";
import { getFindingsSummary, type FindingCategory } from "@/components/dashboard/findings-list";

// "Prüfstatus"-Karte neben FindingsHero, optisch 1:1 aus dem freigegebenen
// HTML-Mockup uebernommen. Offene Faelle kommt bewusst aus
// getFindingsSummary() (wie FindingsHero/FindingsList), Ø Prüfzeit ist wie
// in review-donut.tsx eine Referenz-Demoangabe (kein echtes
// Fallpruefungs-Datenmodell), "Zuletzt geprüft" ist dagegen echt der
// aktuelle Server-Zeitpunkt statt einer im Mockup fest eingetragenen Uhrzeit.
export function ReviewStatusCard({ findings }: { findings: FindingCategory[] }) {
  const { totalCount } = getFindingsSummary(findings);
  const now = new Date();
  const lastChecked = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex h-full min-h-[150px] flex-col gap-4 rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-5 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.032),0_16px_36px_rgba(0,0,0,0.19)]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] text-ink-700 dark:text-dash-teal bg-ink-400/15 dark:bg-transparent dark:bg-[linear-gradient(180deg,rgba(45,214,197,0.14),rgba(45,214,197,0.07))] border border-ink-400/25 dark:border-[rgba(45,214,197,0.14)]">
          <SearchIcon className="h-3.5 w-3.5" />
        </span>
        <div>
          <strong className={`${dashFontDisplayClass} block text-[14.5px] font-bold text-sand-900 dark:text-dash-text`}>Prüfstatus</strong>
          <span className="text-[12px] text-sand-500 dark:text-dash-text-secondary">{findings.length} Kategorien aktiv überwacht</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12.5px] text-sand-500 dark:text-dash-text-secondary">Offene Fälle</span>
          <span className="text-[13px] font-bold tabular-nums text-sand-900 dark:text-dash-text">{totalCount}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12.5px] text-sand-500 dark:text-dash-text-secondary">Ø Prüfzeit</span>
          <span className="text-[13px] font-bold tabular-nums text-sand-900 dark:text-dash-text">11 Min.</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12.5px] text-sand-500 dark:text-dash-text-secondary">Zuletzt geprüft</span>
          <span className="text-[13px] font-bold tabular-nums text-sand-900 dark:text-dash-text">heute, {lastChecked}</span>
        </div>
      </div>

      <Link
        href="/arbeitgeber/dashboard/faelle"
        className="mt-auto flex shrink-0 items-center justify-between gap-2 border-t border-card-border/70 dark:border-white/[0.06] pt-3 text-[13px] font-semibold text-ink-600 transition-colors hover:text-ink-700 dark:text-dash-teal dark:hover:text-[#5cf0e2]"
      >
        Alle Fälle prüfen
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
