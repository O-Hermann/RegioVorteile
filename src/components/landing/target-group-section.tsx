import { BriefcaseIcon, StoreIcon, UsersIcon, TargetIcon } from "@/components/icons";

const GROUPS = [
  {
    icon: BriefcaseIcon,
    text: "Geschäftsführer:innen kleiner und mittlerer Unternehmen ohne eigene Controlling-Abteilung",
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
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Für wen Controlling Cockpit gemacht ist
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {GROUPS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-cyan-500/10 text-sky-600 dark:text-cyan-300">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 pt-1.5">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
