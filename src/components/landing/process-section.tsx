import { UploadIcon, ActivityIcon, FileTextIcon } from "@/components/icons";

const STEPS = [
  {
    icon: UploadIcon,
    title: "Excel-Export hochladen",
    text: "Laden Sie Ihren gewohnten Buchhaltungs-Export hoch, zum Beispiel im DATEV-Format – ohne zusätzliche Software oder Schnittstelle.",
  },
  {
    icon: ActivityIcon,
    title: "Automatische Auswertung",
    text: "Controlling Cockpit analysiert Ihre Zahlen und bereitet die wichtigsten Kennzahlen strukturiert auf.",
  },
  {
    icon: FileTextIcon,
    title: "Verständliche Erklärung erhalten",
    text: "Sie erhalten eine klare, nicht-technische Zusammenfassung: was gut läuft, wo es hakt und was Sie jetzt prüfen sollten.",
  },
];

export function ProcessSection() {
  return (
    <section id="ablauf" className="py-20 border-y border-petrol-100 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-section-alt">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
          So funktioniert es
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
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
