import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resetEmployeePassword } from "@/actions/password-reset";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME } from "@/lib/site-config";

export default async function MitarbeiterPasswortZuruecksetzenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  const isValid = !!record && !!record.employeeId && !record.usedAt && record.expiresAt > new Date();

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 bg-sand-50">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className={`w-full max-w-sm ${cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">
          {SITE_NAME}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">
          Neues Passwort festlegen
        </h1>
        {!isValid ? (
          <>
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.
            </p>
            <Link
              href="/mitarbeiter/passwort-vergessen"
              className={`mt-6 block w-full text-center ${primaryButtonClass}`}
            >
              Neuen Link anfordern
            </Link>
          </>
        ) : (
          <>
            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                Bitte zwei identische Passwörter mit mindestens 8 Zeichen eingeben.
              </p>
            )}
            <form action={resetEmployeePassword} className="mt-6 space-y-4">
              <input type="hidden" name="token" value={token} />
              <div>
                <label className={labelClass} htmlFor="password">
                  Neues Passwort
                </label>
                <input
                  className={inputClass}
                  type="password"
                  name="password"
                  id="password"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="passwordConfirm">
                  Passwort bestätigen
                </label>
                <input
                  className={inputClass}
                  type="password"
                  name="passwordConfirm"
                  id="passwordConfirm"
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className={`w-full ${primaryButtonClass}`}>
                Passwort speichern
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
