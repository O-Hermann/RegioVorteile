import Link from "next/link";
import { login } from "@/actions/auth";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";

const inputClass =
  "w-full rounded-lg border border-petrol-200 dark:border-cockpit-border bg-white dark:bg-cockpit-card-dark px-3 py-2 text-sm text-slate-900 dark:text-cockpit-heading placeholder:text-slate-400 dark:placeholder:text-cockpit-text-weak focus:outline-none focus:ring-2 focus:ring-cockpit-accent focus:border-cockpit-accent transition-colors";

const labelClass = "block text-sm font-medium text-slate-700 dark:text-cockpit-text mb-1";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <LandingHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-card p-6 sm:p-8">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-cockpit-heading">
              Willkommen zurück
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-cockpit-text">
              Melden Sie sich an, um Ihre Unternehmenszahlen und aktuellen Auswertungen
              aufzurufen.
            </p>

            {error === "pending" && (
              <p className="mt-4 rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-700 dark:bg-cockpit-accent-subtle dark:text-cockpit-warning">
                Ihr Account wird noch von uns geprüft. Wir schalten Sie zeitnah frei, sobald die
                Prüfung abgeschlossen ist.
              </p>
            )}
            {error && error !== "pending" && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-cockpit-negative">
                E-Mail oder Passwort ist falsch.
              </p>
            )}

            <form action={login} className="mt-6 space-y-4">
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
                <label className="flex items-center gap-2 text-slate-600 dark:text-cockpit-text-secondary">
                  <input
                    type="checkbox"
                    name="remember"
                    className="h-4 w-4 rounded border-petrol-200 dark:border-cockpit-border accent-cockpit-accent"
                  />
                  Angemeldet bleiben
                </label>
                <Link
                  href="/arbeitgeber/passwort-vergessen"
                  className="text-cockpit-accent dark:text-cockpit-accent-light hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-cockpit-accent hover:bg-cockpit-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                Anmelden
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-cockpit-text-weak">
            Noch keinen Zugang?{" "}
            <Link
              href="/kontakt"
              className="font-medium text-cockpit-accent dark:text-cockpit-accent-light hover:underline"
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
