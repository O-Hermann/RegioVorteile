import { requireCompanyMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitCompanySupportRequest } from "@/actions/feedback";
import { cardClass, primaryButtonClass, labelClass, inputClass } from "@/lib/ui";
import { CATEGORY_LABELS, categoryBadgeClass, statusLabel, statusBadgeClass } from "@/lib/feedback";
import { PageNav } from "@/components/page-nav";

const CATEGORY_OPTIONS = [
  { value: "HELP", label: "Hilfe" },
  { value: "BUG", label: "Bug" },
  { value: "SUGGESTION", label: "Verbesserung" },
] as const;

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sent?: string; error?: string }>;
}) {
  const { company } = await requireCompanyMember();
  const { category, sent, error } = await searchParams;

  const defaultCategory = CATEGORY_OPTIONS.find((c) => c.value === category)?.value ?? "HELP";

  const requests = await prisma.feedback.findMany({
    where: { companyId: company.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageNav />
      <h1 className="mt-2 font-display text-3xl font-semibold text-sand-900">Support</h1>
      <p className="mt-2 text-sand-600">
        Hilfe anfordern, einen Fehler melden oder eine Verbesserung vorschlagen.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {requests.length === 0 && (
            <p className={`${cardClass} text-sand-500`}>Noch keine Anfragen gestellt.</p>
          )}
          {requests.map((r) => (
            <div key={r.id} className={cardClass}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sand-900">{r.subject ?? "Ohne Betreff"}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(r.category)}`}>
                      {CATEGORY_LABELS[r.category]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-sand-600">{r.message}</p>
                  <p className="mt-1 text-xs text-sand-400">{r.createdAt.toLocaleDateString("de-DE")}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(r.status)}`}>
                  {statusLabel(r.status)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Neue Anfrage</h2>
          {sent && (
            <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              Anfrage gesendet.
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Bitte Betreff und Beschreibung ausfüllen.
            </p>
          )}
          <form action={submitCompanySupportRequest} className="mt-4 space-y-4">
            <div>
              <label className={labelClass} htmlFor="category">
                Kategorie
              </label>
              <select className={inputClass} name="category" id="category" defaultValue={defaultCategory}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="subject">
                Betreff
              </label>
              <input className={inputClass} name="subject" id="subject" required />
            </div>
            <div>
              <label className={labelClass} htmlFor="message">
                Beschreibung
              </label>
              <textarea className={inputClass} name="message" id="message" rows={5} required />
            </div>
            <button type="submit" className={`w-full ${primaryButtonClass}`}>
              Anfrage senden
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
