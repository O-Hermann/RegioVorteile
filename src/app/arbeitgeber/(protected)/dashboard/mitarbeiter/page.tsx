import { headers } from "next/headers";
import { requireEmployer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inviteEmployee, removeEmployee } from "@/actions/employer";
import { cardClass, primaryButtonClass, dangerButtonClass, labelClass, inputClass } from "@/lib/ui";

export default async function MitarbeiterPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; error?: string }>;
}) {
  const { employer } = await requireEmployer();
  const { invited, error } = await searchParams;
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = host ? `${protocol}://${host}` : "";

  const employees = await prisma.employee.findMany({
    where: { employerId: employer.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-sand-900">Mitarbeitende</h1>
      <p className="mt-2 text-sand-600">Lade Mitarbeitende einzeln per Name und E-Mail ein.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {employees.length === 0 && (
            <p className={`${cardClass} text-sand-500`}>Noch keine Mitarbeitenden eingeladen.</p>
          )}
          {employees.map((employee) => (
            <div key={employee.id} className={`${cardClass} flex items-center justify-between gap-4 flex-wrap`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sand-900">{employee.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      employee.status === "ACTIVE"
                        ? "bg-ink-100 text-ink-800"
                        : "bg-gold-100 text-gold-700"
                    }`}
                  >
                    {employee.status === "ACTIVE" ? "aktiv" : "eingeladen"}
                  </span>
                </div>
                {employee.email && <p className="text-sm text-sand-500">{employee.email}</p>}
                <p className="mt-1 text-xs text-sand-400 break-all">
                  Einladungslink: {baseUrl}/mitarbeiter/login?code={employee.inviteCode}
                </p>
              </div>
              <form action={removeEmployee}>
                <input type="hidden" name="id" value={employee.id} />
                <button type="submit" className={dangerButtonClass}>
                  Entfernen
                </button>
              </form>
            </div>
          ))}
        </div>

        <div className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-sand-900">Einladen</h2>
          {invited && (
            <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              Einladung verschickt
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Bitte Name und E-Mail-Adresse ausfüllen.
            </p>
          )}
          <form action={inviteEmployee} className="mt-4 space-y-4">
            <div>
              <label className={labelClass} htmlFor="name">
                Vor- und Nachname
              </label>
              <input
                className={inputClass}
                name="name"
                id="name"
                placeholder="Anna Beispiel"
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="email">
                E-Mail-Adresse
              </label>
              <input
                className={inputClass}
                type="email"
                name="email"
                id="email"
                placeholder="anna@firma.de"
                required
              />
            </div>
            <button type="submit" className={`w-full ${primaryButtonClass}`}>
              Einladung verschicken
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
