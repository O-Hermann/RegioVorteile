const PROBLEMS = [
  {
    title: "Zahlen sind auf mehrere Systeme verteilt",
    text: "Buchhaltung, Rechnungen, Aufträge und Kundeninformationen werden getrennt verwaltet.",
  },
  {
    title: "Veränderungen werden zu spät erkannt",
    text: "Ein Umsatzrückgang oder steigende Kosten werden häufig erst bemerkt, wenn die monatliche Auswertung vorliegt.",
  },
  {
    title: "Es fehlt eine verständliche Gesamtansicht",
    text: "Komplexe Tabellen zeigen viele Werte, beantworten aber nicht sofort, was sich im Unternehmen verändert hat.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-16 border-y border-petrol-100 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-section-alt">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
              Die Daten sind vorhanden. Der Überblick fehlt.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-cockpit-text-secondary">
              Informationen zu Finanzen, Aufträgen, Kunden und offenen Vorgängen liegen
              in vielen kleinen Unternehmen in unterschiedlichen Dateien und Programmen.
              Dadurch fehlt dem Geschäftsführer eine schnelle und verständliche
              Gesamtübersicht.
            </p>
          </div>
          <ul className="space-y-2.5">
            {PROBLEMS.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-2xl border border-petrol-100 dark:border-white/10 bg-white dark:bg-cockpit-card px-4 py-3.5 text-sm text-slate-700 dark:text-cockpit-text-secondary shadow-sm dark:shadow-lg dark:shadow-black/20"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-petrol-600 dark:bg-cockpit-accent-light" />
                <span>
                  <span className="block font-semibold text-slate-900 dark:text-cockpit-heading">{item.title}</span>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
