const TIERS = [
  {
    name: "Starter",
    description: "Für kleine Unternehmen mit überschaubarer Datenlage",
    features: ["Monatlicher Datenimport", "Kernkennzahlen im Überblick", "Verständliche Monatsübersicht"],
  },
  {
    name: "Wachstum",
    description: "Für wachsende Unternehmen mit mehreren Bereichen",
    features: [
      "Alles aus Starter",
      "Aufträge & Vertrieb im Überblick",
      "Liquiditäts- und Forderungsüberblick",
    ],
  },
  {
    name: "Individuell",
    description: "Für individuelle Anforderungen und mehrere Standorte",
    features: ["Alles aus Wachstum", "Individuelle Auswertungen", "Persönlicher Ansprechpartner"],
  },
];

export function PricingSection() {
  return (
    <section id="preise" className="py-20 bg-white dark:bg-cockpit-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
          Preise
        </h2>
        <p className="mt-3 text-center text-slate-600 dark:text-cockpit-text-secondary max-w-xl mx-auto">
          UnternehmensCockpit befindet sich aktuell in der Pilotphase. Alle Preise sind
          auf Anfrage.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col rounded-2xl border border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-card p-6 shadow-sm dark:shadow-none"
            >
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-cockpit-heading">{tier.name}</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-cockpit-text-secondary">{tier.description}</p>
              <p className="mt-5 font-display text-2xl font-extrabold text-petrol-800 dark:text-cockpit-accent-light">
                Preis folgt
              </p>
              <p className="text-xs text-slate-500 dark:text-cockpit-text-weak">In der Pilotphase auf Anfrage</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700 dark:text-cockpit-text">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span className="mt-0.5 text-petrol-700 dark:text-cockpit-accent">+</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
