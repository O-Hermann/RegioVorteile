"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { assertCanManageCompany, hashPassword, requireAdmin } from "@/lib/auth";
import type { CompanyRole } from "@/generated/prisma/client";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Tage

function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

function safePath(value: FormDataEntryValue | null, fallback: string) {
  const path = String(value ?? "");
  // Nur relative Pfade erlauben, keine Weiterleitung auf fremde Ziele.
  return path.startsWith("/") ? path : fallback;
}

// Arbeitsbereich-Wechsel: setzt das gewaehlte Unternehmen in der Session, aber
// nur nachdem serverseitig geprueft wurde, dass eine aktive Mitgliedschaft
// existiert - ein manipulierter companyId-Wert ohne passende Mitgliedschaft
// fuehrt zu keinem Zugriff (requireCompanyMember() prueft ohnehin bei jedem
// Aufruf erneut, dies ist zusaetzlich die Absicherung direkt beim Wechsel).
export async function switchCompanyWorkspace(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const membership = await prisma.companyMembership.findFirst({
    where: { userId: session.userId, companyId, status: "ACTIVE", company: { status: "ACTIVE" } },
  });
  if (!membership) {
    redirect("/arbeitgeber/login");
  }

  session.selectedCompanyId = companyId;
  await session.save();
  redirect("/arbeitgeber/dashboard");
}

// Laedt oder legt den eingeladenen Benutzer an und erzeugt/erneuert eine
// Mitgliedschaft im Status INVITED mit einem zeitlich begrenzten,
// kryptografisch zufaelligen Einladungstoken (analog PasswordResetToken).
export async function inviteCompanyMember(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim() || null;
  const lastName = String(formData.get("lastName") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "") as CompanyRole;
  const platformRoleRaw = String(formData.get("platformRole") ?? "");
  const successPath = safePath(formData.get("successPath"), "/admin/benutzer");

  const { user: actingUser } = await assertCanManageCompany(companyId);

  if (!email || !role) {
    redirect(`${successPath}?error=missing`);
  }

  let targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: { email, firstName, lastName, passwordHash: null },
    });
  }

  // Plattformrolle darf beim Einladen nur von einem Superadmin vergeben werden.
  if (platformRoleRaw && actingUser.platformRole === "SUPERADMIN") {
    await prisma.user.update({
      where: { id: targetUser.id },
      data: { platformRole: platformRoleRaw as "SUPERADMIN" | "PLATFORM_ADMIN" | "SUPPORT" },
    });
  }

  const existingMembership = await prisma.companyMembership.findUnique({
    where: { userId_companyId: { userId: targetUser.id, companyId } },
  });
  if (existingMembership?.status === "ACTIVE") {
    redirect(`${successPath}?error=already-member`);
  }

  const inviteToken = generateInviteToken();
  const inviteTokenExpiresAt = new Date(Date.now() + INVITE_TTL_MS);

  if (existingMembership) {
    await prisma.companyMembership.update({
      where: { id: existingMembership.id },
      data: {
        role,
        status: "INVITED",
        invitedById: actingUser.id,
        invitedAt: new Date(),
        inviteToken,
        inviteTokenExpiresAt,
      },
    });
  } else {
    await prisma.companyMembership.create({
      data: {
        userId: targetUser.id,
        companyId,
        role,
        status: "INVITED",
        invitedById: actingUser.id,
        inviteToken,
        inviteTokenExpiresAt,
      },
    });
  }

  revalidatePath("/admin/benutzer");
  revalidatePath("/admin/unternehmen");
  revalidatePath("/arbeitgeber/dashboard/benutzer");
  redirect(`${successPath}?newInviteToken=${inviteToken}`);
}

export async function changeMembershipRole(formData: FormData) {
  const membershipId = String(formData.get("membershipId") ?? "");
  const role = String(formData.get("role") ?? "") as CompanyRole;
  const successPath = safePath(formData.get("successPath"), "/admin/benutzer");

  const membership = await prisma.companyMembership.findUnique({ where: { id: membershipId } });
  if (!membership) {
    redirect(`${successPath}?error=not-found`);
  }

  await assertCanManageCompany(membership.companyId);

  if (membership.role === "OWNER" && role !== "OWNER" && membership.status === "ACTIVE") {
    const owners = await prisma.companyMembership.count({
      where: { companyId: membership.companyId, role: "OWNER", status: "ACTIVE" },
    });
    if (owners <= 1) {
      redirect(`${successPath}?error=last-owner`);
    }
  }

  await prisma.companyMembership.update({ where: { id: membershipId }, data: { role } });
  revalidatePath(successPath);
  redirect(successPath);
}

