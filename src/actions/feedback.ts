"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireEmployer, requireEmployee, requireCompanyMember } from "@/lib/auth";
import type { FeedbackCategory, FeedbackStatus } from "@/generated/prisma/client";

function parseCategory(value: FormDataEntryValue | null): FeedbackCategory {
  const v = String(value ?? "");
  return v === "SUGGESTION" || v === "BUG" || v === "OTHER" ? v : "OTHER";
}

// Nur die drei im Unternehmensbereich angebotenen Kategorien zulassen
// (Hilfe/Bug/Verbesserung) - "OTHER" bleibt ein Alt-Wert der Mitarbeiter-/
// Arbeitgeber-Feedback-Formulare, wird hier bewusst nicht angeboten.
function parseCompanyCategory(value: FormDataEntryValue | null): FeedbackCategory {
  const v = String(value ?? "");
  return v === "HELP" || v === "BUG" || v === "SUGGESTION" ? v : "HELP";
}

function parseStatus(value: FormDataEntryValue | null): FeedbackStatus {
  const v = String(value ?? "");
  return v === "OPEN" || v === "IN_PROGRESS" || v === "DONE" ? v : "OPEN";
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

export async function submitCompanySupportRequest(formData: FormData) {
  const { company, user } = await requireCompanyMember();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const category = parseCompanyCategory(formData.get("category"));

  if (!subject || !message) {
    redirect("/arbeitgeber/dashboard/support?error=1");
  }

  await prisma.feedback.create({
    data: { subject, message, category, companyId: company.id, submittedByUserId: user.id },
  });

  revalidatePath("/arbeitgeber/dashboard/support");
  revalidatePath("/admin/feedback");
  redirect("/arbeitgeber/dashboard/support?sent=1");
}

export async function setFeedbackStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = parseStatus(formData.get("status"));

  await prisma.feedback.update({ where: { id }, data: { status } }).catch(() => null);
  revalidatePath("/admin/feedback");
  revalidatePath("/admin/dashboard");
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
