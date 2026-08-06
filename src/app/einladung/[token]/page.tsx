import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { claimCompanyInvite } from "@/actions/company";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME } from "@/lib/site-config";
import { COMPANY_ROLE_LABELS } from "@/lib/company";

const ERROR_MESSAGES: Record<string, string> = {
  "1": "Bitte ein Passwort mit mindestens 8 Zeichen angeben (zweimal identisch).",
};

export default async function EinladungPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const membership = await prisma.companyMembership.findUnique({
    where: { inviteToken: token },
    include: { user: true, company: true },
  });

  if (
    !membership ||
    membership.status !== "INVITED" ||
    !membership.inviteTokenExpiresAt ||
    membership.inviteTokenExpiresAt < new Date()
  ) {
    redirect("/einladung/ungueltig");
  }

  const roleLabel = COMPANY_ROLE_LABELS[membership.role];

  // Bestehender Nutzer (hat bereits ein Passwort) wird zu einem weiteren
  // Unternehmen eingeladen - erfordert ein bestehendes Login als genau
  // dieser Nutzer, kein neues Passwort noetig.
  if (membership.user.passwordHash) {
    const session = await getSession();
    const alreadyLoggedIn = session.userId === membership.userId;

    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-sand-50">
        <ThemeToggle className="fixed top-4 right-4" />
        <div className={`w-full max-w-sm ${cardClass}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">{SITE_NAME}</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">
            Einladung zu {membership.company.name}
          </h1>
          <p className="mt-2 text-sm text-sand-600">
            Sie wurden als {roleLabel} zu {membership.company.name} eingeladen.
          </p>
          {alreadyLoggedIn ? (
            <form action={claimCompanyInvite} className="mt-6">
              <input type="hidden" name="token" value={token} />
              <button type="submit" className={`w-full ${primaryButtonClass}`}>
                Einladung annehmen
              </button>
            </form>
          ) : (
            <>
              <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-700">
                Bitte melden Sie sich zunächst mit Ihrem bestehenden Konto ({membership.user.email})
                an, um diese Einladung anzunehmen.
              </p>
              <Link
                href={`/login?next=${encodeURIComponent(`/einladung/${token}`)}`}
                className={`mt-4 block w-full text-center ${primaryButtonClass}`}
              >
                Zum Login
              </Link>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 bg-sand-50">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className={`w-full max-w-sm ${cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">{SITE_NAME}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">
          Willkommen{membership.user.firstName ? `, ${membership.user.firstName}` : ""}!
        </h1>
        <p className="mt-2 text-sm text-sand-600">
          Sie wurden als {roleLabel} zu {membership.company.name} eingeladen. Legen Sie ein
          Passwort fest, um Ihr Konto einzurichten.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {ERROR_MESSAGES[error] ?? "Konto konnte nicht eingerichtet werden."}
          </p>
        )}
        <form action={claimCompanyInvite} className="mt-6 space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="firstName">
                Vorname
              </label>
              <input
                className={inputClass}
                name="firstName"
                id="firstName"
                defaultValue={membership.user.firstName ?? ""}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="lastName">
                Nachname
              </label>
              <input
                className={inputClass}
                name="lastName"
                id="lastName"
                defaultValue={membership.user.lastName ?? ""}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="password">
              Passwort
            </label>
            <input className={inputClass} type="password" name="password" id="password" minLength={8} required />
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
