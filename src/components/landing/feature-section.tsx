import { TrendingUpIcon, FileTextIcon, UsersIcon, ActivityIcon, CheckCircleIcon } from "@/components/icons";
import { SITE_NAME } from "@/lib/site-config";

const ACCENT_CLASSES: Record<string, string> = {
  emerald:
    "bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 text-emerald-600 dark:text-emerald-200 border border-emerald-400/30 dark:border-emerald-300/25 ring-1 ring-inset ring-white/10",
  sky: "bg-gradient-to-br from-sky-400/30 to-sky-500/10 text-sky-600 dark:text-sky-200 border border-sky-400/30 dark:border-sky-300/25 ring-1 ring-inset ring-white/10",
  violet:
    "bg-gradient-to-br from-violet-400/30 to-violet-500/10 text-violet-600 dark:text-violet-200 border border-violet-400/30 dark:border-violet-300/25 ring-1 ring-inset ring-white/10",
  amber:
    "bg-gradient-to-br from-amber-400/35 to-amber-500/10 text-amber-600 dark:text-amber-200 border border-amber-400/35 dark:border-amber-300/30 ring-1 ring-inset ring-white/10",
};

const CATEGORIES = [
  {
    icon: TrendingUpIcon,
    color: "emerald",
    title: "Finanzen",
    text: "Ihre wichtigsten Finanzkennzahlen im Überblick.",
    items: ["Umsatz", "Kosten", "Ergebnis", "Offene Forderungen", "Liquidität"],
  },
  {
    icon: FileTextIcon,
    color: "sky",
    title: "Aufträge & Vertrieb",
    text: "Der Stand Ihres Auftragsgeschäfts auf einen Blick.",
    items: ["Offene Angebote", "Laufende Aufträge", "Abgeschlossene Aufträge", "Auftragsentwicklung"],
  },
  {
    icon: UsersIcon,
    color: "violet",
    title: "Kunden",
    text: "Wie sich Ihr Kundenstamm entwickelt.",
    items: ["Neue Kunden", "Aktive Kunden", "Bestandskunden", "Kundenentwicklung"],
  },
  {
    icon: ActivityIcon,
    color: "amber",
    title: "Veränderungen",
    text: "Was sich seit dem Vormonat verändert hat.",
    items: ["Monatsvergleich", "Verlauf über mehrere Monate", "Sachliche Erklärung auffälliger Werte"],
  },
];

export function FeatureSection() {
  return (
    <section id="funktionen" className="py-16 bg-white dark:bg-cockpit-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
          Alles Wichtige auf einer Seite
        </h2>
        <p className="mt-3 text-center text-lg leading-relaxed text-slate-700 dark:text-cockpit-text max-w-2xl mx-auto">
          {SITE_NAME} führt Ihre wichtigsten Unternehmensbereiche zusammen und macht
          Veränderungen auf einen Blick sichtbar.
        </p>
        <p className="mt-2.5 text-center text-base leading-relaxed text-slate-600 dark:text-cockpit-text-secondary max-w-xl mx-auto">
          Zum Start konzentriert sich {SITE_NAME} auf die wichtigsten Kennzahlen und
          Monatsvergleiche – weitere Bereiche folgen schrittweise.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {CATEGORIES.map(({ icon: Icon, color, title, text, items }) => (
            <div
              key={title}
              className="group rounded-2xl border border-petrol-100 dark:border-white/10 bg-white dark:bg-gradient-to-b dark:from-cockpit-card dark:to-cockpit-card-dark p-5 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-petrol-300 dark:hover:border-cockpit-accent-light/30 hover:shadow-md dark:hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-cockpit-heading">{title}</h3>
                  <p className="text-sm text-slate-600 dark:text-cockpit-text-secondary">{text}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-petrol-100 dark:border-white/5 pt-3.5">
                {items.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-700 dark:text-cockpit-text">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-petrol-500 dark:text-cockpit-accent-light" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
