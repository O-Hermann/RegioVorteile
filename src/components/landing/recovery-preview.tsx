import { CheckCircleIcon, CopyIcon, FileTextIcon, AlertTriangleIcon } from "@/components/icons";

const CATEGORIES = [
  { label: "Mögliche Doppelzahlungen", value: "3", tone: "danger" as const, icon: CopyIcon },
  { label: "Offene Gutschriften", value: "6", tone: "warning" as const, icon: FileTextIcon },
  { label: "Weitere Auffälligkeiten", value: "8", tone: "info" as const, icon: AlertTriangleIcon },
];

const TONE_CLASSES = {
  danger: "bg-landing-danger-subtle text-landing-danger",
  warning: "bg-landing-warning-subtle text-landing-warning",
  info: "bg-landing-info-subtle text-landing-info",
};

// Statische, mit Beispieldaten befuellte Analyse-Visualisierung fuer den
// Hero - ersetzt die bisherige Umsatz-Dashboard-Vorschau (Punkt "Recovery
// statt Unternehmer-Dashboard"). Animation bewusst rein ueber CSS
// (@keyframes in globals.css), kein JS/Client-Component noetig.
export function RecoveryPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-landing-border bg-landing-card-elevated p-5 sm:p-6 shadow-lg shadow-slate-900/5 dark:shadow-xl dark:shadow-black/30">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-landing-accent-light/10 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-landing-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-landing-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-landing-border" />
        </div>
        <span className="text-xs font-medium text-landing-text-secondary">Juli 2026</span>
      </div>

      <div className="relative mt-4 flex items-center gap-2.5">
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-landing-success-subtle text-landing-success">
          <span aria-hidden className="absolute inset-0 rounded-full bg-landing-success/25 animate-ping-slow" />
          <CheckCircleIcon className="relative h-4 w-4" />
        </span>
        <p className="font-display text-sm font-bold text-landing-text-primary">Analyse abgeschlossen</p>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-landing-border bg-landing-bg-alt p-3">
          <p className="text-[11px] text-landing-text-secondary">Buchungen geprüft</p>
          <p className="mt-1 font-display text-lg font-extrabold leading-none text-landing-text-primary">38.421</p>
        </div>
        <div className="rounded-xl border border-landing-border bg-landing-bg-alt p-3">
          <p className="text-[11px] text-landing-text-secondary">Auffälligkeiten</p>
          <p className="mt-1 font-display text-lg font-extrabold leading-none text-landing-text-primary">17</p>
        </div>
        <div className="rounded-xl border border-landing-border bg-landing-bg-alt p-3">
          <p className="text-[11px] text-landing-text-secondary">Potenzieller Effekt</p>
          <p className="mt-1 font-display text-lg font-extrabold leading-none text-landing-accent-light">12.480 €</p>
        </div>
      </div>

      <ul className="relative mt-4 space-y-2">
        {CATEGORIES.map((cat, i) => (
          <li
            key={cat.label}
            className="flex items-center gap-3 rounded-xl border border-landing-border bg-landing-card px-3 py-2.5 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[cat.tone]}`}>
              <cat.icon className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-xs font-medium text-landing-text-secondary">{cat.label}</span>
            <span className="text-sm font-bold text-landing-text-primary">{cat.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
