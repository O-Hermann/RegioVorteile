import { joinAsEmployee } from "@/actions/auth";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function MitarbeiterLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; code?: string }>;
}) {
  const { error, code } = await searchParams;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 bg-sand-50">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className={`w-full max-w-sm ${cardClass}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">
          Regiovorteile
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-sand-900">
          Mitarbeiter-Zugang
        </h1>
        <p className="mt-2 text-sm text-sand-600">
          Gib den Einladungscode ein, den du von deinem Arbeitgeber erhalten hast.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Dieser Code ist ungültig.
          </p>
        )}
        <form action={joinAsEmployee} className="mt-6 space-y-4">
          <div>
            <label className={labelClass} htmlFor="code">
              Einladungscode
            </label>
            <input
              className={`${inputClass} uppercase tracking-widest text-center font-semibold`}
              name="code"
              id="code"
              defaultValue={code ?? ""}
              placeholder="ABCD1234"
              autoCapitalize="characters"
              required
            />
          </div>
          <button type="submit" className={`w-full ${primaryButtonClass}`}>
            Zugang öffnen
          </button>
        </form>
      </div>
    </main>
  );
}
