import { BriefcaseIcon, StoreIcon, UsersIcon, TargetIcon } from "@/components/icons";
import { SITE_NAME } from "@/lib/site-config";

const GROUPS = [
  {
    icon: BriefcaseIcon,
    text: "Geschäftsführer kleiner und mittlerer Unternehmen, etwa 5 bis 50 Mitarbeitende, ohne eigenen Controller",
  },
  {
    icon: StoreIcon,
    text: "Dienstleister, Agenturen, Handwerksbetriebe und kleinere Handelsunternehmen",
  },
  {
    icon: TargetIcon,
    text: "Unternehmen, die einen schnellen Überblick statt vieler einzelner Tabellen wollen",
  },
  {
    icon: UsersIcon,
    text: "Betriebe mit Buchhaltungs-, Auftrags- oder Kundendaten, die über mehrere Systeme verteilt sind",
  },
];

export function TargetGroupSection() {
  return (
    <section className="py-16 bg-white dark:bg-cockpit-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
          Für wen {SITE_NAME} gemacht ist
        </h2>
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {GROUPS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-4 rounded-2xl border border-petrol-100 dark:border-white/10 bg-white dark:bg-gradient-to-b dark:from-cockpit-card dark:to-cockpit-card-dark px-4 py-3.5 shadow-sm dark:shadow-lg dark:shadow-black/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-petrol-400/25 to-petrol-500/10 dark:from-cockpit-accent-light/25 dark:to-cockpit-accent/10 text-petrol-700 dark:text-cockpit-accent-light border border-petrol-200/60 dark:border-cockpit-accent-light/25">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm text-slate-700 dark:text-cockpit-text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
