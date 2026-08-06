import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { inviteCompanyMember } from "@/actions/company";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/ui";
import { COMPANY_ROLE_LABELS, PLATFORM_ROLE_LABELS, INVITE_ERROR_MESSAGES } from "@/lib/company";

export default async function AdminBenutzerEinladenPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireAdmin();
  const { error } = await searchParams;

  const [actingUser, companies] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId! } }),
    prisma.company.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ]);
  const isSuperadmin = actingUser?.platformRole === "SUPERADMIN";
  const roleOptions = Object.entries(COMPANY_ROLE_LABELS) as [string, string][];
  const platformRoleOptions = Object.entries(PLATFORM_ROLE_LABELS) as [string, string][];

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Benutzer einladen</h1>
      <p className="mt-2 text-sand-600">
        Erstellt einen Einladungslink für ein Unternehmen. Es ist noch kein E-Mail-Versand
        eingerichtet – der Link wird nach dem Absenden hier einmalig angezeigt.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {INVITE_ERROR_MESSAGES[error] ?? "Einladung konnte nicht erstellt werden."}
        </p>
      )}

      <div className={`mt-6 ${cardClass}`}>
        {companies.length === 0 ? (
          <p className="text-sm text-sand-500">
            Es existiert noch kein aktives Unternehmen. Legen Sie zuerst ein Unternehmen an.
          </p>
        ) : (
          <form action={inviteCompanyMember} className="space-y-4">
            <input type="hidden" name="successPath" value="/admin/benutzer" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="firstName">
                  Vorname
                </label>
                <input className={inputClass} name="firstName" id="firstName" />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">
                  Nachname
                </label>
                <input className={inputClass} name="lastName" id="lastName" />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="email">
                E-Mail-Adresse
              </label>
              <input className={inputClass} type="email" name="email" id="email" required />
            </div>
            <div>
              <label className={labelClass} htmlFor="companyId">
                Unternehmen
              </label>
              <select className={inputClass} name="companyId" id="companyId" required>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="role">
                Unternehmensrolle
              </label>
              <select className={inputClass} name="role" id="role" defaultValue="VIEWER" required>
                {roleOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {isSuperadmin && (
              <div>
                <label className={labelClass} htmlFor="platformRole">
                  Plattformrolle (optional, nur für Administratoren sichtbar)
                </label>
                <select className={inputClass} name="platformRole" id="platformRole" defaultValue="">
                  <option value="">keine Plattformrolle</option>
                  {platformRoleOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className={`w-full ${primaryButtonClass}`}>
              Einladung erstellen
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
