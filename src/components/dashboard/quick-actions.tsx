import Link from "next/link";

// "Schnellaktion"-Karte, optisch 1:1 die V12-".quick"-Karte: primäre Aktion
// leicht staerker betont, zwei sekundaere Aktionen bewusst ruhiger (keine
// zusaetzliche Glow-/Glas-Optik obendrauf). Ersetzt an dieser Stelle den
// bisherigen QuickActionButton (6 CRUD-Kurzbefehle) - dessen Ziele bleiben
// weiterhin ueber die jeweiligen Seiten/Formulare erreichbar, hier gilt aber
// die fest vorgegebene V12-Struktur mit genau diesen drei Aktionen.
// "X Fälle prüfen" hat noch kein echtes Ziel (Arbeitsliste/Fallpruefung sind
// laut Aufgabenstellung zukuenftige Arbeit) und ist daher - wie die anderen
// "noch nicht verfuegbaren" Punkte in EmployerNav - kein Link, sondern ein
// deaktiviert wirkender Button.
export function QuickActions({ hint }: { hint?: string }) {
  return (
    <div className="rounded-2xl border border-violet-300/40 bg-card p-2.5 shadow-warm-sm dark:border-[rgba(183,77,255,0.38)] dark:bg-[linear-gradient(180deg,rgba(17,37,67,0.96),rgba(10,29,52,0.97))] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_30px_rgba(148,56,255,0.05)]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[13px] font-extrabold text-sand-900 dark:text-dash-text">
          <span className="text-[17px] text-ink-500 dark:text-[#68fff7] dark:[text-shadow:0_0_12px_rgba(104,255,247,0.8)]">✦</span>
          Schnellaktion
        </div>
        {hint && (
          <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-card-border px-2 py-1 text-[9.5px] text-sand-500 dark:border-white/[0.06] dark:text-dash-text-secondary">
            <span className="text-[8.6px] uppercase tracking-wide text-sand-400 dark:text-inherit">Nächster Schritt</span>
            <b className="text-sand-900 dark:text-white">{hint}</b>
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1.18fr_1fr_1fr] gap-2">
        <span
          aria-disabled
          title="Noch nicht verfügbar"
          className="relative flex min-h-[54px] cursor-default items-center gap-2.5 rounded-xl border border-ink-300/60 bg-gradient-to-br from-ink-500 to-ink-700 px-3 py-2 text-white opacity-90 dark:border-[#3de3d9] dark:bg-[linear-gradient(135deg,#24b7b1,#147c7b)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_7px_20px_rgba(20,135,132,0.15)]"
        >
          <ArrowSplitIcon className="h-[22px] w-[22px] shrink-0 text-white/85" />
          <span className="min-w-0">
            <b className="block text-[12px] font-bold">Fälle prüfen</b>
            <small className="block text-[9.5px] text-white/75">Priorisierte Fälle direkt bearbeiten</small>
          </span>
        </span>

        <Link
          href="/arbeitgeber/dashboard/datenimporte/neu"
          className="group relative flex min-h-[54px] items-center gap-2.5 rounded-xl border border-card-border bg-card px-3 py-2 text-sand-900 shadow-warm-sm transition-[transform,border-color,box-shadow] hover:-translate-y-px dark:border-[rgba(54,91,124,0.62)] dark:bg-[linear-gradient(180deg,#112a46,#0b213a)] dark:text-white dark:hover:border-[rgba(79,137,177,0.78)]"
        >
          <UploadArrowIcon className="h-[19px] w-[19px] shrink-0 text-sand-500 dark:text-[#cfe6f4]" />
          <span className="min-w-0">
            <b className="block text-[12px] font-bold">Daten importieren</b>
            <small className="block text-[9.5px] text-sand-500 dark:text-dash-text-secondary">Neue Datei hinzufügen</small>
          </span>
        </Link>

        <Link
          href="/arbeitgeber/dashboard/monatsvergleich"
          className="group relative flex min-h-[54px] items-center gap-2.5 rounded-xl border border-card-border bg-card px-3 py-2 text-sand-900 shadow-warm-sm transition-[transform,border-color,box-shadow] hover:-translate-y-px dark:border-[rgba(54,91,124,0.62)] dark:bg-[linear-gradient(180deg,#112a46,#0b213a)] dark:text-white dark:hover:border-[rgba(79,137,177,0.78)]"
        >
          <PulseIcon className="h-[19px] w-[19px] shrink-0 text-sand-500 dark:text-[#cfe6f4]" />
          <span className="min-w-0">
            <b className="block text-[12px] font-bold">Analyse starten</b>
            <small className="block text-[9.5px] text-sand-500 dark:text-dash-text-secondary">Aktuelle Daten erneut prüfen</small>
          </span>
        </Link>
      </div>
    </div>
  );
}

function ArrowSplitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12h18M12 3v18" />
      <path d="M7 7l-4 5 4 5" />
    </svg>
  );
}

function UploadArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function PulseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 13h4l2-6 4 12 2-6h6" />
    </svg>
  );
}
