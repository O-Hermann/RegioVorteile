import Link from "next/link";
import { requireCompanyMember } from "@/lib/auth";
import { CUSTOMER_MANAGE_ROLES } from "@/lib/company";
import {
  getCustomers,
  getCustomerCounts,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_ERROR_MESSAGES,
  CUSTOMER_SORT_OPTIONS,
  customerStatusBadgeClass,
  type CustomerStatusFilter,
  type CustomerSortOption,
} from "@/lib/customers";
import { importPanelClass, importSecondaryTextClass, importIconGlowClass } from "@/lib/import-ui";
import { primaryButtonClass, inputClass } from "@/lib/ui";
import { UsersIcon, EyeIcon } from "@/components/icons";
import { PageNav } from "@/components/page-nav";

const STATUS_TABS: { value: CustomerStatusFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "active", label: "Aktiv" },
  { value: "inactive", label: "Inaktiv" },
];

const SORT_VALUES = CUSTOMER_SORT_OPTIONS.map((o) => o.value);

function isCustomerSortOption(value: string | undefined): value is CustomerSortOption {
  return !!value && (SORT_VALUES as string[]).includes(value);
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export default async function KundenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string; new?: string; page?: string; error?: string; deleted?: string }>;
}) {
  const { company, membership } = await requireCompanyMember();
  const { q, status, sort, new: newOnlyParam, page, error, deleted } = await searchParams;
  const canManage = CUSTOMER_MANAGE_ROLES.includes(membership.role);

  const statusFilter: CustomerStatusFilter = status === "active" || status === "inactive" ? status : "all";
  const sortOption: CustomerSortOption = isCustomerSortOption(sort) ? sort : "nameAsc";
  const newOnly = newOnlyParam === "1";
  const pageNum = Number(page) > 0 ? Number(page) : 1;

  const [counts, result] = await Promise.all([
    getCustomerCounts(company.id),
    getCustomers(company.id, { search: q, status: statusFilter, sort: sortOption, newOnly, page: pageNum }),
  ]);

  const kpis = [
    { label: "Aktive Kunden", value: counts.active },
    { label: "Gesamt", value: counts.total },
    { label: "Neu diesen Monat", value: counts.newThisMonth },
  ];

  return (
    <div>
      <PageNav />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">Kunden</h1>
          <p className={`mt-2 max-w-xl ${importSecondaryTextClass}`}>
            Verwalten Sie Ihre Kunden und Ansprechpartner an einem zentralen Ort.
          </p>
        </div>
        {canManage && (
          <Link href="/arbeitgeber/dashboard/kunden/neu" className={primaryButtonClass}>
            + Neuer Kunde
          </Link>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {CUSTOMER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}
      {deleted === "1" && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          Kunde wurde dauerhaft gelöscht.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`!p-4 ${importPanelClass}`}>
            <p className="font-display text-2xl font-extrabold leading-none tracking-tight text-sand-900 dark:text-cockpit-heading">
              {kpi.value}
            </p>
            <p className={`mt-1 text-sm ${importSecondaryTextClass}`}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {counts.total === 0 ? (
        <div className={`relative mx-auto mt-10 max-w-[820px] overflow-hidden !p-10 text-center ${importPanelClass}`}>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cockpit-accent-light/10 blur-3xl opacity-0 dark:opacity-100"
          />
          <span className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full ${importIconGlowClass}`}>
            <UsersIcon className="h-7 w-7" />
          </span>
          <h2 className="relative mt-5 font-display text-xl font-semibold text-sand-900">Noch keine Kunden</h2>
          <p className={`relative mx-auto mt-2 max-w-md text-sm leading-relaxed ${importSecondaryTextClass}`}>
            {canManage
              ? "Legen Sie Ihren ersten Kunden an und verwalten Sie Kontaktdaten und Ansprechpartner zentral in Effivo."
              : "Sobald ein Kunde angelegt wurde, erscheint er hier mit Kontaktdaten und Ansprechpartnern."}
          </p>
          {canManage && (
            <Link href="/arbeitgeber/dashboard/kunden/neu" className={`relative mt-5 inline-flex ${primaryButtonClass}`}>
              Ersten Kunden anlegen
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label htmlFor="q" className="mb-1 block text-sm font-medium text-sand-800 dark:text-cockpit-text">
                Suche
              </label>
              <input
                id="q"
                name="q"
                type="text"
                defaultValue={q ?? ""}
                placeholder="Kunden suchen …"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-sand-800 dark:text-cockpit-text">
                Status
              </label>
              <select id="status" name="status" defaultValue={statusFilter} className={`${inputClass} !w-auto`}>
                {STATUS_TABS.map((tab) => (
                  <option key={tab.value} value={tab.value}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new" className="mb-1 block text-sm font-medium text-sand-800 dark:text-cockpit-text">
                Zeitraum
              </label>
              <select id="new" name="new" defaultValue={newOnly ? "1" : "0"} className={`${inputClass} !w-auto`}>
                <option value="0">Alle Kunden</option>
                <option value="1">Neu diesen Monat</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort" className="mb-1 block text-sm font-medium text-sand-800 dark:text-cockpit-text">
                Sortierung
              </label>
              <select id="sort" name="sort" defaultValue={sortOption} className={`${inputClass} !w-auto`}>
                {CUSTOMER_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={primaryButtonClass}>
              Suchen
            </button>
          </form>

          <div className="mt-5">
            {result.items.length === 0 ? (
              <p className={`rounded-lg border border-card-border/70 px-4 py-6 text-center text-sm dark:border-white/10 ${importSecondaryTextClass}`}>
                Keine Kunden gefunden.
              </p>
            ) : (
              <div className={`overflow-x-auto !p-0 ${importPanelClass}`}>
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-sand-50 dark:bg-white/5">
                    <tr className="text-xs uppercase tracking-wide text-sand-500 dark:text-cockpit-text-weak">
                      <th className="px-4 py-3 font-semibold">Kunde</th>
                      <th className="px-4 py-3 font-semibold">Kundennummer</th>
                      <th className="px-4 py-3 font-semibold">Hauptansprechpartner</th>
                      <th className="px-4 py-3 font-semibold">Ort</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold" />
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((c) => (
                      <tr
                        key={c.id}
                        className="relative cursor-pointer border-t border-card-border/70 transition-colors hover:bg-sand-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                      >
                        {/* Feinschliff Teil G: gesamte Zeile klickbar via
                            "Stretched Link"-Muster (eine unsichtbare
                            Verlinkung, absolut positioniert relativ zur
                            <tr> - NICHT zur eigenen <td>, sonst wuerde der
                            Link nur die erste Zelle fuellen) statt eines
                            Client-Components mit onClick - reines CSS, kein
                            JS noetig. Da "Ansehen" auf dasselbe Ziel
                            verlinkt, gibt es keinen Konflikt bei
                            ueberlappenden Klicks. */}
                        <td className="max-w-[260px] truncate px-4 py-3.5 font-medium text-sand-900 dark:text-cockpit-text">
                          <Link href={`/arbeitgeber/dashboard/kunden/${c.id}`} className="absolute inset-0 z-0">
                            <span className="sr-only">{c.name} ansehen</span>
                          </Link>
                          <span className="relative">{c.name}</span>
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3.5 ${importSecondaryTextClass}`}>
                          {c.customerNumber ?? "—"}
                        </td>
                        <td className={`max-w-[220px] truncate px-4 py-3.5 ${importSecondaryTextClass}`}>
                          {c.primaryContactName ?? "—"}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3.5 ${importSecondaryTextClass}`}>{c.city ?? "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${customerStatusBadgeClass(c.status)}`}>
                            {CUSTOMER_STATUS_LABELS[c.status]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <Link
                            href={`/arbeitgeber/dashboard/kunden/${c.id}`}
                            className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-card-border dark:border-white/15 px-3 py-1.5 text-xs font-semibold text-sand-800 dark:text-cockpit-text hover:border-ink-400 dark:hover:border-cockpit-accent-light/50 hover:text-ink-700 dark:hover:text-cockpit-accent-light transition-colors"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                            Ansehen
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.pageCount > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <Link
                  href={`/arbeitgeber/dashboard/kunden${buildQuery({ q, status: statusFilter, sort: sortOption, new: newOnly ? 1 : undefined, page: result.page - 1 })}`}
                  aria-disabled={result.page <= 1}
                  className={`rounded-full border border-card-border px-4 py-2 text-xs font-semibold text-sand-800 dark:border-white/15 dark:text-cockpit-text transition-colors ${
                    result.page <= 1
                      ? "pointer-events-none opacity-40"
                      : "hover:border-ink-400 hover:text-ink-700 dark:hover:border-cockpit-accent-light/50 dark:hover:text-cockpit-accent-light"
                  }`}
                >
                  Zurück
                </Link>
                <span className={`text-xs ${importSecondaryTextClass}`}>
                  Seite {result.page} von {result.pageCount}
                </span>
                <Link
                  href={`/arbeitgeber/dashboard/kunden${buildQuery({ q, status: statusFilter, sort: sortOption, new: newOnly ? 1 : undefined, page: result.page + 1 })}`}
                  aria-disabled={result.page >= result.pageCount}
                  className={`rounded-full border border-card-border px-4 py-2 text-xs font-semibold text-sand-800 dark:border-white/15 dark:text-cockpit-text transition-colors ${
                    result.page >= result.pageCount
                      ? "pointer-events-none opacity-40"
                      : "hover:border-ink-400 hover:text-ink-700 dark:hover:border-cockpit-accent-light/50 dark:hover:text-cockpit-accent-light"
                  }`}
                >
                  Weiter
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
