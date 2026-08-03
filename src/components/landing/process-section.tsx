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
    <section id="ablauf" className="py-20 border-y border-petrol-100 dark:border-white/10 bg-petrol-50 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          So funktioniert es
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="relative rounded-2xl border border-petrol-100 dark:border-white/10 bg-white dark:bg-slate-950 p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-petrol-800 dark:bg-gradient-to-br dark:from-cyan-500 dark:to-cyan-500 text-xs font-bold text-white dark:text-slate-950">
                  {i + 1}
                </span>
                <Icon className="h-5 w-5 text-petrol-700 dark:text-cyan-300" />
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
