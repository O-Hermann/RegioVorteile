import { UploadIcon, ActivityIcon, FileTextIcon, TrendingUpIcon } from "@/components/icons";

const STEPS = [
  {
    icon: UploadIcon,
    title: "Daten importieren",
    text: "Sie laden vorhandene Excel- oder CSV-Exporte aus Ihrem bisherigen System hoch.",
  },
  {
    icon: ActivityIcon,
    title: "Daten zuordnen",
    text: "Nach dem Upload werden die vorhandenen Spalten einmalig den passenden Kennzahlen zugeordnet.",
  },
  {
    icon: FileTextIcon,
    title: "Überblick erhalten",
    text: "Sie sehen Ihre wichtigsten Kennzahlen und Monatsvergleiche in einem verständlichen Dashboard.",
  },
  {
    icon: TrendingUpIcon,
    title: "Entwicklung verfolgen",
    text: "Mit weiteren Monatsimporten entsteht eine fortlaufende Übersicht Ihres Unternehmens.",
  },
];

export function ProcessSection() {
  return (
    <section id="ablauf" className="py-16 border-y border-petrol-100 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-section-alt">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
          So funktioniert es
        </h2>
        <div className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="pointer-events-none absolute top-9 left-[12.5%] right-[12.5%] hidden h-px bg-gradient-to-r from-transparent via-petrol-200 dark:via-cockpit-border to-transparent lg:block"
          />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="relative rounded-2xl border border-petrol-100 dark:border-white/10 bg-white dark:bg-gradient-to-b dark:from-cockpit-card dark:to-cockpit-card-dark p-5 shadow-sm dark:shadow-lg dark:shadow-black/20"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-petrol-800 dark:bg-cockpit-accent text-xs font-bold text-white ring-4 ring-petrol-50 dark:ring-cockpit-section-alt">
                  {i + 1}
                </span>
                <Icon className="h-5 w-5 text-petrol-700 dark:text-cockpit-accent-light" />
              </div>
              <h3 className="mt-3.5 font-display text-base font-bold text-slate-900 dark:text-cockpit-heading">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-cockpit-text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
