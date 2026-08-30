import "server-only";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

// Zentrale, serverseitige Lese-/Abfrageschicht fuer die Auftragsverwaltung
// (Phase 6.2.1) - exakt gleiches Muster wie lib/customers.ts: Seiten stellen
// ausschliesslich hier berechnete Werte dar, keine Prisma-Aufrufe direkt in
// page.tsx. Mutationen leben getrennt in actions/orders.ts.

export const ORDERS_PAGE_SIZE = 25;

export type OrderStatusFilter = "all" | OrderStatus;

export const ORDER_STATUS_FILTER_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "OPEN", label: "Offen" },
  { value: "IN_PROGRESS", label: "In Bearbeitung" },
  { value: "WAITING", label: "Wartet" },
  { value: "COMPLETED", label: "Erledigt" },
  { value: "CANCELED", label: "Storniert" },
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  OPEN: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  WAITING: "Wartet",
  COMPLETED: "Erledigt",
  CANCELED: "Storniert",
};

// Farbsprache orientiert sich an den bereits bestehenden Status-Badges
// (customerStatusBadgeClass, membershipStatusBadgeClass) - durchgaengig mit
// dark:-Variante, damit die Badges nicht wieder zu blass im Dark Mode wirken.
// Goldstandard-Rollout Phase 2 (2026-08-30): fuenf visuell unterscheidbare
// Farben aus der bestehenden dash-*-Palette (rot/gruen/blau/lila/gold) -
// dieselben Hues wie die vier Fund-Kategorien der Uebersicht, hier auf
// Auftragsstatus gemappt.
export function orderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "OPEN":
      return "bg-dash-blue-tint text-dash-blue";
    case "IN_PROGRESS":
      return "bg-dash-purple-tint text-dash-purple";
    case "WAITING":
      return "bg-dash-gold-glow text-dash-gold";
    case "COMPLETED":
      return "bg-dash-green-tint text-dash-green";
    case "CANCELED":
      return "bg-dash-red-tint text-dash-red";
  }
}

export type OrderSortOption =
  | "newestFirst"
  | "oldestFirst"
  | "numberAsc"
  | "numberDesc"
  | "titleAsc"
  | "titleDesc"
  | "dueDateAsc"
  | "dueDateDesc";

export const ORDER_SORT_OPTIONS: { value: OrderSortOption; label: string }[] = [
  { value: "newestFirst", label: "Neueste zuerst" },
  { value: "oldestFirst", label: "Älteste zuerst" },
  { value: "numberAsc", label: "Auftragsnummer aufsteigend" },
  { value: "numberDesc", label: "Auftragsnummer absteigend" },
  { value: "titleAsc", label: "Titel A–Z" },
  { value: "titleDesc", label: "Titel Z–A" },
  { value: "dueDateAsc", label: "Fälligkeit aufsteigend" },
  { value: "dueDateDesc", label: "Fälligkeit absteigend" },
];

// dueDate ist optional - bei beiden Fälligkeits-Sortierungen landen Auftraege
// ohne Termin bewusst immer am Ende (nulls: "last"), unabhaengig von der
// Richtung, statt unvorhersehbar zwischen terminierten Auftraegen zu
// erscheinen (gleiches Prinzip wie customerNumber in lib/customers.ts).
function resolveOrderBy(sort: OrderSortOption | undefined) {
  switch (sort) {
    case "oldestFirst":
      return { createdAt: "asc" as const };
    case "numberAsc":
      return { orderNumber: "asc" as const };
    case "numberDesc":
      return { orderNumber: "desc" as const };
    case "titleAsc":
      return { title: "asc" as const };
    case "titleDesc":
      return { title: "desc" as const };
    case "dueDateAsc":
      return { dueDate: { sort: "asc" as const, nulls: "last" as const } };
    case "dueDateDesc":
      return { dueDate: { sort: "desc" as const, nulls: "last" as const } };
    case "newestFirst":
    default:
      return { createdAt: "desc" as const };
  }
}

export type OrderListFilter = {
  search?: string;
  status?: OrderStatusFilter;
  customerId?: string;
  sort?: OrderSortOption;
  page?: number;
};

export type OrderListItem = {
  id: string;
  orderNumber: string;
  title: string;
  status: OrderStatus;
  startDate: Date | null;
  dueDate: Date | null;
  customer: { id: string; name: string; status: "ACTIVE" | "INACTIVE" };
};

