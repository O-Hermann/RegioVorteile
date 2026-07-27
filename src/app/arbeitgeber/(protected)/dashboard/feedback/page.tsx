import { requireEmployer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitEmployerFeedback } from "@/actions/feedback";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/ui";
import { CATEGORY_LABELS, categoryBadgeClass, statusLabel, statusBadgeClass } from "@/lib/feedback";

export default async function ArbeitgeberFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { employer } = await requireEmployer();
  const { sent, error } = await searchParams;

  const feedback = await prisma.feedback.findMany({
    where: { employerId: employer.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Feedback</h1>
      <p className="mt-2 text-sand-600">
        Verbesserungsvorschlag, Fehler oder sonstiges Anliegen? Schick es uns direkt.
      </p>

      <div className={`${cardClass} mt-6`}>
        {sent && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            Nachricht verschickt
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Bitte eine Nachricht eingeben.
          </p>
        )}
        <form action={submitEmployerFeedback} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="category">
              Kategorie
            </label>
            <select className={inputClass} name="category" id="category" defaultValue="SUGGESTION">
              <option value="SUGGESTION">Verbesserungsvorschlag</option>
              <option value="BUG">Fehlermeldung</option>
              <option value="OTHER">Sonstiges</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="message">
              Nachricht
            </label>
            <textarea
              className={inputClass}
              name="message"
              id="message"
              rows={5}
              placeholder="Was möchtest du uns mitteilen?"
              required
            />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Nachricht senden
          </button>
        </form>
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold text-sand-900">
        Bisherige Meldungen
      </h2>
      <div className="mt-3 space-y-3">
        {feedback.length === 0 && (
          <p className={`${cardClass} text-sm text-sand-500`}>Noch keine Meldungen gesendet.</p>
        )}
        {feedback.map((f) => (
          <div key={f.id} className={cardClass}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(f.category)}`}>
                {CATEGORY_LABELS[f.category]}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(f.status)}`}>
                {statusLabel(f.status)}
              </span>
              <span className="text-xs text-sand-400">{f.createdAt.toLocaleDateString("de-DE")}</span>
            </div>
            <p className="mt-2 text-sm text-sand-800">{f.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
