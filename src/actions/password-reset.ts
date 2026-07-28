"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { generateResetToken, PASSWORD_RESET_TTL_MS } from "@/lib/tokens";

function validateNewPassword(password: string, passwordConfirm: string) {
  return password.length >= 8 && password === passwordConfirm;
}

export async function requestEmployerPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.role !== "EMPLOYER") {
    redirect("/arbeitgeber/passwort-vergessen?sent=1");
  }

  const token = generateResetToken();
  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS) },
  });

  redirect(`/arbeitgeber/passwort-vergessen?sent=1&token=${token}`);
}

export async function resetEmployerPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (
    !record ||
    !record.userId ||
    record.usedAt ||
    record.expiresAt < new Date() ||
    !validateNewPassword(password, passwordConfirm)
  ) {
    redirect(`/arbeitgeber/passwort-zuruecksetzen/${token}?error=1`);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ]);

  redirect("/arbeitgeber/login?reset=1");
}

export async function requestEmployeePasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const employee = await prisma.employee.findUnique({ where: { email } });

  if (!employee) {
    redirect("/mitarbeiter/passwort-vergessen?sent=1");
  }

  const token = generateResetToken();
  await prisma.passwordResetToken.create({
    data: { token, employeeId: employee.id, expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS) },
  });

  redirect(`/mitarbeiter/passwort-vergessen?sent=1&token=${token}`);
}

export async function resetEmployeePassword(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (
    !record ||
    !record.employeeId ||
    record.usedAt ||
    record.expiresAt < new Date() ||
    !validateNewPassword(password, passwordConfirm)
  ) {
    redirect(`/mitarbeiter/passwort-zuruecksetzen/${token}?error=1`);
  }

  await prisma.$transaction([
    prisma.employee.update({
      where: { id: record.employeeId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ]);

  redirect("/mitarbeiter/login?reset=1");
}
