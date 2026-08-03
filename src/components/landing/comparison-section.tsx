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
    <section className="py-20 border-y border-card-border bg-card">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-sand-900">
          BWA vs. Controlling Cockpit
        </h2>
        <p className="mt-3 text-center text-sand-600">
          Die klassische betriebswirtschaftliche Auswertung liefert Zahlen. Controlling
          Cockpit liefert Verständnis.
        </p>

        <div className="mt-10 overflow-x-auto">
          <div className="min-w-[560px] rounded-2xl border border-card-border bg-background overflow-hidden">
            <div className="grid grid-cols-3 gap-px bg-card-border text-sm font-semibold text-sand-900">
              <div className="bg-background px-4 py-3">Kriterium</div>
              <div className="bg-background px-4 py-3">Klassische BWA</div>
              <div className="bg-background px-4 py-3 text-petrol-700 dark:text-petrol-300">
                Controlling Cockpit
              </div>
            </div>
            {ROWS.map((row) => (
              <div key={row.label} className="grid grid-cols-3 gap-px bg-card-border text-sm">
                <div className="bg-background px-4 py-3.5 font-medium text-sand-800">
                  {row.label}
                </div>
                <div className="bg-background px-4 py-3.5 flex items-start gap-2 text-sand-500">
                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-sand-400" />
                  {row.bwa}
                </div>
                <div className="bg-background px-4 py-3.5 flex items-start gap-2 text-sand-800">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-petrol-600 dark:text-petrol-300" />
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
