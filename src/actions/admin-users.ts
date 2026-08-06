"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { PlatformRole, UserStatus } from "@/generated/prisma/client";

async function countOtherActiveSuperadmins(excludeUserId: string) {
  return prisma.user.count({
    where: { platformRole: "SUPERADMIN", status: "ACTIVE", id: { not: excludeUserId } },
  });
}

export async function updateUserProfile(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim() || null;
  const lastName = String(formData.get("lastName") ?? "").trim() || null;

  await prisma.user.update({ where: { id }, data: { firstName, lastName } });
  revalidatePath("/admin/benutzer");
  revalidatePath(`/admin/benutzer/${id}`);
  redirect(`/admin/benutzer/${id}`);
}

// Deaktiviert/aktiviert einen Benutzer. Verweigert das Deaktivieren des
// letzten aktiven Superadmins, damit die Plattform nicht versehentlich
// ohne Verwaltungszugriff zurueckbleibt.
export async function setUserStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as UserStatus;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    redirect("/admin/benutzer?error=not-found");
  }

  if (status === "DISABLED" && target.platformRole === "SUPERADMIN") {
    const others = await countOtherActiveSuperadmins(id);
    if (others === 0) {
      redirect(`/admin/benutzer/${id}?error=last-superadmin`);
    }
  }

  await prisma.user.update({ where: { id }, data: { status } });
  revalidatePath("/admin/benutzer");
  revalidatePath(`/admin/benutzer/${id}`);
  redirect(`/admin/benutzer/${id}`);
}

// Vergibt/entfernt die Plattformrolle. Nur ein Superadmin darf dies tun, und
// der letzte aktive Superadmin kann sich nicht selbst (oder ein anderer ihn)
// herabstufen.
export async function setPlatformRole(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const platformRoleRaw = String(formData.get("platformRole") ?? "");
  const platformRole = (platformRoleRaw || null) as PlatformRole | null;

  const actingUser = await prisma.user.findUnique({ where: { id: session.userId! } });
  if (actingUser?.platformRole !== "SUPERADMIN") {
    redirect(`/admin/benutzer/${id}?error=forbidden`);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    redirect("/admin/benutzer?error=not-found");
  }

  if (target.platformRole === "SUPERADMIN" && platformRole !== "SUPERADMIN") {
    const others = await countOtherActiveSuperadmins(id);
    if (others === 0) {
      redirect(`/admin/benutzer/${id}?error=last-superadmin`);
    }
  }

  await prisma.user.update({ where: { id }, data: { platformRole } });
  revalidatePath("/admin/benutzer");
  revalidatePath(`/admin/benutzer/${id}`);
  redirect(`/admin/benutzer/${id}`);
}
