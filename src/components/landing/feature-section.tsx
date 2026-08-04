import { TrendingUpIcon, FileTextIcon, UsersIcon, ActivityIcon } from "@/components/icons";

const CATEGORIES = [
  {
    icon: TrendingUpIcon,
    title: "Finanzen",
    items: ["Umsatz", "Kosten", "Ergebnis", "Offene Forderungen", "Liquiditätsübersicht"],
  },
  {
    icon: FileTextIcon,
    title: "Aufträge & Vertrieb",
    items: ["Offene Angebote", "Laufende Aufträge", "Abgeschlossene Aufträge", "Vergleich zum Vormonat", "Auftragsentwicklung"],
  },
  {
    icon: UsersIcon,
    title: "Kunden",
    items: ["Neue Kunden", "Aktive Kunden", "Bestandskunden", "Kundenentwicklung"],
  },
  {
    icon: ActivityIcon,
    title: "Veränderungen",
    items: [
      "Aktueller Monat im Vergleich zum Vormonat",
      "Entwicklung der vergangenen Monate",
      "Sachliche Erklärung auffälliger Veränderungen",
    ],
  },
];

export function FeatureSection() {
  return (
    <section id="funktionen" className="py-20 bg-white dark:bg-cockpit-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
          Alles Wichtige auf einer Seite
        </h2>
        <p className="mt-3 text-center text-slate-600 dark:text-cockpit-text-secondary max-w-2xl mx-auto">
          UnternehmensCockpit führt Ihre wichtigsten Unternehmensbereiche zusammen und
          macht Veränderungen auf einen Blick sichtbar.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {CATEGORIES.map(({ icon: Icon, title, items }) => (
            <div
              key={title}
              className="rounded-2xl border border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-card p-6 shadow-sm dark:shadow-none"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-petrol-100 dark:bg-cockpit-icon-bg text-petrol-700 dark:text-cockpit-accent-light">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-petrol-50 dark:bg-cockpit-accent-subtle px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-petrol-700 dark:text-cockpit-accent-light">
                  In der Pilotphase
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-cockpit-heading">
                {title}
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-cockpit-text-secondary">
                {items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-petrol-400 dark:bg-cockpit-text-weak" />
                    {item}
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
