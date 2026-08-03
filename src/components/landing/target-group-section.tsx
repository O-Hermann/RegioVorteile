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
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-sand-900">
          Für wen Controlling Cockpit gemacht ist
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {GROUPS.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-start gap-4 rounded-2xl border border-card-border bg-card p-5 shadow-warm-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-petrol-50 dark:bg-petrol-900/30 text-petrol-600 dark:text-petrol-300">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-sand-800 pt-1.5">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
