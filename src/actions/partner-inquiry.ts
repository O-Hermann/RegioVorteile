"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function submitPartnerInquiry(formData: FormData) {
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!businessName || !contactName || !email) {
    redirect("/partner-werden?error=1");
  }

  await prisma.partnerInquiry.create({
    data: {
      businessName,
      contactName,
      email,
      phone: phone || null,
      message: message || null,
    },
  });

  revalidatePath("/admin/partneranfragen");
  redirect("/partner-werden?sent=1");
}

export async function markPartnerInquiryDone(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const inquiry = await prisma.partnerInquiry.findUnique({ where: { id } });
  if (!inquiry) return;

  await prisma.partnerInquiry.update({
    where: { id },
    data: { status: inquiry.status === "DONE" ? "OPEN" : "DONE" },
  });
  revalidatePath("/admin/partneranfragen");
  revalidatePath("/admin/dashboard");
}

export async function deletePartnerInquiry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.partnerInquiry.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/partneranfragen");
  revalidatePath("/admin/dashboard");
}
