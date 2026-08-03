import { CheckCircleIcon, AlertTriangleIcon } from "@/components/icons";

const ROWS = [
  {
    label: "Lesbarkeit",
    bwa: "Tabellenformat, viele Fachbegriffe",
    cockpit: "Klartext-Erklärungen ohne Fachjargon",
  },
  {
    label: "Handlungsempfehlungen",
    bwa: "In der Regel keine",
    cockpit: "Konkrete, verständliche Empfehlungen",
  },
  {
    label: "Plan-Ist-Vergleich",
    bwa: "Manuell, falls überhaupt vorhanden",
    cockpit: "Automatisch aufbereitet",
  },
  {
    label: "Trends erkennen",
    bwa: "Erfordert eigene Auswertung",
    cockpit: "Auf einen Blick sichtbar",
  },
  {
    label: "Aktualität",
    bwa: "Oft erst mit Verzögerung vom Steuerberater",
    cockpit: "Direkt nach dem Excel-Upload",
  },
];

export function ComparisonSection() {
  return (
    <section className="py-20 border-y border-petrol-100 dark:border-white/10 bg-petrol-50 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          BWA vs. Controlling Cockpit
        </h2>
        <p className="mt-3 text-center text-slate-600 dark:text-slate-400">
          Die klassische betriebswirtschaftliche Auswertung liefert Zahlen. Controlling
          Cockpit liefert Verständnis.
        </p>

        <div className="mt-10 overflow-x-auto">
          <div className="min-w-[560px] rounded-2xl border border-petrol-100 dark:border-white/10 bg-white dark:bg-slate-950 overflow-hidden">
            <div className="grid grid-cols-3 gap-px bg-petrol-100 dark:bg-white/10 text-sm font-semibold">
              <div className="bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white">Kriterium</div>
              <div className="bg-white dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white">Klassische BWA</div>
              <div className="bg-white dark:bg-slate-950 px-4 py-3 text-petrol-800 dark:text-cyan-300">
                Controlling Cockpit
              </div>
            </div>
            {ROWS.map((row) => (
              <div key={row.label} className="grid grid-cols-3 gap-px bg-petrol-100 dark:bg-white/10 text-sm">
                <div className="bg-white dark:bg-slate-950 px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                  {row.label}
                </div>
                <div className="bg-white dark:bg-slate-950 px-4 py-3.5 flex items-start gap-2 text-slate-500 dark:text-slate-500">
                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-600" />
                  {row.bwa}
                </div>
                <div className="bg-white dark:bg-slate-950 px-4 py-3.5 flex items-start gap-2 text-slate-800 dark:text-slate-200">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-petrol-700 dark:text-cyan-300" />
                  {row.cockpit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
