import Link from "next/link";

// "Schnellaktion"-Karte, 1:1 aus dem "Goldstandard"-Mockup (siehe
// [[effivo_mvp_roadmap]]): "Fälle prüfen" nach mehreren Iterationsrunden mit
// dem Nutzer NICHT mehr vollflaechig gold gefuellt (wirkte "billig"), jetzt
// eine dunkle Flaeche mit Gold-Umrandung + goldenem Titel-Text, dasselbe
// Prinzip wie beim aktiven Nav-Tab. Jedes Icon jetzt in einer eigenen
// Icon-Box statt frei auf der Flaeche (vorher inkonsistent zum Rest der
// Seite). Ersetzt an dieser Stelle den alten QuickActionButton (6
// CRUD-Kurzbefehle) - dessen Ziele bleiben weiterhin ueber die jeweiligen
// Seiten/Formulare erreichbar.
export function QuickActions({ hint }: { hint?: string }) {
  return (
    <div className="rounded-xl border border-dash-line bg-dash-panel p-4 shadow-[0_1px_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[16px] font-semibold text-dash-text">
          <span className="text-[17px] text-dash-gold">✦</span>
          Schnellaktion
        </div>
        {hint && (
          <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dash-line px-2.5 py-1 text-[10px] text-dash-text-muted">
            <span className="uppercase tracking-wide">Nächster Schritt</span>
            <b className="text-dash-text">{hint}</b>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.15fr_1fr_1fr]">
        <Link
          href="/arbeitgeber/dashboard/faelle"
          className="flex min-h-[66px] items-center gap-3 rounded-xl border border-dash-gold/50 bg-dash-panel-soft p-4 shadow-[0_1px_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(226,188,107,0.12)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-dash-gold/75 hover:shadow-[0_12px_26px_rgba(226,188,107,0.14)]"
        >
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-dash-gold-deep to-dash-gold text-dash-panel">
            <ArrowSplitIcon className="h-[19px] w-[19px]" />
          </span>
          <span className="min-w-0">
            <b className="block text-[14px] font-semibold text-dash-gold">Fälle prüfen</b>
            <small className="block text-[12px] text-dash-text-muted">Priorisierte Fälle direkt bearbeiten</small>
          </span>
        </Link>

        <Link
          href="/arbeitgeber/dashboard/datenimporte/neu"
          className="flex min-h-[66px] items-center gap-3 rounded-xl border border-dash-line bg-dash-panel-soft p-4 shadow-[0_1px_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.35)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-dash-gold/45 hover:shadow-[0_12px_26px_rgba(226,188,107,0.14)]"
        >
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-dash-gold-glow text-dash-gold">
            <UploadArrowIcon className="h-[17px] w-[17px]" />
          </span>
          <span className="min-w-0">
            <b className="block text-[14px] font-semibold text-dash-text">Daten importieren</b>
            <small className="block text-[12px] text-dash-text-muted">Neue Datei hinzufügen</small>
          </span>
        </Link>

        <Link
          href="/arbeitgeber/dashboard/monatsvergleich"
          className="flex min-h-[66px] items-center gap-3 rounded-xl border border-dash-line bg-dash-panel-soft p-4 shadow-[0_1px_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.35)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-dash-gold/45 hover:shadow-[0_12px_26px_rgba(226,188,107,0.14)]"
        >
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-dash-gold-glow text-dash-gold">
            <PulseIcon className="h-[17px] w-[17px]" />
          </span>
          <span className="min-w-0">
            <b className="block text-[14px] font-semibold text-dash-text">Analyse starten</b>
            <small className="block text-[12px] text-dash-text-muted">Aktuelle Daten erneut prüfen</small>
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
