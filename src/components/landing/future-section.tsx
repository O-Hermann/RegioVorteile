// Ausblick auf Continuous Monitoring - bewusst als ZUKUNFT gekennzeichnet,
// nicht als heute bereits verfuegbares Feature. Deutlich ruhiger als das
// Scrollytelling und die Zahlen-Szene: statischer Mockup, keine
// scrollgekoppelte Animation.
export function FutureSection() {
  return (
    <section className="border-y border-landing-border bg-landing-bg-alt py-24 text-center sm:py-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">Ausblick · Continuous Monitoring</span>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
          Finden ist der Anfang. Verhindern ist das Ziel.
        </h2>
        <p className="mt-4 text-landing-text-secondary">
          <b className="text-landing-text-primary">Heute:</b> Geldlecks finden.{" "}
          <b className="text-landing-text-primary">Morgen:</b> mögliche Verluste erkennen, bevor Geld tatsächlich verloren geht.
        </p>

        <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-landing-border bg-landing-card p-6 text-left">
          <div className="flex items-center justify-between gap-4 border-b border-landing-border pb-4">
            <div>
              <p className="text-sm font-semibold text-landing-text-primary">Neue Zahlung</p>
              <p className="mt-0.5 text-xs text-landing-text-muted">Müller GmbH · RE10024</p>
            </div>
            <p className="font-display text-base font-bold tabular-nums text-landing-text-primary">2.480 €</p>
          </div>
          <div className="mt-4 rounded-xl border border-landing-danger/30 bg-landing-danger-subtle p-4">
            <p className="text-sm font-bold text-landing-danger">Mögliche Doppelzahlung erkannt</p>
            <p className="mt-1 text-xs leading-relaxed text-landing-text-secondary">
              Ähnlicher Vorgang bereits am 03.07.2026 gefunden. Bitte vor Freigabe prüfen.
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-landing-text-muted">Beispielhafte Darstellung einer zukünftigen Funktion – noch nicht Teil des heutigen Funktionsumfangs.</p>
      </div>
    </section>
  );
}
