import Link from "next/link";
import { loginEmployer } from "@/actions/auth";
import { LandingThemeToggle } from "@/components/landing-theme-toggle";
import { SITE_NAME } from "@/lib/site-config";

// Kundensicht-Audit (2026-08-30, siehe [[effivo_mvp_roadmap]]): auf den
// --landing-*-Namensraum umgestellt statt lib/ui.ts (sand/gold/ink - siehe
// gleichlautender Kommentar in src/app/login/page.tsx). "Jetzt registrieren"
// verlinkte bisher auf die inzwischen stillgelegte Selbstregistrierung
// (/arbeitgeber/registrieren, leitet jetzt selbst auf /kontakt um) - hier
// direkt auf /kontakt verlinkt, gleicher Wortlaut wie auf /login.
const inputClass =
  "w-full rounded-lg border border-landing-border bg-landing-card px-3 py-2 text-sm text-landing-text-primary placeholder:text-landing-text-muted focus:outline-none focus:ring-2 focus:ring-landing-accent focus:border-landing-accent transition-colors";

const labelClass = "block text-sm font-medium text-landing-text-secondary mb-1";

export default async function ArbeitgeberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string; deleted?: string }>;
}) {
  const { error, reset, deleted } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center bg-landing-bg px-4 py-16">
      <div className="fixed top-4 right-4">
        <LandingThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-landing-border bg-landing-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-landing-text-muted">
          {SITE_NAME}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-landing-text-primary">
          Arbeitgeber-Login
        </h1>
        {reset && (
          <p className="mt-3 rounded-lg bg-landing-success-subtle px-3 py-2 text-sm text-landing-success">
            Passwort erfolgreich geändert. Sie können sich jetzt anmelden.
          </p>
        )}
        {deleted && (
          <p className="mt-3 rounded-lg bg-landing-success-subtle px-3 py-2 text-sm text-landing-success">
            Ihr Konto wurde gelöscht. Sie sind jetzt abgemeldet.
          </p>
        )}
        {error === "pending" && (
          <p className="mt-3 rounded-lg bg-landing-warning-subtle px-3 py-2 text-sm text-landing-warning">
            Ihr Account wird noch von uns geprüft. Wir schalten Sie zeitnah frei, sobald die
            Prüfung abgeschlossen ist.
          </p>
        )}
        {error && error !== "pending" && (
          <p className="mt-3 rounded-lg bg-landing-danger-subtle px-3 py-2 text-sm text-landing-danger">
            E-Mail oder Passwort ist falsch.
          </p>
        )}
        <form action={loginEmployer} className="mt-6 space-y-4">
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
          <button
            type="submit"
            className="w-full rounded-full bg-landing-accent hover:bg-landing-accent-hover px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            Anmelden
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link
            href="/arbeitgeber/passwort-vergessen"
            className="text-landing-text-muted hover:text-landing-text-primary hover:underline"
          >
            Passwort vergessen?
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-landing-text-muted">
          Noch keinen Zugang?{" "}
          <Link href="/kontakt" className="font-medium text-landing-accent hover:text-landing-accent-hover hover:underline">
            Pilotphase anfragen
          </Link>
        </p>
      </div>
    </main>
  );
}
