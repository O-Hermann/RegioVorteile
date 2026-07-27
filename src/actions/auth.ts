"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { verifyPassword } from "@/lib/auth";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN" || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/admin/login?error=1");
  }

  const session = await getSession();
  session.userId = user.id;
  session.userRole = "ADMIN";
  await session.save();
  redirect("/admin/dashboard");
}

export async function loginEmployer(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "EMPLOYER" || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/arbeitgeber/login?error=1");
  }

  const session = await getSession();
  session.userId = user.id;
  session.userRole = "EMPLOYER";
  await session.save();
  redirect("/arbeitgeber/dashboard");
}

export async function joinAsEmployee(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();

  const employee = await prisma.employee.findUnique({ where: { inviteCode: code } });
  if (!employee) {
    redirect("/mitarbeiter/login?error=1");
  }

  if (employee.status === "INVITED") {
    await prisma.employee.update({
      where: { id: employee.id },
      data: { status: "ACTIVE" },
    });
  }

  const session = await getSession();
  session.employeeId = employee.id;
  await session.save();
  redirect("/mitarbeiter/vorteile");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
