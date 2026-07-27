import type { PartnerInquiryStatus } from "@/generated/prisma/client";

export function partnerInquiryStatusLabel(status: PartnerInquiryStatus) {
  return status === "DONE" ? "erledigt" : "offen";
}

export function partnerInquiryStatusBadgeClass(status: PartnerInquiryStatus) {
  return status === "DONE" ? "bg-ink-100 text-ink-800" : "bg-gold-100 text-gold-700";
}
