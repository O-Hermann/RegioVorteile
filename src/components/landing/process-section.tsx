import { UploadIcon, ActivityIcon, FileTextIcon, TrendingUpIcon } from "@/components/icons";

const STEPS = [
  {
    icon: UploadIcon,
    title: "Daten importieren",
    text: "Sie laden vorhandene Excel- oder CSV-Exporte aus Ihrem bisherigen System hoch – ohne zusätzliche Schnittstelle.",
  },
  {
    icon: ActivityIcon,
    title: "Daten zuordnen",
    text: "UnternehmensCockpit verarbeitet die vorhandenen Werte und ordnet sie den passenden Bereichen zu.",
  },
  {
    icon: FileTextIcon,
    title: "Überblick erhalten",
    text: "Sie sehen Ihre wichtigsten Kennzahlen, Monatsvergleiche und Veränderungen in einem verständlichen Dashboard.",
  },
  {
    icon: TrendingUpIcon,
    title: "Entwicklung verfolgen",
    text: "Mit weiteren Monatsimporten entsteht eine fortlaufende Übersicht über die Entwicklung Ihres Unternehmens.",
  },
];

export function ProcessSection() {
  return (
    <section id="ablauf" className="py-20 border-y border-petrol-100 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-section-alt">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
          So funktioniert es
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="relative rounded-2xl border border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-card p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-petrol-800 dark:bg-cockpit-accent text-xs font-bold text-white">
                  {i + 1}
                </span>
                <Icon className="h-5 w-5 text-petrol-700 dark:text-cockpit-accent-light" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-cockpit-heading">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-cockpit-text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
