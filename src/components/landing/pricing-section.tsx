const TIERS = [
  {
    name: "Starter",
    description: "Für kleine Unternehmen mit überschaubarer Buchhaltung",
    features: ["Monatlicher Excel-Upload", "Kernkennzahlen erklärt", "Verständliche Empfehlungen"],
  },
  {
    name: "Wachstum",
    description: "Für wachsende Unternehmen mit mehreren Kostenstellen",
    features: [
      "Alles aus Starter",
      "Plan-Ist-Vergleich",
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
    <section id="preise" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-sand-900">
          Preise
        </h2>
        <p className="mt-3 text-center text-sand-600 max-w-xl mx-auto">
          Controlling Cockpit befindet sich aktuell in der Pilotphase. Alle Preise sind
          auf Anfrage.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col rounded-2xl border border-card-border bg-card p-6 shadow-warm-sm"
            >
              <h3 className="font-display text-lg font-bold text-sand-900">{tier.name}</h3>
              <p className="mt-1.5 text-sm text-sand-600">{tier.description}</p>
              <p className="mt-5 font-display text-2xl font-extrabold text-petrol-700 dark:text-petrol-300">
                Preis folgt
              </p>
              <p className="text-xs text-sand-500">In der Pilotphase auf Anfrage</p>
              <ul className="mt-5 space-y-2 text-sm text-sand-700">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span className="mt-0.5 text-petrol-600 dark:text-petrol-400">+</span>
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
