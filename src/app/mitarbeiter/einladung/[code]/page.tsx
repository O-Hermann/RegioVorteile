import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { activateEmployeeAccount } from "@/actions/auth";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { ThemeToggle } from "@/components/theme-toggle";

const ERROR_MESSAGES: Record<string, string> = {
  "1": "Bitte E-Mail und ein Passwort mit mindestens 8 Zeichen ausfüllen (zweimal identisch).",
  email: "Diese E-Mail-Adresse wird bereits von einem anderen Konto verwendet.",
};

export default async function MitarbeiterEinladungPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { code } = await params;
  const { error } = await searchParams;
  const inviteCode = code.toUpperCase();

  const employee = await prisma.employee.findUnique({ where: { inviteCode } });

  if (!employee) notFound();

  if (employee.passwordHash) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-sand-50">
        <ThemeToggle className="fixed top-4 right-4" />
        <div className={`w-full max-w-sm ${cardClass}`}>
          <h1 className="font-display text-2xl font-semibold text-sand-900">
            Konto bereits eingerichtet
          </h1>
          <p className="mt-2 text-sm text-sand-600">
            Für diesen Einladungslink wurde bereits ein Konto eingerichtet. Bitte melde dich
            direkt an.
          </p>
          <Link href="/mitarbeiter/login" className={`mt-6 block w-full text-center ${primaryButtonClass}`}>
            Zum Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 bg-sand-50">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className={`w-full max-w-sm ${cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">
          Regiovorteile
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">
          Willkommen, {employee.name.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-sm text-sand-600">
          Richte dein Konto ein: bestätige deine E-Mail-Adresse und lege ein Passwort fest.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {ERROR_MESSAGES[error] ?? "Konto konnte nicht eingerichtet werden."}
          </p>
        )}
        <form action={activateEmployeeAccount} className="mt-6 space-y-4">
          <input type="hidden" name="inviteCode" value={inviteCode} />
          <div>
            <label className={labelClass} htmlFor="email">
              E-Mail (dein Benutzername)
            </label>
            <input
              className={inputClass}
              type="email"
              name="email"
              id="email"
              defaultValue={employee.email}
              required
            />
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
            Konto einrichten
          </button>
        </form>
      </div>
    </main>
  );
}
