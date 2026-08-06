import { requireAdmin } from "@/lib/auth";
import { createCompany } from "@/actions/company";
import { cardClass, inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

export default async function AdminUnternehmenNeuPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-sand-900">Unternehmen anlegen</h1>
      <p className="mt-2 text-sand-600">Legt ein neues Unternehmen ohne erfundene Kennzahlen an.</p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Bitte einen Unternehmensnamen angeben.
        </p>
      )}

      <div className={`mt-6 ${cardClass}`}>
        <form action={createCompany} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="name">
              Unternehmensname
            </label>
            <input className={inputClass} name="name" id="name" required />
          </div>
          <button type="submit" className={`w-full ${primaryButtonClass}`}>
            Unternehmen anlegen
          </button>
        </form>
      </div>
    </div>
  );
}