export type OrderListResult = {
  items: OrderListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

// Suche/Filter/Pagination ausschliesslich serverseitig ueber Query-Parameter,
// exakt gleiches Muster wie getCustomers() - nie alle Auftraege eines
// Unternehmens an den Browser laden.
export async function getOrders(companyId: string, filter: OrderListFilter): Promise<OrderListResult> {
  const page = Math.max(1, Math.floor(filter.page ?? 1));
  const statusWhere = filter.status && filter.status !== "all" ? { status: filter.status } : {};
  const customerWhere = filter.customerId ? { customerId: filter.customerId } : {};
  const search = filter.search?.trim();
  const searchWhere = search
    ? {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" as const } },
          { title: { contains: search, mode: "insensitive" as const } },
          { customer: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const where = { companyId, ...statusWhere, ...customerWhere, ...searchWhere };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: resolveOrderBy(filter.sort),
      skip: (page - 1) * ORDERS_PAGE_SIZE,
      take: ORDERS_PAGE_SIZE,
      include: { customer: { select: { id: true, name: true, status: true } } },
    }),
  ]);

  const items: OrderListItem[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    title: o.title,
    status: o.status,
    startDate: o.startDate,
    dueDate: o.dueDate,
    customer: o.customer,
  }));

  return {
    items,
    total,
    page,
    pageSize: ORDERS_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
  };
}

function startOfCurrentMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Kennzahlen fuer die Auftragsuebersicht-Kacheln UND die Dashboard-Karte
// "Aufträge und Kunden" (Punkt 8/17) - bewusst eine gemeinsame Funktion,
// damit beide Oberflaechen garantiert dieselben Zahlen zeigen (gleiches
// Prinzip wie getCustomerCounts()).
export async function getOrderCounts(companyId: string) {
  const startOfMonth = startOfCurrentMonth();

  const [open, inProgress, completedThisMonth, total] = await Promise.all([
    prisma.order.count({ where: { companyId, status: { in: ["OPEN", "IN_PROGRESS", "WAITING"] } } }),
    prisma.order.count({ where: { companyId, status: "IN_PROGRESS" } }),
    prisma.order.count({ where: { companyId, status: "COMPLETED", completedAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { companyId } }),
  ]);

  return { open, inProgress, completedThisMonth, total };
}

// companyId wird IMMER mitgefiltert - ein Auftrag eines anderen Unternehmens
// liefert hier "null", nie den Datensatz selbst (gleiches Muster wie
// getCustomer()).
export async function getOrder(companyId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, companyId },
    include: { customer: true, createdByUser: true },
  });
}

// Vollstaendige Kundenliste eines Unternehmens fuer das "Kunde"-Auswahlfeld
// beim Anlegen eines Auftrags UND fuer den Kunden-Filter der
// Auftragsuebersicht (Punkt 4/9) - bewusst ungefiltert nach Status (aktive
// UND inaktive Kunden), da ein bereits vorhandener Auftrag durchaus einem
// inzwischen deaktivierten Kunden zugeordnet sein kann. orderBy nach status
// sortiert "ACTIVE" alphabetisch vor "INACTIVE" und bevorzugt so aktive
// Kunden in der Liste, ohne sie zu verstecken.
export async function getCustomersForOrderSelect(companyId: string) {
  return prisma.customer.findMany({
    where: { companyId },
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: { id: true, name: true, status: true },
  });
}

// Aufträge eines einzelnen Kunden fuer den neuen "Aufträge"-Bereich der
// Kundendetailseite (Phase 6.2.2, Punkt 9) - bewusst ungepaginiert (typische
// Auftragsmenge je Kunde ist klein), aber mit "take" als stille
// Sicherheitsgrenze nach oben abgesichert.
export async function getOrdersForCustomer(companyId: string, customerId: string) {
  return prisma.order.findMany({
    where: { companyId, customerId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, orderNumber: true, title: true, status: true, dueDate: true },
  });
}

export const ORDER_ERROR_MESSAGES: Record<string, string> = {
  "title-missing": "Bitte einen Auftragstitel angeben.",
  "title-too-long": "Der Auftragstitel ist zu lang (max. 200 Zeichen).",
  "number-missing": "Bitte eine Auftragsnummer angeben.",
  "number-too-long": "Die Auftragsnummer ist zu lang (max. 50 Zeichen).",
  "number-taken": "Diese Auftragsnummer wird bereits verwendet.",
  "invalid-customer": "Bitte einen gültigen Kunden auswählen.",
  "invalid-dates": "Das Fälligkeitsdatum darf nicht vor dem Startdatum liegen.",
  "description-too-long": "Die Beschreibung ist zu lang (max. 5.000 Zeichen).",
  forbidden: "Keine Berechtigung für diese Aktion.",
  "not-found": "Eintrag wurde nicht gefunden.",
};
