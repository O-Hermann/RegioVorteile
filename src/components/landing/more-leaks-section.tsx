import { CopyIcon, FileTextIcon, TagIcon, DropletIcon, AlertTriangleIcon } from "@/components/icons";

type Weight = "familiar" | "focus" | "neutral";

const CATEGORIES: { icon: typeof CopyIcon; title: string; text: string; weight: Weight }[] = [
  {
    icon: CopyIcon,
    title: "Doppelzahlungen",
    text: "Eine Rechnung oder Zahlung taucht möglicherweise mehrfach auf – auch bei leicht abweichender Rechnungsnummer.",
    weight: "familiar",
  },
  {
    icon: FileTextIcon,
    title: "Gutschrift nicht verrechnet",
    text: "Eine Gutschrift wurde erfasst, aber möglicherweise nie mit einer späteren Zahlung oder Rechnung verrechnet.",
    weight: "focus",
  },
  {
    icon: TagIcon,
    title: "Skonto nicht genutzt",
    text: "Effivo zeigt Fälle, bei denen ein möglicher Preisnachlass durch den Zahlungszeitpunkt ungenutzt geblieben sein könnte.",
    weight: "focus",
  },
  {
    icon: DropletIcon,
    title: "Mögliche Überzahlung",
    text: "Gezahlter Betrag und zugrunde liegender Vorgang passen möglicherweise nicht sauber zusammen.",
    weight: "focus",
  },
  {
    icon: AlertTriangleIcon,
    title: "Weitere Auffälligkeiten",
    text: "Ungewöhnliche Muster, Kreditorendubletten und weitere Fälle können später Schritt für Schritt ergänzt werden.",
    weight: "neutral",
  },
];

const CARD_STYLES: Record<Weight, string> = {
  familiar: "border-landing-border bg-landing-bg-alt opacity-75",
  focus: "border-landing-accent-light/20 bg-landing-card shadow-sm shadow-slate-900/5 dark:shadow-lg dark:shadow-black/20",
  neutral: "border-dashed border-landing-border bg-transparent opacity-70",
};

const ICON_STYLES: Record<Weight, string> = {
  familiar: "bg-landing-bg text-landing-text-muted",
  focus: "bg-landing-accent-subtle text-landing-accent-light",
  neutral: "bg-landing-bg text-landing-text-muted",
};

// Ruhiger Abschnitt nach dem ersten Scrollytelling: macht bewusst KEINE
// zweite Animationsexplosion, sondern zeigt in gedaempfter Form, dass die
// gezeigte Doppelzahlung nur eines von mehreren Beispielen ist. Die fuenf
// Karten sind absichtlich NICHT optisch identisch (Punkt "keine fuenf
// gleichen Feature-Cards") - Doppelzahlung ist bereits ausfuehrlich gezeigt
// worden und tritt daher zurueck, waehrend Gutschrift/Skonto/Ueberzahlung
// mehr Gewicht bekommen und "weitere Auffaelligkeiten" bewusst neutral/
// gestrichelt als Ausblick markiert ist.
export function MoreLeaksSection() {
  return (
    <section id="findet" className="scroll-mt-20 border-y border-landing-border bg-landing-bg py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">Was Effivo findet</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
            Eine Doppelzahlung ist nur ein Beispiel.
          </h2>
          <p className="mt-4 text-landing-text-secondary">
            Das Scrollytelling zeigt bewusst nur einen Fall im Detail. Effivo soll verschiedene Arten finanzieller Auffälligkeiten erkennen und sauber voneinander unterscheiden.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map(({ icon: Icon, title, text, weight }) => (
            <div key={title} className={`rounded-2xl border p-5 ${CARD_STYLES[weight]}`}>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${ICON_STYLES[weight]}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-landing-text-primary">{title}</h3>
              <p className="mt-2 text-sm text-landing-text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
