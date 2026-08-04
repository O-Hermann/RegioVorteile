"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/auth";

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

  const user = await prisma.user.findUnique({ where: { email }, include: { employer: true } });
  if (!user || user.role !== "EMPLOYER" || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/arbeitgeber/login?error=1");
  }

  if (!user.employer?.approved) {
    redirect("/arbeitgeber/login?error=pending");
  }

  const session = await getSession();
  session.userId = user.id;
  session.userRole = "EMPLOYER";
  await session.save();
  redirect("/arbeitgeber/dashboard");
}

export async function loginEmployee(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee || !employee.passwordHash || !(await verifyPassword(password, employee.passwordHash))) {
    redirect("/mitarbeiter/login?error=1");
  }

  const session = await getSession();
  session.employeeId = employee.id;
  await session.save();
  redirect("/mitarbeiter/vorteile");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!email || !password) {
    redirect("/login?error=1");
  }

  const user = await prisma.user.findUnique({ where: { email }, include: { employer: true } });
  if (user && (await verifyPassword(password, user.passwordHash))) {
    if (user.role === "EMPLOYER" && !user.employer?.approved) {
      redirect("/login?error=pending");
    }

    const session = await getSession({ persistent: remember });
    session.userId = user.id;
    session.userRole = user.role;
    await session.save();
    redirect(user.role === "ADMIN" ? "/admin/dashboard" : "/arbeitgeber/dashboard");
  }

  const employee = await prisma.employee.findUnique({ where: { email } });
  if (employee?.passwordHash && (await verifyPassword(password, employee.passwordHash))) {
    const session = await getSession({ persistent: remember });
    session.employeeId = employee.id;
    await session.save();
    redirect("/mitarbeiter/vorteile");
  }

  redirect("/login?error=1");
}

export async function activateEmployeeAccount(formData: FormData) {
  const inviteCode = String(formData.get("inviteCode") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const employee = await prisma.employee.findUnique({ where: { inviteCode } });
  if (!employee || employee.passwordHash) {
    redirect("/mitarbeiter/login?error=1");
  }

  if (!email || password.length < 8 || password !== passwordConfirm) {
    redirect(`/mitarbeiter/einladung/${inviteCode}?error=1`);
  }

  if (email !== employee.email) {
    const clash = await prisma.employee.findUnique({ where: { email } });
    if (clash) {
      redirect(`/mitarbeiter/einladung/${inviteCode}?error=email`);
    }
  }

  await prisma.employee.update({
    where: { id: employee.id },
    data: { email, passwordHash: await hashPassword(password), status: "ACTIVE" },
  });

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
