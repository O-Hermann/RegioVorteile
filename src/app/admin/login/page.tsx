import Link from "next/link";
import { loginAdmin } from "@/actions/auth";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className={`w-full max-w-sm ${cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">
          Regiovorteile
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">
          Admin-Login
        </h1>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            E-Mail oder Passwort ist falsch.
          </p>
        )}
        <form action={loginAdmin} className="mt-6 space-y-4">
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
        <p className="mt-6 text-center text-sm text-sand-500">
          <Link href="/" className="hover:text-sand-900">
            Zurück zur Startseite
          </Link>
        </p>
      </div>
    </main>
  );
}
