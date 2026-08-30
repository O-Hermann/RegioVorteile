import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { verifyTwoFactorLogin } from "@/actions/two-factor";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME } from "@/lib/site-config";

// MVP-Roadmap Phase 7-Erweiterung, 2FA (siehe [[effivo_mvp_roadmap]]): zweiter
// Login-Schritt, nur erreichbar mit einer gueltigen pendingTwoFactorUserId in
// der Session (gesetzt von loginEmployer()/login(), siehe actions/auth.ts) -
// ohne das direkte Aufrufen dieser Route zurueck zum normalen Login.
export default async function ArbeitgeberTwoFactorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const session = await getSession();
  if (!session.pendingTwoFactorUserId) {
    redirect("/arbeitgeber/login");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className={`w-full max-w-sm ${cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">{SITE_NAME}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">Zwei-Faktor-Authentifizierung</h1>
        <p className="mt-2 text-sm text-sand-600">Gib den 6-stelligen Code aus deiner Authenticator-App ein.</p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Der Code war nicht korrekt. Bitte erneut versuchen.
          </p>
        )}

        <form action={verifyTwoFactorLogin} className="mt-6 space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          <div>
            <label className={labelClass} htmlFor="code">
              Code
            </label>
            <input
              className={inputClass}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              name="code"
              id="code"
              placeholder="123456 oder Wiederherstellungscode"
              required
              autoFocus
            />
          </div>
          <button type="submit" className={`w-full ${primaryButtonClass}`}>
            Bestätigen
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-sand-500">
          Kein Zugriff mehr auf deine Authenticator-App? Nutze stattdessen einen deiner Wiederherstellungscodes.
        </p>
      </div>
    </main>
  );
}
