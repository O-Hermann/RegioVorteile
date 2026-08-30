"use client";

import { useState, useTransition } from "react";
import { updateCaseStatus } from "@/actions/case-review";
import { CASE_STATUS_TRANSITIONS } from "@/lib/case-labels";
import type { CaseStatus } from "@/generated/prisma/client";
import { dashSecondaryButtonClass } from "@/components/dashboard/dash-ui";

// MVP-Roadmap Phase 2.2 (siehe [[effivo_mvp_roadmap]]): einzige interaktive
// Komponente der Fallpruefungs-Arbeitsliste - der Rest der Seite bleibt eine
// reine Server-Komponente. Zeigt pro Fall die (laut CASE_STATUS_TRANSITIONS)
// erlaubten naechsten Status als Buttons; der erste Eintrag der Liste ist
// bewusst der "vorwaerts" fuehrende Uebergang (z.B. NEW -> IN_REVIEW) und
// wird optisch hervorgehoben, ein evtl. zweiter Eintrag ("zurueck") schlichter
// dargestellt.
const TRANSITION_BUTTON_LABELS: Record<CaseStatus, string> = {
  IN_REVIEW: "In Prüfung nehmen",
  REVIEWED: "Als geprüft markieren",
  CLOSED: "Abschließen",
  NEW: "Wieder öffnen",
  FALSE_POSITIVE: "Kein echter Fund",
};

export function CaseStatusActions({ caseId, status }: { caseId: string; status: CaseStatus }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const transitions = CASE_STATUS_TRANSITIONS[status];

  function handleClick(next: CaseStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateCaseStatus(caseId, next);
      if (result.status === "error") setError(result.message);
    });
  }

  if (transitions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {transitions.map((next, i) => (
        <button
          key={next}
          type="button"
          disabled={isPending}
          onClick={() => handleClick(next)}
          className={
            i === 0
              ? "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-dash-gold-deep to-dash-gold px-3.5 py-1.5 text-xs font-semibold text-dash-panel transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              : `${dashSecondaryButtonClass} !rounded-full !px-3.5 !py-1.5 !text-xs`
          }
        >
          {isPending ? "…" : TRANSITION_BUTTON_LABELS[next]}
        </button>
      ))}
      {error && <span className="text-xs text-dash-red">{error}</span>}
    </div>
  );
}
