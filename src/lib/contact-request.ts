import type { ContactRequestStatus } from "@/generated/prisma/client";

export function contactRequestStatusLabel(status: ContactRequestStatus) {
  return status === "DONE" ? "erledigt" : "offen";
}

export function contactRequestStatusBadgeClass(status: ContactRequestStatus) {
  return status === "DONE" ? "bg-ink-100 text-ink-800" : "bg-gold-100 text-gold-700";
}
