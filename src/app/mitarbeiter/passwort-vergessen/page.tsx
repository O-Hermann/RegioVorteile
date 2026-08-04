import { headers } from "next/headers";
import Link from "next/link";
import { requestEmployeePasswordReset } from "@/actions/password-reset";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME } from "@/lib/site-config";

export default async function MitarbeiterPasswortVergessenPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; token?: string }>;
}) {
  const { sent, token } = await searchParams;
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const resetUrl = token ? `${protocol}://${host}/mitarbeiter/passwort-zuruecksetzen/${token}` : null;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 bg-sand-50">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className={`w-full max-w-sm ${cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">
          {SITE_NAME}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">
          Passwort vergessen
        </h1>
        {sent ? (
          <>
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen
              erstellt.
            </p>
            {resetUrl && (
              <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-xs text-gold-700 break-all">
                Da noch kein E-Mail-Versand eingerichtet ist, hier direkt der Link (normalerweise
                per E-Mail verschickt):{" "}
                <a href={resetUrl} className="font-semibold underline">
                  {resetUrl}
                </a>
              </p>
            )}
            <p className="mt-6 text-center text-sm text-sand-500">
              <Link href="/mitarbeiter/login" className="text-sand-900 hover:underline">
                Zurück zum Login
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-sand-600">
              Gib deine E-Mail-Adresse ein, wir erstellen dir einen Link zum Zurücksetzen.
            </p>
            <form action={requestEmployeePasswordReset} className="mt-6 space-y-4">
              <div>
                <label className={labelClass} htmlFor="email">
                  E-Mail
                </label>
                <input className={inputClass} type="email" name="email" id="email" required />
              </div>
              <button type="submit" className={`w-full ${primaryButtonClass}`}>
                Link erstellen
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-sand-500">
              <Link href="/mitarbeiter/login" className="text-sand-900 hover:underline">
                Zurück zum Login
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
