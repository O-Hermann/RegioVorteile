import Link from "next/link";
import { TrendingUpIcon } from "@/components/icons";
import { dashFontDisplayClass, dashTextSectionHeading } from "@/components/dashboard/dash-ui";
import { getFindingsSummary, type FindingCategory } from "@/components/dashboard/findings-list";

// Neuer Einstiegspunkt der Übersicht-Seite (ersetzt die bisherige, auf
// Umsatz ausgerichtete "StatusHero" + "KpiGrid"-Kombination der linken
// Spalte): die Kundenvorgabe fuer das MVP ist explizit, zuerst zu zeigen,
// wo Geld liegen bleibt (Doppelzahlungen/Skonto/Gutschriften/Überzahlung -
// siehe findings-list.tsx), nicht Umsatz/Kosten. Betrag und Fallzahl werden
// bewusst aus FINDINGS abgeleitet (getFindingsSummary()) statt hier separat
// gepflegt, damit Hero und Fund-Karten nie auseinanderlaufen koennen.
//
// Verlaufskurve entfernt (Audit 2026-08-29, siehe [[effivo_mvp_roadmap]]):
// die Karte zeigte bisher 5 Monate "Verlauf" vor dem aktuellen Wert, die
// erfundene Referenz-Demowerte waren, nicht die echte Historie der jeweiligen
// Firma - eine brandneue Firma ohne jeden Import sah trotzdem eine Kurve, die
// ~50-60T€ "gefundenes Potenzial" in den Vormonaten suggerierte. Es gibt im
// Datenmodell auch keine Grundlage, das nachtraeglich echt zu machen: die
// vier Detect*()-Funktionen berechnen immer den AKTUELLEN Gesamtbestand aus
// allen verarbeiteten FINANCE-Importen, es existiert kein monatlicher
// Snapshot des gefundenen Potenzials. Eine echte Verlaufsanzeige braeuchte
// eine eigene Snapshot-Tabelle (z.B. Betrag je Periode beim Verarbeiten
// festgehalten) - das ist ein eigenes Feature, kein Bugfix, daher hier bewusst
// nicht nebenbei nachgebaut. Bis dahin zeigt die Karte nur den echten
// aktuellen Wert, ohne einen unbelegbaren Trend zu behaupten.
export function FindingsHero({ findings, currentPeriodLabel }: { findings: FindingCategory[]; currentPeriodLabel: string | null }) {
  const { totalAmount, totalCount } = getFindingsSummary(findings);
  const categoryList = findings.map((f) => f.name).join(", ");
  const lastUpdated = new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[radial-gradient(520px_240px_at_88%_-10%,rgba(45,214,197,0.09),transparent_60%),linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-5 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_16px_36px_rgba(0,0,0,0.19)]">
      <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-sand-400 dark:text-dash-text-muted">
        <TrendingUpIcon className="h-3.5 w-3.5 text-ink-500 dark:text-dash-teal" />
        Gefundenes Potenzial{currentPeriodLabel ? ` · ${currentPeriodLabel}` : ""}
      </span>

      <div className="flex-1">
        <span className={`${dashFontDisplayClass} text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] font-extrabold tabular-nums tracking-tight text-sand-900 dark:text-dash-text`}>
          {totalAmount.toLocaleString("de-DE")}&nbsp;€
        </span>
        <p className={`mt-1.5 ${dashTextSectionHeading} leading-snug text-sand-600 dark:text-[#a5bbcf]`}>
          In <b className="font-bold text-sand-900 dark:text-dash-text">{totalCount} Fällen</b> über vier Kategorien: {categoryList}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-card-border pt-4 dark:border-dash-line">
        <Link
          href="/arbeitgeber/dashboard/faelle"
          className="inline-flex w-fit items-center gap-1.5 rounded-[11px] border border-ink-400/40 bg-gradient-to-br from-ink-500 to-ink-700 px-4 py-2.5 text-[13.5px] font-bold text-white shadow-warm-sm transition-transform hover:-translate-y-px dark:border-transparent dark:bg-[linear-gradient(150deg,#2dd6c5,#1fae9f)] dark:text-[#06231f]"
        >
          Alle Fälle prüfen
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <span className="text-[12.5px] text-sand-400 dark:text-dash-text-muted">Zuletzt aktualisiert: heute, {lastUpdated} Uhr</span>
      </div>
    </div>
  );
}
