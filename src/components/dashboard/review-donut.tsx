import {
  dashTextTitle,
  dashTextBody,
  dashTextBodyLg,
  dashTextSecondaryLg,
  dashTextSecondarySm,
  dashTextDonutNumber,
  dashDonutSizeClass,
  dashDonutInsetClass,
  dashDonutColClass,
} from "@/components/dashboard/dash-ui";

// "Prüfübersicht"-Karte, optisch 1:1 die V12-".v10-review"-Karte (Donut per
// conic-gradient, Legende, Statuszeile). Es gibt fuer diese Karte noch KEIN
// echtes Fallpruefungs-Datenmodell im Projekt (Arbeitsliste/Fallpruefung
// sind laut Aufgabenstellung explizit zukuenftige Arbeit) - die Werte sind
// daher unveraendert die Referenz-Demowerte, keine erfundenen "eigenen"
// Zahlen. Sobald ein echtes Faelle-Modell existiert, ist ausschliesslich
// diese Komponente anzupassen (ein Owner, keine Kaskaden-Overrides).
const LEGEND = [
  { label: "Neu", value: 18, share: "39%", dot: "bg-dash-teal", active: true },
  { label: "In Prüfung", value: 16, share: "35%", dot: "bg-[#ffd05c]" },
  { label: "Geprüft", value: 8, share: "17%", dot: "bg-dash-blue" },
  { label: "Abgeschlossen", value: 4, share: "9%", dot: "bg-[#55df9c]" },
];

export function ReviewDonut() {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-3.5 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.032),0_16px_36px_rgba(0,0,0,0.19)]">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className={`flex items-center gap-2 ${dashTextTitle} font-extrabold text-sand-900 dark:text-dash-text`}>
          <span className="flex h-[27px] w-[27px] items-center justify-center rounded-[9px] text-ink-700 dark:text-dash-teal bg-ink-400/15 dark:bg-transparent dark:bg-[linear-gradient(180deg,rgba(37,216,206,0.14),rgba(37,216,206,0.07))] border border-ink-400/25 dark:border-[rgba(37,216,206,0.14)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="7" />
              <path d="M12 5v7l4 2" />
            </svg>
          </span>
          Prüfübersicht
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-card-border px-2 py-1 ${dashTextSecondaryLg} font-semibold text-sand-500 dark:border-[rgba(37,216,206,0.16)] dark:bg-[rgba(37,216,206,0.055)] dark:text-[#b9f9f5]`}>
          <i className="h-1.5 w-1.5 rounded-full bg-ink-500 dark:bg-dash-teal" />
          46 Fälle gesamt
        </span>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2 rounded-[10px] border border-card-border/60 bg-sand-50/60 px-2.5 py-1.5 dark:border-[rgba(71,108,140,0.19)] dark:bg-[linear-gradient(180deg,rgba(8,29,50,0.62),rgba(7,25,44,0.44))]">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={`${dashTextSecondarySm} font-bold uppercase tracking-wide text-sand-400 dark:text-[#718fa8]`}>Bearbeitungsstatus</span>
          <strong className={`truncate ${dashTextBodyLg} font-bold text-sand-900 dark:text-[#eef8ff]`}>18 neue Fälle warten auf Prüfung</strong>
        </div>
        <span className={`shrink-0 whitespace-nowrap text-right ${dashTextSecondarySm} text-sand-500 dark:text-[#7f9ab2]`}>
          <b className={`block ${dashTextBodyLg} font-bold text-sand-900 dark:text-[#d7e8f5]`}>12 Min.</b>Ø Prüfzeit
        </span>
      </div>

      <div className={`mt-1.5 grid ${dashDonutColClass} items-center gap-3`}>
        <div className="flex flex-col items-center gap-1">
          <div className={`relative mx-auto ${dashDonutSizeClass} rounded-full bg-[conic-gradient(#0f766e_0_39%,#55df9c_39%_48%,#4f9fff_48%_66%,#ffd05c_66%_100%)] shadow-warm-sm dark:bg-[conic-gradient(#25d8ce_0_39%,#55df9c_39%_48%,#4f9fff_48%_66%,#ffd05c_66%_100%)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045),0_10px_22px_rgba(0,0,0,0.14)]`}>
            <div className={`absolute ${dashDonutInsetClass} rounded-full bg-sand-50 dark:bg-[radial-gradient(circle,rgba(14,41,68,0.99),rgba(9,29,50,0.99))]`} />
            <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center text-center">
              <b className={`block ${dashTextDonutNumber} font-extrabold leading-none text-sand-900 dark:text-dash-text`}>46</b>
              <span className={`mt-0.5 block leading-none ${dashTextSecondarySm} text-sand-500 dark:text-[#8da6bc]`}>Gesamt</span>
            </div>
          </div>
          <span className={`${dashTextSecondarySm} uppercase tracking-wide text-sand-400 dark:text-[#6f8ba3]`}>Nächster Schritt</span>
        </div>
        <div className="grid gap-1">
          {LEGEND.map((leg) => (
            <div
              key={leg.label}
              className={`grid grid-cols-[1fr_auto_32px] items-center gap-2 rounded-lg px-1.5 py-1 ${dashTextBody} ${
                leg.active ? "bg-ink-50 dark:bg-[rgba(37,216,206,0.07)] dark:border dark:border-[rgba(37,216,206,0.12)]" : ""
              }`}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-sand-600 dark:text-dash-text-secondary">
                <i className={`h-[7px] w-[7px] shrink-0 rounded-sm ${leg.dot}`} />
                <span className="truncate">{leg.label}</span>
              </span>
              <b className="text-right font-bold tabular-nums text-sand-900 dark:text-dash-text">{leg.value}</b>
              <em className={`text-right ${dashTextSecondaryLg} not-italic text-sand-400 tabular-nums dark:text-[#7f9ab2]`}>{leg.share}</em>
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-auto flex shrink-0 items-center justify-between gap-2 rounded-[9px] border border-ink-400/20 bg-ink-50/60 px-2.5 py-2 ${dashTextBody} text-ink-700 dark:border-[rgba(37,216,206,0.14)] dark:bg-transparent dark:bg-[linear-gradient(90deg,rgba(37,216,206,0.07),rgba(37,216,206,0.018))] dark:text-[#9df8f2]`}>
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 rounded-full bg-ink-500 dark:bg-dash-teal" />
          <b>18 neue Fälle zuerst prüfen</b>
        </span>
        <span>Öffnen →</span>
      </div>
    </div>
  );
}
