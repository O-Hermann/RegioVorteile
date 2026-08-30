import Link from "next/link";
import { requireCompanyMember } from "@/lib/auth";
import { ORDER_MANAGE_ROLES } from "@/lib/company";
import {
  getOrders,
  getOrderCounts,
  getCustomersForOrderSelect,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_FILTER_OPTIONS,
  ORDER_SORT_OPTIONS,
  ORDER_ERROR_MESSAGES,
  orderStatusBadgeClass,
  type OrderStatusFilter,
  type OrderSortOption,
} from "@/lib/orders";
import {
  dashCardClass,
  dashPrimaryButtonClass,
  dashInputClass,
  dashLabelClass,
  dashSecondaryTextClass,
  dashIconGlowClass,
} from "@/components/dashboard/dash-ui";
import { BriefcaseIcon, EyeIcon } from "@/components/icons";
import { PageNav } from "@/components/page-nav";

const SORT_VALUES = ORDER_SORT_OPTIONS.map((o) => o.value);
const STATUS_VALUES = ORDER_STATUS_FILTER_OPTIONS.map((o) => o.value);

function isOrderSortOption(value: string | undefined): value is OrderSortOption {
  return !!value && (SORT_VALUES as string[]).includes(value);
}

function isOrderStatusFilter(value: string | undefined): value is OrderStatusFilter {
  return !!value && (STATUS_VALUES as string[]).includes(value);
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

export default async function AuftraegePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; customer?: string; sort?: string; page?: string; error?: string; created?: string }>;
}) {
  const { company, membership } = await requireCompanyMember();
  const { q, status, customer, sort, page, error, created } = await searchParams;
  const canManage = ORDER_MANAGE_ROLES.includes(membership.role);

  const statusFilter: OrderStatusFilter = isOrderStatusFilter(status) ? status : "all";
  const sortOption: OrderSortOption = isOrderSortOption(sort) ? sort : "newestFirst";
  const customerFilter = customer?.trim() || undefined;
  const pageNum = Number(page) > 0 ? Number(page) : 1;

  const [counts, result, customerOptions] = await Promise.all([
    getOrderCounts(company.id),
    getOrders(company.id, { search: q, status: statusFilter, customerId: customerFilter, sort: sortOption, page: pageNum }),
    getCustomersForOrderSelect(company.id),
  ]);

  const kpis = [
    { label: "Offene Aufträge", value: counts.open },
    { label: "In Bearbeitung", value: counts.inProgress },
    { label: "Erledigt diesen Monat", value: counts.completedThisMonth },
    { label: "Gesamt", value: counts.total },
  ];

  return (
    <div>
      <PageNav />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-dash-text">Aufträge</h1>
          <p className={`mt-2 max-w-xl ${dashSecondaryTextClass}`}>
            Verwalten Sie Ihre Aufträge und behalten Sie deren Status und Termine im Blick.
          </p>
        </div>
        {canManage && (
          <Link href="/arbeitgeber/dashboard/auftraege/neu" className={dashPrimaryButtonClass}>
            + Neuer Auftrag
          </Link>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          {ORDER_ERROR_MESSAGES[error] ?? "Aktion konnte nicht ausgeführt werden."}
        </p>
      )}
      {created === "1" && (
        <p className="mt-4 rounded-lg bg-dash-green-tint px-3 py-2 text-sm text-dash-green">
          Auftrag wurde angelegt.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`!p-4 ${dashCardClass}`}>
            <p className="text-2xl font-extrabold leading-none tracking-tight text-dash-text">
              {kpi.value}
            </p>
            <p className={`mt-1 text-sm ${dashSecondaryTextClass}`}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {counts.total === 0 ? (
        <div className={`relative mx-auto mt-10 max-w-[820px] overflow-hidden !p-10 text-center ${dashCardClass}`}>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-dash-gold/[0.08] blur-3xl"
          />
          <span className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full ${dashIconGlowClass}`}>
            <BriefcaseIcon className="h-7 w-7" />
          </span>
          <h2 className="relative mt-5 text-xl font-semibold text-dash-text">Noch keine Aufträge</h2>
          <p className={`relative mx-auto mt-2 max-w-md text-sm leading-relaxed ${dashSecondaryTextClass}`}>
            {canManage
              ? "Legen Sie Ihren ersten Auftrag an und behalten Sie Status und Termine zentral in Effivo im Blick."
              : "Sobald ein Auftrag angelegt wurde, erscheint er hier mit Status und Terminen."}
          </p>
          {canManage && (
            <Link href="/arbeitgeber/dashboard/auftraege/neu" className={`relative mt-5 inline-flex ${dashPrimaryButtonClass}`}>
              Ersten Auftrag anlegen
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label htmlFor="q" className={dashLabelClass}>
                Suche
              </label>
              <input
                id="q"
                name="q"
                type="text"
                defaultValue={q ?? ""}
                placeholder="Aufträge suchen …"
                className={dashInputClass}
              />
            </div>
            <div>
              <label htmlFor="status" className={dashLabelClass}>
                Status
              </label>
              <select id="status" name="status" defaultValue={statusFilter} className={`${dashInputClass} !w-auto`}>
                {ORDER_STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="customer" className={dashLabelClass}>
                Kunde
              </label>
              <select id="customer" name="customer" defaultValue={customerFilter ?? ""} className={`${dashInputClass} !w-auto max-w-[220px]`}>
                <option value="">Alle Kunden</option>
                {customerOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.status === "INACTIVE" ? " (Inaktiv)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sort" className={dashLabelClass}>
                Sortierung
              </label>
              <select id="sort" name="sort" defaultValue={sortOption} className={`${dashInputClass} !w-auto`}>
                {ORDER_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className={dashPrimaryButtonClass}>
              Suchen
            </button>
          </form>

          <div className="mt-5">
            {result.items.length === 0 ? (
              <p className={`rounded-lg border border-dash-line px-4 py-6 text-center text-sm ${dashSecondaryTextClass}`}>
                Keine Aufträge gefunden.
              </p>
            ) : (
              <div className={`overflow-x-auto !p-0 ${dashCardClass}`}>
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-dash-panel-soft">
                    <tr className="text-xs uppercase tracking-wide text-dash-text-faint">
                      <th className="px-4 py-3 font-semibold">Auftrag</th>
                      <th className="px-4 py-3 font-semibold">Auftragsnummer</th>
                      <th className="px-4 py-3 font-semibold">Kunde</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Start</th>
                      <th className="px-4 py-3 font-semibold">Fällig</th>
                      <th className="px-4 py-3 font-semibold" />
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((o) => (
                      <tr
                        key={o.id}
                        className="relative cursor-pointer border-t border-dash-line transition-colors hover:bg-dash-panel-soft"
                      >
                        {/* Gleiches Stretched-Link-Muster wie die Kundentabelle
                            (Phase 6.1 Feinschliff Teil G) - "relative" sitzt
                            bewusst auf der <tr>, nicht auf der <td>. */}
                        <td className="max-w-[260px] truncate px-4 py-3.5 font-medium text-dash-text">
                          <Link href={`/arbeitgeber/dashboard/auftraege/${o.id}`} className="absolute inset-0 z-0">
                            <span className="sr-only">{o.title} ansehen</span>
                          </Link>
                          <span className="relative">{o.title}</span>
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3.5 ${dashSecondaryTextClass}`}>{o.orderNumber}</td>
                        <td className={`max-w-[220px] truncate px-4 py-3.5 ${dashSecondaryTextClass}`}>
                          {o.customer.name}
                          {o.customer.status === "INACTIVE" && <span className="ml-1 text-xs">(Inaktiv)</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${orderStatusBadgeClass(o.status)}`}>
                            {ORDER_STATUS_LABELS[o.status]}
                          </span>
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3.5 ${dashSecondaryTextClass}`}>
                          {o.startDate ? o.startDate.toLocaleDateString("de-DE") : "—"}
                        </td>
                        <td className={`whitespace-nowrap px-4 py-3.5 ${dashSecondaryTextClass}`}>
                          {o.dueDate ? o.dueDate.toLocaleDateString("de-DE") : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <Link
                            href={`/arbeitgeber/dashboard/auftraege/${o.id}`}
                            className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-dash-line px-3 py-1.5 text-xs font-semibold text-dash-text hover:border-dash-gold/40 hover:text-dash-gold transition-colors"
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
                  href={`/arbeitgeber/dashboard/auftraege${buildQuery({ q, status: statusFilter, customer: customerFilter, sort: sortOption, page: result.page - 1 })}`}
                  aria-disabled={result.page <= 1}
                  className={`rounded-full border border-dash-line px-4 py-2 text-xs font-semibold text-dash-text transition-colors ${
                    result.page <= 1
                      ? "pointer-events-none opacity-40"
                      : "hover:border-dash-gold/40 hover:text-dash-gold"
                  }`}
                >
                  Zurück
                </Link>
                <span className={`text-xs ${dashSecondaryTextClass}`}>
                  Seite {result.page} von {result.pageCount}
                </span>
                <Link
                  href={`/arbeitgeber/dashboard/auftraege${buildQuery({ q, status: statusFilter, customer: customerFilter, sort: sortOption, page: result.page + 1 })}`}
                  aria-disabled={result.page >= result.pageCount}
                  className={`rounded-full border border-dash-line px-4 py-2 text-xs font-semibold text-dash-text transition-colors ${
                    result.page >= result.pageCount
                      ? "pointer-events-none opacity-40"
                      : "hover:border-dash-gold/40 hover:text-dash-gold"
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
