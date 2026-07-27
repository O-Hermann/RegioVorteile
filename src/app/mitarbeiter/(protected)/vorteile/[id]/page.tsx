import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateRedemptionCode } from "@/actions/employee";
import { cardClass } from "@/lib/ui";

export default async function VorteilDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { employee } = await requireEmployee();
  const { id } = await params;

  const partner = await prisma.partnerBusiness.findFirst({
    where: { id, regionId: employee.employer.regionId, active: true },
  });
  if (!partner) notFound();

  const code = await getOrCreateRedemptionCode(partner.id);
  const qrDataUrl = await QRCode.toDataURL(code, { margin: 1, width: 240 });

  return (
    <div>
      <Link href="/mitarbeiter/vorteile" className="text-sm text-sand-500 hover:text-sand-900">
        ← Zurück zur Übersicht
      </Link>

      <div className={`${cardClass} mt-4`}>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-semibold text-sand-900">{partner.name}</h1>
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-800">
            {partner.category}
          </span>
        </div>
        <p className="mt-2 text-sand-700">{partner.description}</p>
        <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-gold-800 font-semibold">
          {partner.discountText}
        </p>
        <p className="mt-2 text-sm text-sand-600">
          {partner.street}, {partner.plz} {partner.city}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${partner.name}, ${partner.street}, ${partner.plz} ${partner.city}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm font-medium text-sand-900 hover:underline"
        >
          Route anzeigen →
        </a>
      </div>

      <div className={`${cardClass} mt-4 text-center`}>
        <h2 className="font-display text-lg font-semibold text-sand-900">
          Rabatt-Code vor Ort zeigen
        </h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR-Code für Rabatt bei ${partner.name}`}
          className="mx-auto mt-4 h-48 w-48 rounded-lg border border-card-border"
        />
        <p className="mt-4 font-mono text-2xl tracking-widest text-sand-900">{code}</p>
        <p className="mt-1 text-xs text-sand-500">
          Code oder QR-Code beim Personal in {partner.name} vorzeigen.
        </p>
      </div>
    </div>
  );
}
