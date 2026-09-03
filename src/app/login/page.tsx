import Link from "next/link";
import { login } from "@/actions/auth";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";

// Kundensicht-Audit (2026-08-30, siehe [[effivo_mvp_roadmap]]): auf den
// --landing-*-Namensraum umgestellt (bereits als Goldstandard-Palette auf
// der Startseite etabliert, siehe globals.css) statt der alten
// petrol/slate/cockpit-Klassen aus einer frueheren Produktphase - Header/
// Footer dieser Seite nutzten bereits landing-* (LandingHeader/
// LandingFooter), nur die Formular-Karte selbst war noch im alten Stil.
// Keine "dark:"-Praefixe noetig: die landing-*-Tokens wechseln bereits ueber
// die CSS-Variable selbst (siehe :root[data-theme=dark] in globals.css).
const inputClass =
  "w-full rounded-lg border border-landing-border bg-landing-card px-3 py-2 text-sm text-landing-text-primary placeholder:text-landing-text-muted focus:outline-none focus:ring-2 focus:ring-landing-accent focus:border-landing-accent transition-colors";

const labelClass = "block text-sm font-medium text-landing-text-secondary mb-1";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <>
      <LandingHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-landing-border bg-landing-card p-6 sm:p-8">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-landing-text-primary">
              Willkommen zurück
            </h1>
            <p className="mt-2 text-sm text-landing-text-secondary">
              Melden Sie sich an, um Ihre Unternehmenszahlen und aktuellen Auswertungen
              aufzurufen.
            </p>

            {error === "pending" && (
              <p className="mt-4 rounded-lg bg-landing-warning-subtle px-3 py-2 text-sm text-landing-warning">
                Ihr Account wird noch von uns geprüft. Wir schalten Sie zeitnah frei, sobald die
                Prüfung abgeschlossen ist.
              </p>
            )}
            {error && error !== "pending" && (
              <p className="mt-4 rounded-lg bg-landing-danger-subtle px-3 py-2 text-sm text-landing-danger">
                E-Mail oder Passwort ist falsch.
              </p>
            )}

            <form action={login} className="mt-6 space-y-4">
              {next && <input type="hidden" name="next" value={next} />}
              <div>
                <label className={labelClass} htmlFor="email">
                  E-Mail
                </label>
                <input className={inputClass} type="email" name="email" id="email" required />
              </div>
              <div>
                <label className={labelClass} htmlFor="password">
                  Passwort
                </label>
                <input
                  className={inputClass}
                  type="password"
                  name="password"
                  id="password"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-landing-text-secondary">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-landing-border accent-landing-accent"
                  />
                  Angemeldet bleiben
                </label>
                <Link
                  href="/arbeitgeber/passwort-vergessen"
                  className="text-landing-accent hover:text-landing-accent-hover hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-landing-accent hover:bg-landing-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                Anmelden
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-landing-text-muted">
            Noch keinen Zugang?{" "}
            <Link
              href="/kontakt"
              className="font-medium text-landing-accent hover:text-landing-accent-hover hover:underline"
            >
              Pilotphase anfragen
            </Link>
          </p>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
