import { prisma } from "@/lib/prisma";
import { setFeedbackStatus, deleteFeedback } from "@/actions/feedback";
import { cardClass, dangerButtonClass, secondaryButtonClass } from "@/lib/ui";
import { CATEGORY_LABELS, categoryBadgeClass, STATUS_LABELS, statusBadgeClass } from "@/lib/feedback";

export default async function AdminFeedbackPage() {
  const feedback = await prisma.feedback.findMany({
    include: {
      employer: true,
      employee: { include: { employer: true } },
      company: true,
      submittedByUser: true,
    },
    orderBy: [{ status: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Feedback</h1>
      <p className="mt-2 text-sand-600">
        Verbesserungswünsche, Fehlermeldungen und Support-Anfragen von Unternehmen,
        Arbeitgebern und Mitarbeitenden.
      </p>

      <div className="mt-8 space-y-3">
        {feedback.length === 0 && (
          <p className={`${cardClass} text-sand-500`}>Noch kein Feedback eingegangen.</p>
        )}
        {feedback.map((f) => {
          let author = "Unbekannt";
          let authorRole = "Unbekannt";
          if (f.company) {
            const submitter = f.submittedByUser
              ? [f.submittedByUser.firstName, f.submittedByUser.lastName].filter(Boolean).join(" ") ||
                f.submittedByUser.email
              : "Unbekannt";
            author = `${submitter} (${f.company.name})`;
            authorRole = "Unternehmen";
          } else if (f.employer) {
            author = f.employer.companyName;
            authorRole = "Arbeitgeber";
          } else if (f.employee) {
            author = `${f.employee.name} (${f.employee.employer.companyName})`;
            authorRole = "Mitarbeiter";
          }

          return (
            <div key={f.id} className={cardClass}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(f.category)}`}
                    >
                      {CATEGORY_LABELS[f.category]}
                    </span>
                  </div>
                  {f.subject && <p className="mt-2 font-semibold text-sand-900">{f.subject}</p>}
                  <p className="mt-1 text-sm text-sand-800">{f.message}</p>
                  <p className="mt-2 text-xs text-sand-400">
                    {authorRole}: {author} · {f.createdAt.toLocaleDateString("de-DE")}{" "}
                    {f.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <form action={setFeedbackStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={f.id} />
                    <select
                      name="status"
                      defaultValue={f.status}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 ${statusBadgeClass(f.status)}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className={secondaryButtonClass}>
                      Speichern
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
