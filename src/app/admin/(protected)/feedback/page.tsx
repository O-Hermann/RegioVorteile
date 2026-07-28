import { prisma } from "@/lib/prisma";
import { markFeedbackDone, deleteFeedback } from "@/actions/feedback";
import { cardClass, secondaryButtonClass, dangerButtonClass } from "@/lib/ui";
import { CATEGORY_LABELS, categoryBadgeClass, statusLabel, statusBadgeClass } from "@/lib/feedback";

export default async function AdminFeedbackPage() {
  const feedback = await prisma.feedback.findMany({
    include: {
      employer: true,
      employee: { include: { employer: true } },
    },
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Feedback</h1>
      <p className="mt-2 text-sand-600">
        Verbesserungswünsche, Fehlermeldungen und sonstige Nachrichten von Arbeitgebern und
        Mitarbeitenden.
      </p>

      <div className="mt-8 space-y-3">
        {feedback.length === 0 && (
          <p className={`${cardClass} text-sand-500`}>Noch kein Feedback eingegangen.</p>
        )}
        {feedback.map((f) => {
          const author = f.employer
            ? f.employer.companyName
            : f.employee
              ? `${f.employee.name} (${f.employee.employer.companyName})`
              : "Unbekannt";
          const authorRole = f.employer ? "Arbeitgeber" : "Mitarbeiter";

          return (
            <div key={f.id} className={cardClass}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(f.category)}`}
                    >
                      {CATEGORY_LABELS[f.category]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(f.status)}`}
                    >
                      {statusLabel(f.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-sand-800">{f.message}</p>
                  <p className="mt-2 text-xs text-sand-400">
                    {authorRole}: {author} · {f.createdAt.toLocaleDateString("de-DE")}{" "}
                    {f.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <form action={markFeedbackDone}>
                    <input type="hidden" name="id" value={f.id} />
                    <button type="submit" className={secondaryButtonClass}>
                      {f.status === "DONE" ? "Wieder öffnen" : "Erledigt"}
                    </button>
                  </form>
                  <form action={deleteFeedback}>
                    <input type="hidden" name="id" value={f.id} />
                    <button type="submit" className={dangerButtonClass}>
                      Löschen
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
