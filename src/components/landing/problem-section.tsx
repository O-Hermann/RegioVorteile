const PROBLEMS = [
  "Excel-Tabellen und BWA sind für Nicht-Controller schwer zu lesen und zu deuten.",
  "Ein interner Controller fehlt, externe Berater sind teuer und selten kurzfristig verfügbar.",
  "Kostenanstiege oder sinkende Margen fallen häufig erst spät auf.",
  "Planzahlen und Ist-Zahlen werden selten wirklich systematisch verglichen.",
];

export function ProblemSection() {
  return (
    <section className="py-20 border-y border-petrol-100 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-section-alt">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
              Die Zahlen sind da – aber niemand erklärt sie Ihnen.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-cockpit-text">
              Viele kleine und mittlere Unternehmen bekommen ihre Buchhaltungszahlen
              zuverlässig geliefert. Was fehlt, ist die Einordnung: Was bedeuten diese
              Zahlen für mein Geschäft – und was sollte ich jetzt tun?
            </p>
            <p className="mt-4 text-slate-600 dark:text-cockpit-text">
              Genau hier setzt Controlling Cockpit an: Es übernimmt die Erklärung, die
              sonst ein eigener Controller liefern würde – verständlich, regelmäßig und
              ohne Fachjargon.
            </p>
          </div>
          <ul className="space-y-3">
            {PROBLEMS.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-card p-4 text-sm text-slate-700 dark:text-cockpit-text"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-petrol-600 dark:bg-cockpit-accent-light" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
