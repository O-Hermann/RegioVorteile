import { prisma } from "@/lib/prisma";
import { markPartnerInquiryDone, deletePartnerInquiry } from "@/actions/partner-inquiry";
import { cardClass, secondaryButtonClass, dangerButtonClass } from "@/lib/ui";
import { partnerInquiryStatusLabel, partnerInquiryStatusBadgeClass } from "@/lib/partner-inquiry";

export default async function AdminPartnerInquiriesPage() {
  const inquiries = await prisma.partnerInquiry.findMany({
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-sand-900">Partneranfragen</h1>
      <p className="mt-2 text-sand-600">
        Anfragen von Betrieben, die über die Startseite Partnerbetrieb werden möchten.
      </p>

      <div className="mt-8 space-y-3">
        {inquiries.length === 0 && (
          <p className={`${cardClass} text-sand-500`}>Noch keine Partneranfragen eingegangen.</p>
        )}
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className={cardClass}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${partnerInquiryStatusBadgeClass(inquiry.status)}`}
                  >
                    {partnerInquiryStatusLabel(inquiry.status)}
                  </span>
                  <p className="font-semibold text-sand-900">{inquiry.businessName}</p>
                </div>
                <p className="mt-2 text-sm text-sand-800">
                  {inquiry.contactName} ·{" "}
                  <a href={`mailto:${inquiry.email}`} className="hover:underline">
                    {inquiry.email}
                  </a>
                  {inquiry.phone && <> · {inquiry.phone}</>}
                </p>
                {inquiry.message && (
                  <p className="mt-2 text-sm text-sand-700">{inquiry.message}</p>
                )}
                <p className="mt-2 text-xs text-sand-400">
                  {inquiry.createdAt.toLocaleDateString("de-DE")}{" "}
                  {inquiry.createdAt.toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <form action={markPartnerInquiryDone}>
                  <input type="hidden" name="id" value={inquiry.id} />
                  <button type="submit" className={secondaryButtonClass}>
                    {inquiry.status === "DONE" ? "Wieder öffnen" : "Erledigt"}
                  </button>
                </form>
                <form action={deletePartnerInquiry}>
                  <input type="hidden" name="id" value={inquiry.id} />
                  <button type="submit" className={dangerButtonClass}>
                    Löschen
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
