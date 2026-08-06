import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { cardClass, primaryButtonClass } from "@/lib/ui";

export default async function AdminUnternehmenPage() {
  await requireAdmin();

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "asc" },
    include: { memberships: { include: { user: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">Unternehmen</h1>
          <p className="mt-2 text-sand-600">Kundenunternehmen und ihre Mitglieder verwalten.</p>
        </div>
        <Link href="/admin/unternehmen/neu" className={primaryButtonClass}>
          + Unternehmen anlegen
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {companies.length === 0 && <p className={`${cardClass} text-sand-500`}>Noch keine Unternehmen vorhanden.</p>}
        {companies.map((c) => {
          const activeMembers = c.memberships.filter((m) => m.status === "ACTIVE");
          const owner = activeMembers.find((m) => m.role === "OWNER");
          const ownerName = owner
            ? [owner.user.firstName, owner.user.lastName].filter(Boolean).join(" ") || owner.user.email
            : "—";
          return (
            <Link
              key={c.id}
              href={`/admin/unternehmen/${c.id}`}
              className={`${cardClass} flex items-start justify-between gap-4 flex-wrap hover:border-ink-300 transition-colors`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sand-900">{c.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === "ACTIVE" ? "bg-ink-100 text-ink-800" : "bg-sand-200 text-sand-700"
                    }`}
                  >
                    {c.status === "ACTIVE" ? "aktiv" : "deaktiviert"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-sand-500">Inhaber: {ownerName}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-sand-400">
                <p>{activeMembers.length} aktive Benutzer</p>
                <p>Erstellt: {c.createdAt.toLocaleDateString("de-DE")}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
