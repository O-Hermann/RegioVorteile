import { prisma } from "@/lib/prisma";
import { markContactRequestDone, deleteContactRequest } from "@/actions/contact-request";
import { cardClass, secondaryButtonClass, dangerButtonClass } from "@/lib/ui";
import { contactRequestStatusLabel, contactRequestStatusBadgeClass } from "@/lib/contact-request";

export default async function AdminContactRequestsPage() {
  const requests = await prisma.contactRequest.findMany({
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Kontaktanfragen</h1>
      <p className="mt-2 text-sand-600">
        Anfragen von Unternehmen, die über „Jetzt Kontakt aufnehmen" auf der Startseite die
        Pilotphase angefragt haben.
      </p>

      <div className="mt-8 space-y-3">
        {requests.length === 0 && (
          <p className={`${cardClass} text-sand-500`}>Noch keine Kontaktanfragen eingegangen.</p>
        )}
        {requests.map((request) => (
          <div key={request.id} className={cardClass}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${contactRequestStatusBadgeClass(request.status)}`}
                  >
                    {contactRequestStatusLabel(request.status)}
                  </span>
                  <p className="font-semibold text-sand-900">{request.companyName}</p>
                </div>
                <p className="mt-2 text-sm text-sand-800">
                  {request.firstName} {request.lastName} ·{" "}
                  <a href={`tel:${request.phone}`} className="hover:underline">
                    {request.phone}
                  </a>
                </p>
                <p className="mt-1 text-sm text-sand-600">
                  {request.street}, {request.postalCode}
                </p>
                {request.message && (
                  <p className="mt-2 text-sm text-sand-700">{request.message}</p>
                )}
                <p className="mt-2 text-xs text-sand-400">
                  {request.createdAt.toLocaleDateString("de-DE")}{" "}
                  {request.createdAt.toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <form action={markContactRequestDone}>
                  <input type="hidden" name="id" value={request.id} />
                  <button type="submit" className={secondaryButtonClass}>
                    {request.status === "DONE" ? "Wieder öffnen" : "Erledigt"}
                  </button>
                </form>
                <form action={deleteContactRequest}>
                  <input type="hidden" name="id" value={request.id} />
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
