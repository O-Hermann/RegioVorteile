import { DASH_ACCENT_HEX, type DashAccent } from "@/components/dashboard/dash-ui";

// "Funde & Prüfung"-Karte, optisch 1:1 die V12-".v10-findings"-Karte. Wie
// ReviewDonut bewusst mit den Referenz-Demowerten befuellt, da es dafuer
// noch kein echtes Datenmodell gibt (siehe Kommentar dort).
const FINDINGS: { name: string; desc: string; amount: string; count: number; bar: number; accent: DashAccent; isTop?: boolean }[] = [
  { name: "Doppelzahlungen", desc: "Doppelt oder mehrfach bezahlt", amount: "36.900 €", count: 14, bar: 100, accent: "red", isTop: true },
  { name: "Offene Gutschriften", desc: "Noch nicht verrechnet", amount: "18.240 €", count: 9, bar: 49, accent: "orange" },
  { name: "Skonto nicht genutzt", desc: "Preisnachlass verpasst", amount: "6.780 €", count: 7, bar: 18, accent: "blue" },
  { name: "Mögliche Überzahlung", desc: "Abweichung vom Sollbetrag", amount: "12.430 €", count: 6, bar: 34, accent: "purple" },
];

export function FindingsList() {
  return (
    <div
      className="grid min-h-0 overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-3.5 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.032),0_16px_36px_rgba(0,0,0,0.19)]"
      style={{ gridTemplateRows: "auto auto minmax(0, 1fr) auto" }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[13.5px] font-extrabold text-sand-900 dark:text-dash-text">
          <span className="flex h-[27px] w-[27px] items-center justify-center rounded-[9px] text-ink-700 dark:text-dash-teal bg-ink-400/15 dark:bg-transparent dark:bg-[linear-gradient(180deg,rgba(37,216,206,0.14),rgba(37,216,206,0.07))] border border-ink-400/25 dark:border-[rgba(37,216,206,0.14)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5">
              <path d="M5 6h14M5 12h14M5 18h14" />
              <path d="M8 4v4M12 10v4M16 16v4" />
            </svg>
          </span>
          Funde &amp; Prüfung
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-card-border px-2 py-1 text-[10.5px] font-semibold text-sand-500 dark:border-[rgba(104,145,178,0.18)] dark:bg-white/[0.025] dark:text-[#abc2d6]">
          4 Kategorien
        </span>
      </div>

      <div className="mt-1.5 flex shrink-0 items-center justify-between gap-2 rounded-[10px] border border-card-border/60 bg-sand-50/60 px-2.5 py-1.5 dark:border-[rgba(71,108,140,0.19)] dark:bg-[linear-gradient(180deg,rgba(8,29,50,0.62),rgba(7,25,44,0.44))]">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[9.5px] font-bold uppercase tracking-wide text-sand-400 dark:text-[#718fa8]">Potenzial · 4 Kategorien</span>
          <strong className="truncate text-[15px] font-bold tabular-nums text-sand-900 dark:text-[#f5fbff]">74.350 €</strong>
        </div>
        <span className="shrink-0 whitespace-nowrap text-right text-[9.5px] text-sand-500 dark:text-[#758fa7]">
          Top-Kategorie
          <b className="block text-[11px] font-bold text-sand-900 dark:text-[#dbe9f3]">Doppelzahlungen</b>
        </span>
      </div>

      <div
        className="mt-1 grid min-h-0 overflow-hidden"
        style={{ gridTemplateRows: `repeat(${FINDINGS.length}, minmax(0, 1fr))` }}
      >
        {FINDINGS.map((f) => (
          <div
            key={f.name}
            style={{ "--case-accent": DASH_ACCENT_HEX[f.accent] } as React.CSSProperties}
            className="relative flex min-h-0 items-center justify-between gap-2 border-b border-card-border/40 py-1.5 pl-2.5 last:border-0 dark:border-white/[0.045]"
          >
            <span
              aria-hidden
              className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full opacity-70"
              style={{ background: "var(--case-accent)" }}
            />
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full border text-[11px] ${
                  f.accent === "red"
                    ? "text-rose-600 border-rose-400/50 bg-rose-500/10 dark:text-dash-red dark:border-dash-red/60 dark:bg-[rgba(255,98,93,0.1)]"
                    : f.accent === "orange"
                      ? "text-amber-600 border-amber-400/50 bg-amber-500/10 dark:text-dash-orange dark:border-dash-orange/60 dark:bg-[rgba(240,162,62,0.11)]"
                      : f.accent === "blue"
                        ? "text-sky-600 border-sky-400/50 bg-sky-500/10 dark:text-dash-blue dark:border-dash-blue/60 dark:bg-[rgba(79,159,255,0.1)]"
                        : "text-violet-600 border-violet-400/50 bg-violet-500/10 dark:text-dash-purple dark:border-dash-purple/60 dark:bg-[rgba(170,118,255,0.1)]"
                }`}
              >
                ⊙
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-sand-900 dark:text-[#edf6fc]">{f.name}</p>
                <p className="truncate text-[9px] text-sand-400 dark:text-[#89a3bb]">{f.desc}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="whitespace-nowrap rounded-full border border-card-border/60 bg-sand-50 px-1.5 py-0.5 text-[9px] text-sand-500 dark:border-[rgba(83,121,151,0.24)] dark:bg-[rgba(5,23,41,0.55)] dark:text-[#c9dde9]">
                {f.amount}
              </span>
              <span className="text-[11px] font-extrabold text-sand-900 dark:text-dash-text">{f.count}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1.5 flex shrink-0 items-center justify-between gap-2 border-t border-card-border/70 dark:border-white/[0.06] pt-2 text-[11px] text-ink-600 dark:text-dash-teal">
        <span>Alle Fundkategorien</span>
        <span>→</span>
      </div>
    </div>
  );
}
