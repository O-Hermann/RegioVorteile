import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { renameCompany, setCompanyStatus, inviteCompanyMember, changeMembershipRole, removeMembership, resendCompanyInvite } from "@/actions/company";
import { cardClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass, dangerButtonClass } from "@/lib/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import {
  COMPANY_ROLE_LABELS,
  MEMBERSHIP_STATUS_LABELS,
  membershipStatusBadgeClass,
  INVITE_ERROR_MESSAGES,
} from "@/lib/company";

export default async function AdminUnternehmenDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; newInviteToken?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error, newInviteToken } = await searchParams;

  const company = await prisma.company.findUnique({
    where: { id },
    include: { memberships: { include: { user: true }, orderBy: [{ status: "asc" }, { invitedAt: "desc" }] } },
  });

  if (!company) notFound();

  const successPath = `/admin/unternehmen/${id}`;
  const roleOptions = Object.entries(COMPANY_ROLE_LABELS) as [string, string][];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/unternehmen" className="text-sm text-sand-500 hover:text-sand-900">
        ← Zurück zur Übersicht
      </Link>

      <h1 className="mt-2 font-display text-3xl font-semibold text-sand-900">{company.name}</h1>

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
          <h2 className="font-display text-lg font-semibold text-sand-900">Details</h2>
          <form action={renameCompany} className="mt-4 flex items-end gap-2">
            <input type="hidden" name="id" value={company.id} />
            <div className="flex-1">
              <label className={labelClass} htmlFor="name">
                Name
              </label>
              <input className={inputClass} name="name" id="name" defaultValue={company.name} required />
            </div>
            <button type="submit" className={secondaryButtonClass}>
              Speichern
            </button>
          </form>

          <div className="mt-6 border-t border-card-border pt-4">
            <p className={labelClass}>Status</p>
            <form action={setCompanyStatus}>
              <input type="hidden" name="id" value={company.id} />
              <input type="hidden" name="status" value={company.status === "ACTIVE" ? "DISABLED" : "ACTIVE"} />
              {company.status === "ACTIVE" ? (
                <ConfirmSubmitButton
                  confirmMessage={`${company.name} wirklich deaktivieren? Mitglieder verlieren dadurch den Zugriff.`}
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
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Mitglieder</h2>
          <div className="mt-4 space-y-3">
            {company.memberships.length === 0 && (
              <p className="text-sm text-sand-500">Noch keine Mitglieder.</p>
            )}
            {company.memberships.map((m) => {
              const name = [m.user.firstName, m.user.lastName].filter(Boolean).join(" ") || m.user.email;
              return (
                <div key={m.id} className="rounded-xl border border-card-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-sand-900">{name}</p>
                      <p className="text-xs text-sand-500">{m.user.email}</p>
                    </div>
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
                        confirmMessage={`${name} wirklich aus ${company.name} entfernen?`}
                        className={dangerButtonClass}
                      >
                        Entfernen
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-card-border pt-4">
            <p className={labelClass}>Mitglied hinzufügen</p>
            <form action={inviteCompanyMember} className="space-y-2">
              <input type="hidden" name="companyId" value={company.id} />
              <input type="hidden" name="successPath" value={successPath} />
              <input className={inputClass} type="email" name="email" placeholder="E-Mail-Adresse" required />
              <div className="flex items-center gap-2">
                <select name="role" defaultValue="VIEWER" className={inputClass} required>
                  {roleOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="submit" className={`shrink-0 ${primaryButtonClass}`}>
                  Einladen
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
