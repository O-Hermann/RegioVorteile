import "server-only";
import { prisma } from "@/lib/prisma";
import type { CustomerStatus } from "@/generated/prisma/client";

// Zentrale, serverseitige Lese-/Abfrageschicht fuer das Kunden-Grundsystem
// (Phase 6.1, Punkt 37) - Seiten stellen ausschliesslich hier berechnete
// Werte dar, keine Prisma-Aufrufe direkt in page.tsx. Mutationen leben
// getrennt in actions/customers.ts.

export const CUSTOMERS_PAGE_SIZE = 25;

export type CustomerStatusFilter = "all" | "active" | "inactive";

export type CustomerListFilter = {
  search?: string;
  status?: CustomerStatusFilter;
  page?: number;
};

export type CustomerListItem = {
  id: string;
  name: string;
  customerNumber: string | null;
  city: string | null;
  status: CustomerStatus;
  primaryContactName: string | null;
};

export type CustomerListResult = {
  items: CustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

// Suche/Filter/Pagination ausschliesslich serverseitig ueber Query-Parameter
// (Punkt 12-14) - nie alle Kunden eines Unternehmens an den Browser laden.
export async function getCustomers(companyId: string, filter: CustomerListFilter): Promise<CustomerListResult> {
  const page = Math.max(1, Math.floor(filter.page ?? 1));
  const statusWhere =
    filter.status === "active" ? { status: "ACTIVE" as const } : filter.status === "inactive" ? { status: "INACTIVE" as const } : {};
  const search = filter.search?.trim();
  const searchWhere = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { customerNumber: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          {
            contacts: {
              some: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" as const } },
                  { lastName: { contains: search, mode: "insensitive" as const } },
                  { email: { contains: search, mode: "insensitive" as const } },
                ],
              },
            },
          },
        ],
      }
    : {};

  const where = { companyId, ...statusWhere, ...searchWhere };

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * CUSTOMERS_PAGE_SIZE,
      take: CUSTOMERS_PAGE_SIZE,
      include: { contacts: { where: { isPrimary: true }, take: 1 } },
    }),
  ]);

  const items: CustomerListItem[] = customers.map((c) => ({
    id: c.id,
    name: c.name,
    customerNumber: c.customerNumber,
    city: c.city,
    status: c.status,
    primaryContactName: c.contacts[0] ? [c.contacts[0].firstName, c.contacts[0].lastName].filter(Boolean).join(" ") || null : null,
  }));

  return {
    items,
    total,
    page,
    pageSize: CUSTOMERS_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / CUSTOMERS_PAGE_SIZE)),
  };
}

// Kennzahlen fuer die Kundenuebersicht-Kacheln UND die Dashboard-Karte
// "Aufträge und Kunden" (Punkt 10/32) - bewusst eine gemeinsame Funktion,
// damit beide Oberflaechen garantiert dieselben Zahlen zeigen.
export async function getCustomerCounts(companyId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [active, total, newThisMonth] = await Promise.all([
    prisma.customer.count({ where: { companyId, status: "ACTIVE" } }),
    prisma.customer.count({ where: { companyId } }),
    prisma.customer.count({ where: { companyId, createdAt: { gte: startOfMonth } } }),
  ]);

  return { active, total, newThisMonth };
}

// companyId wird IMMER mitgefiltert (Punkt 6) - ein Kunde eines anderen
// Unternehmens liefert hier "null", nie den Datensatz selbst.
export async function getCustomer(companyId: string, customerId: string) {
  return prisma.customer.findFirst({
    where: { id: customerId, companyId },
    include: {
      contacts: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      createdByUser: true,
    },
  });
}

export async function getCustomerContact(companyId: string, contactId: string) {
  return prisma.customerContact.findFirst({
    where: { id: contactId, customer: { companyId } },
    include: { customer: true },
  });
}

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  ACTIVE: "Aktiv",
  INACTIVE: "Inaktiv",
};

export function customerStatusBadgeClass(status: CustomerStatus): string {
  return status === "ACTIVE"
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
    : "bg-sand-200 text-sand-700 dark:bg-white/5 dark:text-cockpit-text-weak";
}

export const CUSTOMER_ERROR_MESSAGES: Record<string, string> = {
  missing: "Bitte den Kundennamen angeben.",
  "name-too-long": "Der Kundenname ist zu lang (max. 200 Zeichen).",
  "number-too-long": "Die Kundennummer ist zu lang (max. 50 Zeichen).",
  "number-taken": "Diese Kundennummer ist bei Ihrem Unternehmen bereits vergeben.",
  "invalid-email": "Bitte eine gültige E-Mail-Adresse angeben.",
  "invalid-website": "Bitte eine gültige Website-Adresse angeben.",
  "notes-too-long": "Die Notiz ist zu lang (max. 5.000 Zeichen).",
  forbidden: "Keine Berechtigung für diese Aktion.",
  "not-found": "Eintrag wurde nicht gefunden.",
  "contact-name-missing": "Bitte Vor- oder Nachname des Ansprechpartners angeben.",
};
