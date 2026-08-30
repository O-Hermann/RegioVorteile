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
  // MVP-Roadmap Phase 5 (siehe [[effivo_mvp_roadmap]]): Kennzeichnung fuer
  // einen Fehlalarm - fachlich etwas anderes als CLOSED (dort war der Fund
  // real, nur die Bearbeitung ist abgeschlossen).
  FALSE_POSITIVE: "Kein echter Fund",
};

// Goldstandard-Rollout Phase 2 (2026-08-30): dieselben Statusfarben wie im
// Uebersicht-Pruefuebersicht-Donut (review-donut.tsx STATUS_LEGEND) -
// Neu=Gold, In Pruefung=Blau, Geprueft=Gruen, Abgeschlossen=Grau, damit ein
// Status auf beiden Seiten gleich aussieht. FALSE_POSITIVE (Phase 5) nutzt
// bewusst Lila statt einer der vier Donut-Farben - kein eigenes
// Donut-Segment (siehe review-donut.tsx: "Kein echter Fund" ist kein
// Bearbeitungsschritt der Pipeline, sondern eine Korrektur), Lila markiert
// das klar als eigene, fuenfte Kategorie.
export function caseStatusBadgeClass(status: CaseStatus): string {
  switch (status) {
    case "NEW":
      return "bg-dash-status-new/15 text-dash-status-new";
    case "IN_REVIEW":
      return "bg-dash-status-active/15 text-dash-status-active";
    case "REVIEWED":
      return "bg-dash-status-reviewed/15 text-dash-status-reviewed";
    case "CLOSED":
      return "bg-dash-status-done/15 text-dash-status-done";
    case "FALSE_POSITIVE":
      return "bg-dash-purple-tint text-dash-purple";
  }
}

// Erlaubte Statusuebergaenge fuer die Arbeitsliste-Buttons - src/actions/
// case-review.ts nutzt dieselbe Tabelle, dort aber als die tatsaechlich
// massgebliche serverseitige Pruefung (dieser Client-Export bestimmt nur,
// welche Buttons ueberhaupt angezeigt werden). CLOSED -> NEW und
// FALSE_POSITIVE -> NEW ("wieder oeffnen") sind bewusst erlaubt, damit ein
// faelschlich abgeschlossener/als Fehlalarm markierter Fall korrigierbar
// bleibt. "Kein echter Fund" ist bewusst aus NEW/IN_REVIEW/REVIEWED heraus
// erreichbar (nicht nur aus einem bestimmten Schritt) - ein Fehlalarm kann
// in jeder Phase der Pruefung auffallen, nicht erst am Ende.
export const CASE_STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  NEW: ["IN_REVIEW", "FALSE_POSITIVE"],
  IN_REVIEW: ["REVIEWED", "NEW", "FALSE_POSITIVE"],
  REVIEWED: ["CLOSED", "IN_REVIEW", "FALSE_POSITIVE"],
  CLOSED: ["NEW"],
  FALSE_POSITIVE: ["NEW"],
};

export type CaseStatusFilter = "all" | CaseStatus;
export type CaseCategoryFilter = "all" | CaseCategory;

export function isCaseCategory(value: string | undefined): value is CaseCategory {
  return !!value && Object.hasOwn(CASE_CATEGORY_LABELS, value);
}
