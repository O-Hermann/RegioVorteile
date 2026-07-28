import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { togglePartnerActive, deletePartner } from "@/actions/admin";
import { primaryButtonClass, secondaryButtonClass, dangerButtonClass, cardClass } from "@/lib/ui";
import { getContractStatus } from "@/lib/contract";

export default async function AdminPartnerbetriebePage() {
  const partners = await prisma.partnerBusiness.findMany({
    orderBy: { name: "asc" },
    include: { region: true },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">Partnerbetriebe</h1>
          <p className="mt-2 text-sand-600">
            Betriebe, deren Rabatte Mitarbeitende in ihrer Region einlösen können.
          </p>
        </div>
        <Link href="/admin/partnerbetriebe/neu" className={primaryButtonClass}>
          + Neuer Partnerbetrieb
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {partners.length === 0 && (
          <p className={`${cardClass} text-sand-500`}>Noch keine Partnerbetriebe angelegt.</p>
        )}
        {partners.map((partner) => {
          const contractStatus = getContractStatus(partner.contractEndDate);
          return (
            <div key={partner.id} className={`${cardClass} flex items-start justify-between gap-4 flex-wrap`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sand-900">{partner.name}</p>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800">
                    {partner.category}
                  </span>
                  {!partner.active && (
                    <span className="rounded-full bg-sand-200 px-2 py-0.5 text-xs font-medium text-sand-600">
                      inaktiv
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${contractStatus.className}`}
                  >
                    {contractStatus.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-sand-600">{partner.discountText}</p>
                <p className="mt-1 text-xs text-sand-400">
                  {partner.street}, {partner.plz} {partner.city} · {partner.region.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/partnerbetriebe/${partner.id}`} className={secondaryButtonClass}>
                  Bearbeiten
                </Link>
                <form action={togglePartnerActive}>
                  <input type="hidden" name="id" value={partner.id} />
                  <button type="submit" className={secondaryButtonClass}>
                    {partner.active ? "Deaktivieren" : "Aktivieren"}
                  </button>
                </form>
                <form action={deletePartner}>
                  <input type="hidden" name="id" value={partner.id} />
                  <button type="submit" className={dangerButtonClass}>
                    Löschen
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
