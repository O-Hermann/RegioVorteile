import type { FeedbackCategory, FeedbackStatus } from "@/generated/prisma/client";

export const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  SUGGESTION: "Verbesserungsvorschlag",
  BUG: "Fehlermeldung",
  OTHER: "Sonstiges",
};

export function categoryBadgeClass(category: FeedbackCategory) {
  if (category === "BUG") return "bg-red-50 text-red-700";
  if (category === "SUGGESTION") return "bg-gold-100 text-gold-700";
  return "bg-sand-200 text-sand-700";
}

export function statusLabel(status: FeedbackStatus) {
  return status === "DONE" ? "erledigt" : "offen";
}

export function statusBadgeClass(status: FeedbackStatus) {
  return status === "DONE" ? "bg-ink-100 text-ink-800" : "bg-gold-100 text-gold-700";
}
