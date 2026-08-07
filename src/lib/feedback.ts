import type { FeedbackCategory, FeedbackStatus } from "@/generated/prisma/client";

export const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  SUGGESTION: "Verbesserungsvorschlag",
  BUG: "Fehlermeldung",
  OTHER: "Sonstiges",
  HELP: "Hilfeanfrage",
};

export function categoryBadgeClass(category: FeedbackCategory) {
  if (category === "BUG") return "bg-red-50 text-red-700";
  if (category === "SUGGESTION") return "bg-gold-100 text-gold-700";
  if (category === "HELP") return "bg-sky-50 text-sky-700";
  return "bg-sand-200 text-sand-700";
}

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  OPEN: "offen",
  IN_PROGRESS: "in Bearbeitung",
  DONE: "erledigt",
};

export function statusLabel(status: FeedbackStatus) {
  return STATUS_LABELS[status];
}

export function statusBadgeClass(status: FeedbackStatus) {
  if (status === "DONE") return "bg-ink-100 text-ink-800";
  if (status === "IN_PROGRESS") return "bg-sky-50 text-sky-700";
  return "bg-gold-100 text-gold-700";
}