export async function removeMembership(formData: FormData) {
  const membershipId = String(formData.get("membershipId") ?? "");
  const successPath = safePath(formData.get("successPath"), "/admin/benutzer");

  const membership = await prisma.companyMembership.findUnique({ where: { id: membershipId } });
  if (!membership) {
    redirect(`${successPath}?error=not-found`);
  }

  await assertCanManageCompany(membership.companyId);

  if (membership.role === "OWNER" && membership.status === "ACTIVE") {
    const owners = await prisma.companyMembership.count({
      where: { companyId: membership.companyId, role: "OWNER", status: "ACTIVE" },
    });
    if (owners <= 1) {
      redirect(`${successPath}?error=last-owner`);
    }
  }

  await prisma.companyMembership.delete({ where: { id: membershipId } });
  revalidatePath(successPath);
  redirect(successPath);
}

export async function resendCompanyInvite(formData: FormData) {
  const membershipId = String(formData.get("membershipId") ?? "");
  const successPath = safePath(formData.get("successPath"), "/admin/benutzer");

  const membership = await prisma.companyMembership.findUnique({ where: { id: membershipId } });
  if (!membership) {
    redirect(`${successPath}?error=not-found`);
  }

  await assertCanManageCompany(membership.companyId);

  if (membership.status !== "INVITED") {
    redirect(`${successPath}?error=already-member`);
  }

  const inviteToken = generateInviteToken();
  const inviteTokenExpiresAt = new Date(Date.now() + INVITE_TTL_MS);
  await prisma.companyMembership.update({
    where: { id: membershipId },
    data: { inviteToken, inviteTokenExpiresAt, invitedAt: new Date() },
  });

  revalidatePath(successPath);
  redirect(`${successPath}?newInviteToken=${inviteToken}`);
}

// Einladung einloesen: entweder neues Passwort setzen (Stub-User ohne
// Passwort) oder, falls der Zielnutzer bereits ein Konto mit Passwort hat,
// nur bestaetigen (erfordert dann ein bereits bestehendes Login als genau
// dieser Nutzer - siehe Claim-Seite).
export async function claimCompanyInvite(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  const membership = await prisma.companyMembership.findUnique({
    where: { inviteToken: token },
    include: { user: true },
  });

  if (
    !membership ||
    membership.status !== "INVITED" ||
    !membership.inviteTokenExpiresAt ||
    membership.inviteTokenExpiresAt < new Date()
  ) {
    redirect("/einladung/ungueltig");
  }

  const targetUser = membership.user;

  if (!targetUser.passwordHash) {
    if (!password || password.length < 8 || password !== passwordConfirm) {
      redirect(`/einladung/${token}?error=1`);
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUser.id },
        data: {
          passwordHash: await hashPassword(password),
          firstName: firstName || targetUser.firstName,
          lastName: lastName || targetUser.lastName,
        },
      }),
      prisma.companyMembership.update({
        where: { id: membership.id },
        data: { status: "ACTIVE", activatedAt: new Date(), inviteToken: null, inviteTokenExpiresAt: null },
      }),
    ]);

    const session = await getSession();
    session.userId = targetUser.id;
    session.selectedCompanyId = membership.companyId;
    await session.save();
    redirect("/arbeitgeber/dashboard");
  }

  // Bestehender Nutzer wird zu einem weiteren Unternehmen eingeladen -
  // erfordert ein bereits bestehendes Login als genau dieser Nutzer.
  const session = await getSession();
  if (session.userId !== targetUser.id) {
    redirect(`/login?next=/einladung/${token}`);
  }

  await prisma.companyMembership.update({
    where: { id: membership.id },
    data: { status: "ACTIVE", activatedAt: new Date(), inviteToken: null, inviteTokenExpiresAt: null },
  });
  session.selectedCompanyId = membership.companyId;
  await session.save();
  redirect("/arbeitgeber/dashboard");
}

// --- Unternehmensverwaltung (Admin) ----------------------------------------

export async function createCompany(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect("/admin/unternehmen/neu?error=missing");
  }
  const company = await prisma.company.create({ data: { name, status: "ACTIVE" } });
  revalidatePath("/admin/unternehmen");
  redirect(`/admin/unternehmen/${company.id}`);
}

export async function renameCompany(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) {
    redirect(`/admin/unternehmen/${id}?error=missing`);
  }
  await prisma.company.update({ where: { id }, data: { name } });
  revalidatePath("/admin/unternehmen");
  revalidatePath(`/admin/unternehmen/${id}`);
  redirect(`/admin/unternehmen/${id}`);
}

export async function setCompanyStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as "ACTIVE" | "DISABLED";
  await prisma.company.update({ where: { id }, data: { status } });
  revalidatePath("/admin/unternehmen");
  revalidatePath(`/admin/unternehmen/${id}`);
  redirect(`/admin/unternehmen/${id}`);
}
