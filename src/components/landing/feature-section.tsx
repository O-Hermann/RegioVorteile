import {
  TrendingUpIcon,
  PieChartIcon,
  UsersIcon,
  TargetIcon,
  DropletIcon,
  CheckCircleIcon,
} from "@/components/icons";

const FEATURES = [
  {
    icon: TrendingUpIcon,
    title: "Umsatz- und Kostenentwicklung",
    text: "Sehen Sie auf einen Blick, wie sich Umsatz und Kosten Monat für Monat entwickeln – mit einer Erklärung, was dahintersteckt.",
  },
  {
    icon: PieChartIcon,
    title: "Betriebsergebnis & Rohertrag",
    text: "Verstehen Sie, was am Ende wirklich übrig bleibt und wodurch sich Ihr Ergebnis verändert hat.",
  },
  {
    icon: UsersIcon,
    title: "Personalkostenquote",
    text: "Behalten Sie im Blick, wie sich Personalkosten im Verhältnis zum Umsatz entwickeln.",
  },
  {
    icon: TargetIcon,
    title: "Plan-Ist-Vergleich",
    text: "Vergleichen Sie Planzahlen mit den tatsächlichen Ergebnissen und erkennen Sie Abweichungen frühzeitig.",
  },
  {
    icon: DropletIcon,
    title: "Liquidität & offene Forderungen",
    text: "Erhalten Sie eine verständliche Einschätzung Ihrer Liquiditätsentwicklung und offener Forderungen.",
  },
  {
    icon: CheckCircleIcon,
    title: "Empfehlungen in Klartext",
    text: "Statt nur Zahlen zu zeigen, erhalten Sie konkrete, verständliche Handlungsempfehlungen.",
  },
];

export function FeatureSection() {
  return (
    <section id="funktionen" className="py-20 bg-cyan-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Was Controlling Cockpit für Sie auswertet
        </h2>
        <p className="mt-3 text-center text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Aus Ihrem Excel-Export wird eine verständliche Erklärung Ihrer wichtigsten
          Kennzahlen.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-cyan-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-[0_0_20px_-10px_rgba(6,182,212,0.3)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
