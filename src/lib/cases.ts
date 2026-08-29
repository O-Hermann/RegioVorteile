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

// Sortierung bewusst nur nach Betrag absteigend, nicht zusaetzlich nach
// Status (die Enum-Reihenfolge NEW/IN_REVIEW/REVIEWED/CLOSED ist alphabetisch
// nicht die Pipeline-Reihenfolge) - die Statusfilterung uebernimmt stattdessen
// die Seite selbst ueber die Tabs, siehe faelle/page.tsx. "category" ist ein
// zweiter, unabhaengig kombinierbarer Filter (Phase 2.3) - darueber verlinken
// die "X Fälle ansehen"-Buttons der einzelnen Fund-Kategorien-Karten gezielt
// auf genau ihre Kategorie, statt immer die komplette, ungefilterte Liste zu
// zeigen.
export async function getCases(companyId: string, statusFilter: CaseStatusFilter, categoryFilter: CaseCategoryFilter = "all"): Promise<CaseListItem[]> {
  const rows = await prisma.case.findMany({
    where: {
      companyId,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(categoryFilter !== "all" ? { category: categoryFilter } : {}),
    },
    orderBy: { amount: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    who: r.who,
    what: r.what,
    amount: formatEuroDetailed(r.amount),
    status: r.status,
    createdAt: r.createdAt,
    reviewedAt: r.reviewedAt,
  }));
}

export async function getCaseCounts(companyId: string): Promise<Record<CaseStatusFilter, number>> {
  const groups = await prisma.case.groupBy({ by: ["status"], where: { companyId }, _count: { _all: true } });
  const counts: Record<CaseStatusFilter, number> = { all: 0, NEW: 0, IN_REVIEW: 0, REVIEWED: 0, CLOSED: 0 };
  for (const g of groups) {
    counts[g.status] = g._count._all;
    counts.all += g._count._all;
  }
  return counts;
}
