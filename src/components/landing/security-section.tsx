import { ShieldIcon, UsersIcon, CheckCircleIcon, FileTextIcon } from "@/components/icons";

const POINTS = [
  {
    icon: ShieldIcon,
    title: "Mandantentrennung",
    text: "Jedes Unternehmen sieht ausschließlich seine eigenen Daten.",
  },
  {
    icon: UsersIcon,
    title: "Zugriffskontrolle",
    text: "Zugriff nur für autorisierte Nutzer Ihres Unternehmens, geschützt durch individuelle Zugangsdaten.",
  },
  {
    icon: CheckCircleIcon,
    title: "Verschlüsselte Übertragung",
    text: "Daten werden verschlüsselt zwischen Ihrem Browser und Effivo übertragen.",
  },
  {
    icon: FileTextIcon,
    title: "Persönlich begleitete Pilotphase",
    text: "Einrichtung, Funktionsumfang und Datenverarbeitung werden gemeinsam mit Ihnen abgestimmt.",
  },
];

// Ruhiger, seriöser Vertrauensbereich - bewusst ohne erfundene
// Zertifizierungen oder überzogene Sicherheitsversprechen. Enthält den
// bestehenden rechtlichen Hinweis, dass Effivo keine Steuer-, Finanz- oder
// Unternehmensberatung ersetzt.
export function SecuritySection() {
  return (
    <section id="sicherheit" className="scroll-mt-20 bg-landing-bg py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">Sicherheit &amp; Vertrauen</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
            Ihre Daten bleiben Ihre Daten.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4 rounded-2xl border border-landing-border bg-landing-card px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-landing-accent-subtle text-landing-accent-light">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-landing-text-primary">{title}</h3>
                <p className="mt-1 text-sm text-landing-text-secondary">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm text-landing-text-muted">
          Effivo stellt vorhandene Unternehmensdaten verständlich dar. Die Anwendung ersetzt keine Steuer-, Finanz- oder Unternehmensberatung.
        </p>
      </div>
    </section>
  );
}
