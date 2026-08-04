import { BriefcaseIcon, StoreIcon, UsersIcon, TargetIcon } from "@/components/icons";

const GROUPS = [
  {
    icon: BriefcaseIcon,
    text: "Geschäftsführer kleiner und mittlerer Unternehmen ohne eigene Controlling-Abteilung",
  },
  {
    icon: StoreIcon,
    text: "Handwerksbetriebe, Dienstleister und produzierende Unternehmen mit DATEV-Buchhaltung",
  },
  {
    icon: TargetIcon,
    text: "Unternehmen, die einen schnellen, verständlichen Überblick statt komplexer BWA-Tabellen wollen",
  },
  {
    icon: UsersIcon,
    text: "Betriebe, die sich einen externen Controller (noch) nicht leisten wollen oder können",
  },
];

export function TargetGroupSection() {
  return (
    <section className="py-20 bg-white dark:bg-cockpit-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
          Für wen Controlling Cockpit gemacht ist
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {GROUPS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-4 rounded-2xl border border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-card p-5 shadow-sm dark:shadow-none"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-petrol-100 dark:bg-cockpit-icon-bg text-petrol-700 dark:text-cockpit-accent-light">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-700 dark:text-cockpit-text pt-1.5">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
