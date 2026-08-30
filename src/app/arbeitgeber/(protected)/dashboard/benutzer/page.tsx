import { headers } from "next/headers";
import { requireCompanyMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inviteCompanyMember, changeMembershipRole, removeMembership, resendCompanyInvite } from "@/actions/company";
import {
  dashCardClass,
  dashPrimaryButtonClass,
  dashDangerButtonClass,
  dashSecondaryButtonClass,
  dashLabelClass,
  dashInputClass,
} from "@/components/dashboard/dash-ui";
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
      <h1 className="mt-2 text-3xl font-semibold text-dash-text">Benutzer</h1>
      <p className="mt-2 text-dash-text-secondary">Zugänge und Rollen für {company.name} verwalten.</p>

      {newInviteToken && (
        <div className="mt-4 rounded-lg bg-dash-green-tint px-3 py-2 text-sm text-dash-green">
          <p className="font-medium">Einladung erstellt.</p>
          <p className="mt-1 break-all">
            Einladungslink: {baseUrl}/einladung/{newInviteToken}
          </p>
          <p className="mt-1 text-xs opacity-80">
            Kein E-Mail-Versand eingerichtet – Link manuell weitergeben.
          </p>
        </div>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
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
              <div key={m.id} className={`${dashCardClass} p-6 flex flex-col gap-3`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-dash-text">{name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${membershipStatusBadgeClass(m.status)}`}>
                        {MEMBERSHIP_STATUS_LABELS[m.status]}
                      </span>
                    </div>
                    <p className="text-sm text-dash-text-muted">{m.user.email}</p>
                    <p className="mt-1 text-xs text-dash-text-faint">
                      {COMPANY_ROLE_LABELS[m.role]} · eingeladen am{" "}
                      {m.invitedAt.toLocaleDateString("de-DE")}
                      {m.activatedAt && ` · aktiviert am ${m.activatedAt.toLocaleDateString("de-DE")}`}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-dash-line pt-3">
                    <form action={changeMembershipRole} className="flex items-center gap-2">
                      <input type="hidden" name="membershipId" value={m.id} />
                      <input type="hidden" name="successPath" value={successPath} />
                      <select name="role" defaultValue={m.role} className={`${dashInputClass} !w-auto py-2 text-sm`}>
                        {roleOptions.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className={dashSecondaryButtonClass} disabled={isLastActiveOwner && m.role === "OWNER"}>
                        Rolle ändern
                      </button>
                    </form>
                    {m.status === "INVITED" && (
                      <form action={resendCompanyInvite}>
                        <input type="hidden" name="membershipId" value={m.id} />
                        <input type="hidden" name="successPath" value={successPath} />
                        <button type="submit" className={dashSecondaryButtonClass}>
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
                          className={dashDangerButtonClass}
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
          <div className={`${dashCardClass} p-6`}>
            <h2 className="text-lg font-semibold text-dash-text">Benutzer einladen</h2>
            <form action={inviteCompanyMember} className="mt-4 space-y-4">
              <input type="hidden" name="companyId" value={company.id} />
              <input type="hidden" name="successPath" value={successPath} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={dashLabelClass} htmlFor="firstName">
                    Vorname
                  </label>
                  <input className={dashInputClass} name="firstName" id="firstName" />
                </div>
                <div>
                  <label className={dashLabelClass} htmlFor="lastName">
                    Nachname
                  </label>
                  <input className={dashInputClass} name="lastName" id="lastName" />
                </div>
              </div>
              <div>
                <label className={dashLabelClass} htmlFor="email">
                  E-Mail-Adresse
                </label>
                <input className={dashInputClass} type="email" name="email" id="email" required />
              </div>
              <div>
                <label className={dashLabelClass} htmlFor="role">
                  Unternehmensrolle
                </label>
                <select className={dashInputClass} name="role" id="role" defaultValue="VIEWER" required>
                  {roleOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className={`w-full ${dashPrimaryButtonClass}`}>
                Einladung erstellen
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
