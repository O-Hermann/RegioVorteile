import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  cancelEmployerContract,
  renewEmployerContract,
  toggleEmployerApproval,
  deleteEmployer,
} from "@/actions/admin";
import { getContractStatus } from "@/lib/contract";
import {
  cardClass,
  secondaryButtonClass,
  dangerButtonClass,
  primaryButtonClass,
} from "@/lib/ui";

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

export default async function EmployerOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const employer = await prisma.employer.findUnique({
    where: { id },
    include: {
      user: true,
      region: true,
      pricingTier: true,
      employees: {
        orderBy: { createdAt: "desc" },
        include: {
          redemptions: {
            orderBy: { createdAt: "desc" },
            include: { partnerBusiness: true },
          },
        },
      },
    },
  });

  if (!employer) notFound();

  const activeEmployees = employer.employees.filter((e) => e.status === "ACTIVE");
  const invitedEmployees = employer.employees.filter((e) => e.status === "INVITED");
  const redemptions = employer.employees
    .flatMap((e) => e.redemptions.map((r) => ({ ...r, employeeName: e.name })))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const contractStatus = getContractStatus(employer.contractEndDate);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/arbeitgeber" className="text-sm text-sand-500 hover:text-sand-900">
        ← Zurück zur Übersicht
      </Link>

      <div className={`${cardClass} mt-4 flex flex-col gap-4`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-semibold text-sand-900">
              {employer.companyName}
            </h1>
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
            <p className="mt-1 text-xs text-sand-400">{employer.region.name}</p>
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
          <Link href={`/admin/arbeitgeber/${employer.id}/bearbeiten`} className={secondaryButtonClass}>
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
          {employer.subscriptionStatus === "gekündigt" && (
            <form action={deleteEmployer}>
              <input type="hidden" name="id" value={employer.id} />
              <button type="submit" className={dangerButtonClass}>
                Löschen
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-sand-900">
            Mitarbeitende ({employer.employees.length})
          </h2>
          <div className="mt-3 space-y-2">
            {employer.employees.length === 0 && (
              <p className={`${cardClass} text-sm text-sand-500`}>Noch keine Mitarbeitenden eingeladen.</p>
            )}
            {activeEmployees.map((employee) => (
              <div key={employee.id} className={`${cardClass} flex items-center justify-between gap-3`}>
                <div>
                  <p className="font-medium text-sand-900">{employee.name}</p>
                  {employee.email && <p className="text-xs text-sand-500">{employee.email}</p>}
                </div>
                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800">
                  aktiv
                </span>
              </div>
            ))}
            {invitedEmployees.map((employee) => (
              <div key={employee.id} className={`${cardClass} flex items-center justify-between gap-3`}>
                <div>
                  <p className="font-medium text-sand-900">{employee.name}</p>
                  {employee.email && <p className="text-xs text-sand-500">{employee.email}</p>}
                </div>
                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">
                  eingeladen
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-sand-900">
            Eingelöste Rabatte ({redemptions.length})
          </h2>
          <div className="mt-3 space-y-2">
            {redemptions.length === 0 && (
              <p className={`${cardClass} text-sm text-sand-500`}>Noch keine Rabatte eingelöst.</p>
            )}
            {redemptions.map((r) => (
              <div key={r.id} className={`${cardClass} flex items-center justify-between gap-3`}>
                <div>
                  <p className="font-medium text-sand-900">{r.employeeName}</p>
                  <p className="text-xs text-sand-500">{r.partnerBusiness.name}</p>
                </div>
                <p className="text-xs text-sand-400">{r.createdAt.toLocaleDateString("de-DE")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
