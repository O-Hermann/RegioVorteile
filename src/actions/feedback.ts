"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireEmployer, requireEmployee } from "@/lib/auth";
import type { FeedbackCategory } from "@/generated/prisma/client";

function parseCategory(value: FormDataEntryValue | null): FeedbackCategory {
  const v = String(value ?? "");
  return v === "SUGGESTION" || v === "BUG" || v === "OTHER" ? v : "OTHER";
}

export async function submitEmployerFeedback(formData: FormData) {
  const { employer } = await requireEmployer();
  const message = String(formData.get("message") ?? "").trim();
  const category = parseCategory(formData.get("category"));

  if (!message) {
    redirect("/arbeitgeber/dashboard/feedback?error=1");
  }

  await prisma.feedback.create({
    data: { message, category, employerId: employer.id },
  });

  revalidatePath("/arbeitgeber/dashboard/feedback");
  revalidatePath("/admin/feedback");
  redirect("/arbeitgeber/dashboard/feedback?sent=1");
}

export async function submitEmployeeFeedback(formData: FormData) {
  const { employee } = await requireEmployee();
  const message = String(formData.get("message") ?? "").trim();
  const category = parseCategory(formData.get("category"));

  if (!message) {
    redirect("/mitarbeiter/feedback?error=1");
  }

  await prisma.feedback.create({
    data: { message, category, employeeId: employee.id },
  });

  revalidatePath("/mitarbeiter/feedback");
  revalidatePath("/admin/feedback");
  redirect("/mitarbeiter/feedback?sent=1");
}

export async function markFeedbackDone(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) return;

  await prisma.feedback.update({
    where: { id },
    data: { status: feedback.status === "DONE" ? "OPEN" : "DONE" },
  });
  revalidatePath("/admin/feedback");
  revalidatePath("/admin/dashboard");
}

export async function deleteFeedback(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.feedback.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/feedback");
  revalidatePath("/admin/dashboard");
}
