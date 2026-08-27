import { TrendingUpIcon } from "@/components/icons";
import { DASH_ACCENT_HEX, dashTextSectionHeading } from "@/components/dashboard/dash-ui";
import { FINDINGS, getFindingsSummary } from "@/components/dashboard/findings-list";

// Neuer Einstiegspunkt der Übersicht-Seite (ersetzt die bisherige, auf
// Umsatz ausgerichtete "StatusHero" + "KpiGrid"-Kombination der linken
// Spalte): die Kundenvorgabe fuer das MVP ist explizit, zuerst zu zeigen,
// wo Geld liegen bleibt (Doppelzahlungen/Skonto/Gutschriften/Überzahlung -
// siehe findings-list.tsx), nicht Umsatz/Kosten. Betrag und Fallzahl werden
// bewusst aus FINDINGS abgeleitet (getFindingsSummary()) statt hier separat
// gepflegt, damit Hero und Fund-Karten nie auseinanderlaufen koennen.
//
// "Alle Fälle prüfen" hat wie in QuickActions/AttentionList noch kein
// echtes Ziel (Arbeitsliste/Fallpruefung sind laut Aufgabenstellung
// zukuenftige Arbeit) und ist daher bewusst kein Link, sondern ein
// deaktiviert wirkender Button - siehe Kommentar in quick-actions.tsx.
export function FindingsHero({ currentPeriodLabel }: { currentPeriodLabel: string | null }) {
  const { totalAmount, totalCount } = getFindingsSummary();
  const categoryList = FINDINGS.map((f) => f.name).join(", ");

  return (
    <div className="relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[radial-gradient(520px_240px_at_88%_-10%,rgba(37,216,206,0.09),transparent_60%),linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-5 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_16px_36px_rgba(0,0,0,0.19)]">
      <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-sand-400 dark:text-[#7897af]">
        <TrendingUpIcon className="h-3.5 w-3.5 text-ink-500 dark:text-dash-teal" />
        Gefundenes Potenzial{currentPeriodLabel ? ` · ${currentPeriodLabel}` : ""}
      </span>

      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] font-extrabold tabular-nums tracking-tight text-sand-900 dark:text-dash-text">
            {totalAmount.toLocaleString("de-DE")}&nbsp;€
          </span>
        </div>
        <p className={`mt-1.5 ${dashTextSectionHeading} leading-snug text-sand-600 dark:text-[#a5bbcf]`}>
          In <b className="font-bold text-sand-900 dark:text-dash-text">{totalCount} Fällen</b> über vier Kategorien: {categoryList}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FINDINGS.map((f) => (
          <span
            key={f.key}
            style={{ "--case-accent": DASH_ACCENT_HEX[f.accent] } as React.CSSProperties}
            className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-sand-50/70 px-2.5 py-1 text-[11.5px] font-semibold text-sand-600 dark:border-[rgba(85,125,156,0.20)] dark:bg-[rgba(5,23,41,0.45)] dark:text-[#a5bbcf]"
          >
            <i className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--case-accent)" }} />
            {f.name}
          </span>
        ))}
      </div>

      <span
        aria-disabled
        title="Noch nicht verfügbar"
        className="mt-1 inline-flex w-fit cursor-default items-center gap-2 rounded-full border border-ink-400/40 bg-gradient-to-b from-ink-600 to-ink-800 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-warm-sm dark:border-dash-teal/30 dark:bg-[linear-gradient(135deg,rgba(17,101,105,0.72),rgba(8,50,67,0.95))]"
      >
        Alle Fälle prüfen →
      </span>
    </div>
  );
}
