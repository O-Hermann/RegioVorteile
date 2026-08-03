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
    <section id="preise" className="py-20 bg-cyan-50/60 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Preise
        </h2>
        <p className="mt-3 text-center text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Controlling Cockpit befindet sich aktuell in der Pilotphase. Alle Preise sind
          auf Anfrage.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col rounded-2xl border border-cyan-100 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{tier.name}</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{tier.description}</p>
              <p className="mt-5 font-display text-2xl font-extrabold text-cyan-700 dark:text-cyan-300">
                Preis folgt
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">In der Pilotphase auf Anfrage</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span className="mt-0.5 text-cyan-600 dark:text-cyan-400">+</span>
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
