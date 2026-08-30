"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    user.status !== "ACTIVE" ||
    !user.platformRole ||
    !user.passwordHash ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    redirect("/admin/login?error=1");
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  redirect("/admin/dashboard");
}

export async function loginEmployer(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "ACTIVE" || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/arbeitgeber/login?error=1");
  }

  const membership = await prisma.companyMembership.findFirst({
    where: { userId: user.id, status: "ACTIVE", company: { status: "ACTIVE" } },
    orderBy: { activatedAt: "asc" },
  });
  if (!membership) {
    redirect("/arbeitgeber/login?error=pending");
  }

  // 2FA (siehe [[effivo_mvp_roadmap]], actions/two-factor.ts): Passwort ist
  // korrekt, aber "userId" wird erst NACH einem gueltigen TOTP-Code gesetzt -
  // bis dahin nur die Zwischenstufe "pendingTwoFactorUserId", die fuer sich
  // allein keinen Zugriff auf geschuetzte Seiten gewaehrt.
  if (user.totpEnabled) {
    const session = await getSession();
    session.pendingTwoFactorUserId = user.id;
    await session.save();
    redirect("/arbeitgeber/login/2fa");
  }

  const session = await getSession();
  session.userId = user.id;
  session.selectedCompanyId = membership.companyId;
  await session.save();
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
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
  const next = String(formData.get("next") ?? "");
  // Nur interne Einladungslinks als Redirect-Ziel erlauben, kein offenes
  // Redirect auf beliebige Pfade.
  const safeNext = next.startsWith("/einladung/") ? next : null;

  if (!email || !password) {
    redirect("/login?error=1");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.status === "ACTIVE" && user.passwordHash && (await verifyPassword(password, user.passwordHash))) {
    const membership = await prisma.companyMembership.findFirst({
      where: { userId: user.id, status: "ACTIVE", company: { status: "ACTIVE" } },
      orderBy: { activatedAt: "asc" },
    });

    // 2FA (siehe [[effivo_mvp_roadmap]]) - gleiche Zwischenstufe wie
    // loginEmployer(). "remember" wird zusaetzlich in der (noch
    // unvollstaendigen) Session gemerkt, damit verifyTwoFactorLogin() beim
    // finalen Session-Save dieselbe Persistenz-Praeferenz uebernehmen kann.
    if (user.totpEnabled) {
      const session = await getSession({ persistent: remember });
      session.pendingTwoFactorUserId = user.id;
      session.pendingTwoFactorRemember = remember;
      await session.save();
      redirect(`/arbeitgeber/login/2fa${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`);
    }

    const session = await getSession({ persistent: remember });
    session.userId = user.id;
    if (membership) {
      session.selectedCompanyId = membership.companyId;
    }
    await session.save();
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    if (safeNext) {
      redirect(safeNext);
    }
    if (membership) {
      redirect("/arbeitgeber/dashboard");
    }
    if (user.platformRole) {
      redirect("/admin/dashboard");
    }
    redirect("/login?error=1");
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
