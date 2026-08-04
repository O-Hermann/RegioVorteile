"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function submitContactRequest(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!firstName || !lastName || !companyName || !street || !postalCode || !phone) {
    redirect("/kontakt?error=1");
  }

  await prisma.contactRequest.create({
    data: {
      firstName,
      lastName,
      companyName,
      street,
      postalCode,
      phone,
      message: message || null,
    },
  });

  revalidatePath("/admin/kontaktanfragen");
  revalidatePath("/admin/dashboard");
  redirect("/kontakt?sent=1");
}

export async function markContactRequestDone(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const request = await prisma.contactRequest.findUnique({ where: { id } });
  if (!request) return;

  await prisma.contactRequest.update({
    where: { id },
    data: { status: request.status === "DONE" ? "OPEN" : "DONE" },
  });
  revalidatePath("/admin/kontaktanfragen");
  revalidatePath("/admin/dashboard");
}

export async function deleteContactRequest(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.contactRequest.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/kontaktanfragen");
  revalidatePath("/admin/dashboard");
}
