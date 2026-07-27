import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cancelEmployerContract, renewEmployerContract, toggleEmployerApproval } from "@/actions/admin";
import { cardClass, secondaryButtonClass, dangerButtonClass, primaryButtonClass } from "@/lib/ui";
import { getContractStatus } from "@/lib/contract";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function subscriptionStatusClass(status: string) {
  if (status === "aktiv") return "bg-ink-100 text-ink-800";
  if (status === "gekündigt") return "bg-red-50 text-red-700";
  return "bg-gold-100 text-gold-700";
}

export default async function AdminArbeitgeberPage() {
  const employers = await prisma.employer.findMany({
    orderBy: { companyName: "asc" },
    include: {
      user: true,
      region: true,
      pricingTier: true,
      _count: { select: { employees: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-sand-900">Arbeitgeber</h1>
      <p className="mt-2 text-sand-600">Registrierte Firmen-Accounts, Abo-Stufe und Vertragslaufzeit.</p>

      <div className="mt-8 space-y-3">
        {employers.length === 0 && (
          <p className={`${cardClass} text-sand-500`}>Noch keine Arbeitgeber registriert.</p>
        )}
        {employers.map((employer) => {
          const contractStatus = getContractStatus(employer.contractEndDate);
          return (
            <div key={employer.id} className={`${cardClass} flex flex-col gap-4`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <Link
                    href={`/admin/arbeitgeber/${employer.id}`}
                    className="font-semibold text-sand-900 hover:text-gold-600 hover:underline"
                  >
                    {employer.companyName}
                  </Link>
                  <p className="text-sm text-sand-500">{employer.user.email}</p>
                  {(employer.contactFirstName || employer.phone) && (
                    <p className="mt-1 text-xs text-sand-500">
                      {employer.contactFirstName} {employer.contactLastName}
                      {employer.phone && <> · {employer.phone}</>}
                    </p>
                  )}
                  {employer.street && (
                    <p className="text-xs text-sand-400">
                      {employer.street}, {employer.plz} {employer.city}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-sand-400">
                    {employer.region.name} · {employer._count.employees} Mitarbeitende eingeladen
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {!employer.approved && (
                      <span className="inline-block rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">
                        Wartet auf Freigabe
                      </span>
                    )}
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${contractStatus.className}`}
                    >
                      {contractStatus.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sand-900">{employer.pricingTier.label}</p>
                  <p className="text-sm text-sand-500">
                    {formatPrice(employer.pricingTier.monthlyPriceCents)}/Monat
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${subscriptionStatusClass(
                      employer.subscriptionStatus
                    )}`}
                  >
                    {employer.subscriptionStatus}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-card-border pt-3">
                <Link href={`/admin/arbeitgeber/${employer.id}`} className={secondaryButtonClass}>
                  Details
                </Link>
                <Link
                  href={`/admin/arbeitgeber/${employer.id}/bearbeiten`}
                  className={secondaryButtonClass}
                >
                  Bearbeiten
                </Link>
                <form action={toggleEmployerApproval}>
                  <input type="hidden" name="id" value={employer.id} />
                  <button type="submit" className={employer.approved ? secondaryButtonClass : primaryButtonClass}>
                    {employer.approved ? "Freigabe entziehen" : "Freigeben"}
                  </button>
                </form>
                <form action={renewEmployerContract}>
                  <input type="hidden" name="id" value={employer.id} />
                  <button type="submit" className={primaryButtonClass}>
                    Vertrag um 1 Jahr verlängern
                  </button>
                </form>
                <form action={cancelEmployerContract}>
                  <input type="hidden" name="id" value={employer.id} />
                  <button type="submit" className={dangerButtonClass}>
                    Kündigen
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
