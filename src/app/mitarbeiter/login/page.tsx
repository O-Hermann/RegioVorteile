import Link from "next/link";
import { loginEmployee } from "@/actions/auth";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function MitarbeiterLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 bg-sand-50">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className={`w-full max-w-sm ${cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">
          Regiovorteile
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">
          Mitarbeiter-Login
        </h1>
        {reset && (
          <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Passwort erfolgreich geändert. Du kannst dich jetzt anmelden.
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            E-Mail oder Passwort ist falsch.
          </p>
        )}
        <form action={loginEmployee} className="mt-6 space-y-4">
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
          <button type="submit" className={`w-full ${primaryButtonClass}`}>
            Anmelden
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/mitarbeiter/passwort-vergessen" className="text-sand-500 hover:text-sand-900 hover:underline">
            Passwort vergessen?
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-sand-500">
          Du hast einen Einladungslink von deinem Arbeitgeber erhalten? Öffne ihn, um dein Konto
          einzurichten.
        </p>
      </div>
    </main>
  );
}
