import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import {
  COMPANY_ROLE_LABELS,
  PLATFORM_ROLE_LABELS,
  INVITE_ERROR_MESSAGES,
} from "@/lib/company";

export default async function AdminBenutzerPage({
  searchParams,
}: {
  searchParams: Promise<{ newInviteToken?: string; error?: string }>;
}) {
  await requireAdmin();
  const { newInviteToken, error } = await searchParams;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { memberships: { include: { company: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">Benutzer</h1>
          <p className="mt-2 text-sand-600">Plattform- und Unternehmenszugänge verwalten.</p>
        </div>
        <Link href="/admin/benutzer/einladen" className={primaryButtonClass}>
          + Benutzer einladen
        </Link>
      </div>

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

      <div className="mt-8 space-y-3">
        {users.length === 0 && <p className={`${cardClass} text-sand-500`}>Keine Benutzer vorhanden.</p>}
        {users.map((u) => {
          const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
          return (
            <Link
              key={u.id}
              href={`/admin/benutzer/${u.id}`}
              className={`${cardClass} flex items-start justify-between gap-4 flex-wrap hover:border-ink-300 transition-colors`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sand-900">{name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.status === "ACTIVE" ? "bg-ink-100 text-ink-800" : "bg-sand-200 text-sand-700"
                    }`}
                  >
                    {u.status === "ACTIVE" ? "aktiv" : "deaktiviert"}
                  </span>
                  {u.platformRole && (
                    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">
                      {PLATFORM_ROLE_LABELS[u.platformRole]}
                    </span>
                  )}
                </div>
                <p className="text-sm text-sand-500">{u.email}</p>
                <p className="mt-1 text-xs text-sand-400">
                  {u.memberships.length === 0
                    ? "Kein Unternehmen zugeordnet"
                    : u.memberships
                        .map((m) => `${m.company.name} (${COMPANY_ROLE_LABELS[m.role]})`)
                        .join(", ")}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs text-sand-400">
                <p>Erstellt: {u.createdAt.toLocaleDateString("de-DE")}</p>
                <p>Letzter Login: {u.lastLoginAt ? u.lastLoginAt.toLocaleDateString("de-DE") : "—"}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
