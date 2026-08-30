"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember } from "@/lib/auth";
import { CASE_STATUS_TRANSITIONS } from "@/lib/case-labels";
import type { CaseStatus } from "@/generated/prisma/client";

export type UpdateCaseStatusResult = { status: "ok" } | { status: "error"; message: string };

// MVP-Roadmap Phase 2.2 (siehe [[effivo_mvp_roadmap]]): einziger Weg, den
// Bearbeitungsstatus eines Falls zu aendern. Mandantenpruefung ueber
// companyId (nie ueber die vom Client mitgegebene caseId allein vertrauen),
// erlaubte Uebergaenge serverseitig via CASE_STATUS_TRANSITIONS durchgesetzt
// (dieselbe Tabelle wie die Client-Buttons in case-status-actions.tsx nutzen,
// hier aber die tatsaechlich massgebliche Pruefung). reviewedAt/
// reviewedByUserId werden beim Erreichen von REVIEWED oder FALSE_POSITIVE
// gesetzt/aktualisiert - beides ist eine abgeschlossene menschliche Pruefung
// des Falls (siehe MVP-Roadmap Phase 5, [[effivo_mvp_roadmap]]: "Kein echter
// Fund" ist keine Ablehnung ohne Pruefung, sondern deren Ergebnis). Bei allen
// anderen Uebergaengen unveraendert gelassen (kein Loeschen des bisherigen
// Pruefverlaufs beim spaeteren Wiedereroeffnen).
export async function updateCaseStatus(caseId: string, nextStatus: CaseStatus): Promise<UpdateCaseStatusResult> {
  const { company, user } = await requireCompanyMember();

  const existing = await prisma.case.findFirst({ where: { id: caseId, companyId: company.id } });
  if (!existing) return { status: "error", message: "Fall wurde nicht gefunden." };

  if (!CASE_STATUS_TRANSITIONS[existing.status].includes(nextStatus)) {
    return { status: "error", message: "Dieser Statuswechsel ist nicht möglich." };
  }

  await prisma.case.update({
    where: { id: caseId },
    data: {
      status: nextStatus,
      ...(nextStatus === "REVIEWED" || nextStatus === "FALSE_POSITIVE" ? { reviewedAt: new Date(), reviewedByUserId: user.id } : {}),
    },
  });

  revalidatePath("/arbeitgeber/dashboard/faelle");
  revalidatePath("/arbeitgeber/dashboard");
  return { status: "ok" };
}
