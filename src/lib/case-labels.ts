import type { CaseCategory, CaseStatus } from "@/generated/prisma/client";

// MVP-Roadmap Phase 2.2 (siehe [[effivo_mvp_roadmap]]): reine Konstanten/
// Funktionen ohne DB-Zugriff, daher bewusst OHNE "server-only" und in einer
// eigenen Datei getrennt von lib/cases.ts (das echte Prisma-Abfragen enthaelt
// und daher "server-only" braucht) - so koennen sowohl Server- als auch
// Client-Komponenten (z.B. case-status-actions.tsx fuer die interaktiven
// Statuswechsel-Buttons) dieselben Labels/Uebergaenge nutzen, ohne dass ein
// Client-Import ueber cases.ts versehentlich den Prisma-Client mitbuendelt.
export const CASE_CATEGORY_LABELS: Record<CaseCategory, string> = {
  DUPLICATE_PAYMENT: "Doppelzahlung",
  MISSED_DISCOUNT: "Skonto nicht genutzt",
  OPEN_CREDIT_NOTE: "Offene Gutschrift",
  OVERPAYMENT: "Mögliche Überzahlung",
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  NEW: "Neu",
  IN_REVIEW: "In Prüfung",
  REVIEWED: "Geprüft",
  CLOSED: "Abgeschlossen",
};

export function caseStatusBadgeClass(status: CaseStatus): string {
  switch (status) {
    case "NEW":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    case "IN_REVIEW":
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300";
    case "REVIEWED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "CLOSED":
      return "bg-sand-200 text-sand-700 dark:bg-white/5 dark:text-cockpit-text-weak";
  }
}

// Erlaubte Statusuebergaenge fuer die Arbeitsliste-Buttons - src/actions/
// case-review.ts nutzt dieselbe Tabelle, dort aber als die tatsaechlich
// massgebliche serverseitige Pruefung (dieser Client-Export bestimmt nur,
// welche Buttons ueberhaupt angezeigt werden). CLOSED -> NEW ("wieder
// oeffnen") ist bewusst erlaubt, damit ein faelschlich abgeschlossener Fall
// korrigierbar bleibt.
export const CASE_STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  NEW: ["IN_REVIEW"],
  IN_REVIEW: ["REVIEWED", "NEW"],
  REVIEWED: ["CLOSED", "IN_REVIEW"],
  CLOSED: ["NEW"],
};

export type CaseStatusFilter = "all" | CaseStatus;
