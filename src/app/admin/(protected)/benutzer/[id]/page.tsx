import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateUserProfile, setUserStatus, setPlatformRole } from "@/actions/admin-users";
import { inviteCompanyMember, changeMembershipRole, removeMembership, resendCompanyInvite } from "@/actions/company";
import { cardClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/lib/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import {
  COMPANY_ROLE_LABELS,
  PLATFORM_ROLE_LABELS,
  MEMBERSHIP_STATUS_LABELS,
  membershipStatusBadgeClass,
  INVITE_ERROR_MESSAGES,
} from "@/lib/company";

export default async function AdminBenutzerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; newInviteToken?: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const { error, newInviteToken } = await searchParams;

  const [actingUser, user, allCompanies] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId! } }),
    prisma.user.findUnique({
      where: { id },
      include: { memberships: { include: { company: true }, orderBy: { invitedAt: "desc" } } },
    }),
    prisma.company.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } }),
  ]);

  if (!user) notFound();

  const isSuperadmin = actingUser?.platformRole === "SUPERADMIN";
  const successPath = `/admin/benutzer/${id}`;
  const memberCompanyIds = new Set(user.memberships.map((m) => m.companyId));
  const availableCompanies = allCompanies.filter((c) => !memberCompanyIds.has(c.id));
  const roleOptions = Object.entries(COMPANY_ROLE_LABELS) as [string, string][];
  const platformRoleOptions = Object.entries(PLATFORM_ROLE_LABELS) as [string, string][];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/benutzer" className="text-sm text-sand-500 hover:text-sand-900">
        ← Zurück zur Übersicht
      </Link>

      <h1 className="mt-2 font-display text-3xl font-semibold text-sand-900">{user.email}</h1>

      {newInviteToken && (
        <div className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <p className="font-medium">Einladung erstellt.</p>
          <p className="mt-1 break-all">Einladungslink: /einladung/{newInviteToken}</p>
          <p className="mt-1 text-xs text-green-600">
            Kein E-Mail-Versand eingerichtet – Link manuell weitergeben.
          </p>
        </div>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {INVITE_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Profil</h2>
          <form action={updateUserProfile} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={user.id} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="firstName">
                  Vorname
                </label>
                <input className={inputClass} name="firstName" id="firstName" defaultValue={user.firstName ?? ""} />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">
                  Nachname
                </label>
                <input className={inputClass} name="lastName" id="lastName" defaultValue={user.lastName ?? ""} />
              </div>
            </div>
            <button type="submit" className={primaryButtonClass}>
              Speichern
            </button>
          </form>

          <div className="mt-6 border-t border-card-border pt-4">
            <p className={labelClass}>Status</p>
            <form action={setUserStatus} className="flex items-center gap-2">
              <input type="hidden" name="id" value={user.id} />
              <input type="hidden" name="status" value={user.status === "ACTIVE" ? "DISABLED" : "ACTIVE"} />
              {user.status === "ACTIVE" ? (
                <ConfirmSubmitButton
                  confirmMessage={`${user.email} wirklich deaktivieren?`}
                  className={dangerButtonClass}
                >
                  Deaktivieren
                </ConfirmSubmitButton>
              ) : (
                <button type="submit" className={secondaryButtonClass}>
                  Aktivieren
                </button>
              )}
            </form>
          </div>

          {isSuperadmin && (
            <div className="mt-6 border-t border-card-border pt-4">
              <label className={labelClass} htmlFor="platformRole">
                Plattformrolle
              </label>
              <form action={setPlatformRole} className="flex items-center gap-2">
                <input type="hidden" name="id" value={user.id} />
                <select className={inputClass} name="platformRole" id="platformRole" defaultValue={user.platformRole ?? ""}>
                  <option value="">keine Plattformrolle</option>
                  {platformRoleOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="submit" className={secondaryButtonClass}>
                  Speichern
                </button>
              </form>
            </div>
          )}
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Unternehmen</h2>
          <div className="mt-4 space-y-3">
            {user.memberships.length === 0 && (
              <p className="text-sm text-sand-500">Keinem Unternehmen zugeordnet.</p>
            )}
            {user.memberships.map((m) => (
              <div key={m.id} className="rounded-xl border border-card-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sand-900">{m.company.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${membershipStatusBadgeClass(m.status)}`}>
                    {MEMBERSHIP_STATUS_LABELS[m.status]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <form action={changeMembershipRole} className="flex items-center gap-2">
                    <input type="hidden" name="membershipId" value={m.id} />
                    <input type="hidden" name="successPath" value={successPath} />
                    <select name="role" defaultValue={m.role} className={`${inputClass} !w-auto py-1 text-xs`}>
                      {roleOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className={secondaryButtonClass}>
                      Ändern
                    </button>
                  </form>
                  {m.status === "INVITED" && (
                    <form action={resendCompanyInvite}>
                      <input type="hidden" name="membershipId" value={m.id} />
                      <input type="hidden" name="successPath" value={successPath} />
                      <button type="submit" className={secondaryButtonClass}>
                        Einladung erneuern
                      </button>
                    </form>
                  )}
                  <form action={removeMembership}>
                    <input type="hidden" name="membershipId" value={m.id} />
                    <input type="hidden" name="successPath" value={successPath} />
                    <ConfirmSubmitButton
                      confirmMessage={`Mitgliedschaft bei ${m.company.name} wirklich entfernen?`}
                      className={dangerButtonClass}
                    >
                      Entfernen
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {availableCompanies.length > 0 && (
            <div className="mt-4 border-t border-card-border pt-4">
              <p className={labelClass}>Zu Unternehmen hinzufügen</p>
              <form action={inviteCompanyMember} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="email" value={user.email} />
                <input type="hidden" name="successPath" value={successPath} />
                <select name="companyId" className={`${inputClass} !w-auto`} required>
                  {availableCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select name="role" defaultValue="VIEWER" className={`${inputClass} !w-auto`} required>
                  {roleOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="submit" className={secondaryButtonClass}>
                  Hinzufügen
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
