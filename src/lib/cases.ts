import "server-only";
import { prisma } from "@/lib/prisma";
import type { CaseCategory, CaseStatus } from "@/generated/prisma/client";
import { formatEuroDetailed } from "@/lib/finance-format";
import type { CaseStatusFilter, CaseCategoryFilter } from "@/lib/case-labels";

export type { CaseStatusFilter, CaseCategoryFilter } from "@/lib/case-labels";

// MVP-Roadmap Phase 2.2 (siehe [[effivo_mvp_roadmap]]): Abfrage-Bausteine
// fuer die Fallpruefungs-Arbeitsliste - analog zu lib/customers.ts
// (getCustomers/getCustomerCounts). Labels/Badge-Klassen/erlaubte
// Statuswechsel leben in lib/case-labels.ts (keine DB-Abfrage, daher ohne
// "server-only", damit sie auch client-seitig genutzt werden koennen).
export type CaseListItem = {
  id: string;
  category: CaseCategory;
  who: string;
  what: string;
  amount: string; // bereits formatiert (formatEuroDetailed) - Anzeigewert, keine Rechengrundlage mehr
  status: CaseStatus;
  createdAt: Date;
  reviewedAt: Date | null;
};

export type CaseListResult = {
  items: CaseListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

// MVP-Roadmap Phase 6 (siehe [[effivo_mvp_roadmap]]): serverseitige
// Paginierung, gleiches Rueckgabe-/Query-Muster wie getCustomers()/getOrders()
// (lib/customers.ts/lib/orders.ts) - nie alle Faelle einer Company auf einmal
// laden, unabhaengig davon, wie viele Monate/Funde bereits aufgelaufen sind.
export const CASES_PAGE_SIZE = 25;

// Sortierung bewusst nur nach Betrag absteigend, nicht zusaetzlich nach
// Status (die Enum-Reihenfolge NEW/IN_REVIEW/REVIEWED/CLOSED ist alphabetisch
// nicht die Pipeline-Reihenfolge) - die Statusfilterung uebernimmt stattdessen
// die Seite selbst ueber die Tabs, siehe faelle/page.tsx. "category" ist ein
// zweiter, unabhaengig kombinierbarer Filter (Phase 2.3) - darueber verlinken
// die "X Fälle ansehen"-Buttons der einzelnen Fund-Kategorien-Karten gezielt
// auf genau ihre Kategorie, statt immer die komplette, ungefilterte Liste zu
// zeigen.
export async function getCases(
  companyId: string,
  statusFilter: CaseStatusFilter,
  categoryFilter: CaseCategoryFilter = "all",
  page = 1,
): Promise<CaseListResult> {
  const pageNum = Math.max(1, Math.floor(page));
  const where = {
    companyId,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(categoryFilter !== "all" ? { category: categoryFilter } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.case.count({ where }),
    prisma.case.findMany({
      where,
      orderBy: { amount: "desc" },
      skip: (pageNum - 1) * CASES_PAGE_SIZE,
      take: CASES_PAGE_SIZE,
    }),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.id,
      category: r.category,
      who: r.who,
      what: r.what,
      amount: formatEuroDetailed(r.amount),
      status: r.status,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
    })),
    total,
    page: pageNum,
    pageSize: CASES_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / CASES_PAGE_SIZE)),
  };
}

export async function getCaseCounts(companyId: string): Promise<Record<CaseStatusFilter, number>> {
  const groups = await prisma.case.groupBy({ by: ["status"], where: { companyId }, _count: { _all: true } });
  const counts: Record<CaseStatusFilter, number> = { all: 0, NEW: 0, IN_REVIEW: 0, REVIEWED: 0, CLOSED: 0, FALSE_POSITIVE: 0 };
  for (const g of groups) {
    counts[g.status] = g._count._all;
    counts.all += g._count._all;
  }
  return counts;
}

// MVP-Roadmap Phase 3 (siehe [[effivo_mvp_roadmap]]): fuer die "Zuletzt
// geprueft"-Anzeige (review-status.tsx) - der Zeitpunkt des zuletzt auf
// REVIEWED gesetzten Falls, nicht einfach die aktuelle Serverzeit wie bisher.
// null, solange noch kein einziger Fall geprueft wurde (ehrlicher Zustand
// statt eines erfundenen Zeitpunkts).
export async function getLastReviewedAt(companyId: string): Promise<Date | null> {
  const latest = await prisma.case.findFirst({
    where: { companyId, reviewedAt: { not: null } },
    orderBy: { reviewedAt: "desc" },
    select: { reviewedAt: true },
  });
  return latest?.reviewedAt ?? null;
}
