import { headers } from "next/headers";
import { requireCompanyMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inviteCompanyMember, changeMembershipRole, removeMembership, resendCompanyInvite } from "@/actions/company";
import { cardClass, primaryButtonClass, dangerButtonClass, secondaryButtonClass, labelClass, inputClass } from "@/lib/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import {
  COMPANY_ROLE_LABELS,
  MEMBERSHIP_STATUS_LABELS,
  membershipStatusBadgeClass,
  COMPANY_MANAGER_ROLES,
  INVITE_ERROR_MESSAGES,
} from "@/lib/company";
import { PageNav } from "@/components/page-nav";

export default async function UnternehmensBenutzerPage({
  searchParams,
}: {
  searchParams: Promise<{ newInviteToken?: string; error?: string }>;
}) {
  const { company, membership: myMembership } = await requireCompanyMember();
  const { newInviteToken, error } = await searchParams;

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = host ? `${protocol}://${host}` : "";

  const canManage = COMPANY_MANAGER_ROLES.includes(myMembership.role);

  const memberships = await prisma.companyMembership.findMany({
    where: { companyId: company.id },
    orderBy: [{ status: "asc" }, { invitedAt: "desc" }],
    include: { user: true },
  });

  const successPath = "/arbeitgeber/dashboard/benutzer";
  const roleOptions = Object.entries(COMPANY_ROLE_LABELS) as [string, string][];

  return (
    <div>
      <PageNav />
      <h1 className="mt-2 font-display text-3xl font-semibold text-sand-900">Benutzer</h1>
      <p className="mt-2 text-sand-600">Zugänge und Rollen für {company.name} verwalten.</p>

      {newInviteToken && (
        <div className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <p className="font-medium">Einladung erstellt.</p>
          <p className="mt-1 break-all">
            Einladungslink: {baseUrl}/einladung/{newInviteToken}
          </p>
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {memberships.map((m) => {
            const name = [m.user.firstName, m.user.lastName].filter(Boolean).join(" ") || m.user.email;
            const isLastActiveOwner =
              m.role === "OWNER" &&
              m.status === "ACTIVE" &&
              memberships.filter((x) => x.role === "OWNER" && x.status === "ACTIVE").length <= 1;
            return (
              <div key={m.id} className={`${cardClass} flex flex-col gap-3`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sand-900">{name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${membershipStatusBadgeClass(m.status)}`}>
                        {MEMBERSHIP_STATUS_LABELS[m.status]}
                      </span>
                    </div>
                    <p className="text-sm text-sand-500">{m.user.email}</p>
                    <p className="mt-1 text-xs text-sand-400">
                      {COMPANY_ROLE_LABELS[m.role]} · eingeladen am{" "}
                      {m.invitedAt.toLocaleDateString("de-DE")}
                      {m.activatedAt && ` · aktiviert am ${m.activatedAt.toLocaleDateString("de-DE")}`}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-card-border pt-3">
                    <form action={changeMembershipRole} className="flex items-center gap-2">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <input type="hidden" name="successPath" value={successPath} />
                      <select name="role" defaultValue={m.role} className={`${inputClass} !w-auto py-2 text-sm`}>
                        {roleOptions.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className={secondaryButtonClass} disabled={isLastActiveOwner && m.role === "OWNER"}>
                        Rolle ändern
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
                    {!isLastActiveOwner && m.userId !== myMembership.userId && (
                      <form action={removeMembership}>
                        <input type="hidden" name="membershipId" value={m.id} />
                        <input type="hidden" name="successPath" value={successPath} />
                        <ConfirmSubmitButton
                          confirmMessage={`${name} wirklich aus ${company.name} entfernen?`}
                          className={dangerButtonClass}
                        >
                          Entfernen
                        </ConfirmSubmitButton>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {canManage && (
          <div className={cardClass}>
            <h2 className="font-display text-lg font-semibold text-sand-900">Benutzer einladen</h2>
            <form action={inviteCompanyMember} className="mt-4 space-y-4">
              <input type="hidden" name="companyId" value={company.id} />
              <input type="hidden" name="successPath" value={successPath} />
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
              <button type="submit" className={`w-full ${primaryButtonClass}`}>
                Einladung erstellen
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
