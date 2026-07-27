"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword, requireEmployer } from "@/lib/auth";
import { generateCode } from "@/lib/codes";

async function findPricingTierId(employeeCount: number) {
  const tiers = await prisma.pricingTier.findMany({ orderBy: { minEmployees: "asc" } });
  const match = tiers.find(
    (t) => employeeCount >= t.minEmployees && (t.maxEmployees === null || employeeCount <= t.maxEmployees)
  );
  return (match ?? tiers[tiers.length - 1])?.id ?? null;
}

export async function registerEmployer(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const employeeCount = Number(formData.get("employeeCount") ?? 0);
  const regionId = String(formData.get("regionId") ?? "");

  if (!companyName || !email || !password || !employeeCount || !regionId) {
    redirect("/arbeitgeber/registrieren?error=missing");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/arbeitgeber/registrieren?error=email");
  }

  const pricingTierId = await findPricingTierId(employeeCount);
  if (!pricingTierId) {
    redirect("/arbeitgeber/registrieren?error=pricing");
  }

  const passwordHash = await hashPassword(password);
  const contractEndDate = new Date();
  contractEndDate.setFullYear(contractEndDate.getFullYear() + 1);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "EMPLOYER",
      employer: {
        create: {
          companyName,
          employeeCount,
          regionId,
          pricingTierId: pricingTierId as string,
          contractEndDate,
        },
      },
    },
  });

  const session = await getSession();
  session.userId = user.id;
  session.userRole = "EMPLOYER";
  await session.save();
  redirect("/arbeitgeber/dashboard");
}

export async function inviteEmployee(formData: FormData) {
  const { employer } = await requireEmployer();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || !email) {
    redirect("/arbeitgeber/dashboard/mitarbeiter?error=missing");
  }

  let code = generateCode(8);
  // Sicherstellen, dass der Code eindeutig ist
  // (bei 32^8 Kombinationen praktisch nie noetig, aber zur Sicherheit geprueft)
  for (let attempts = 0; attempts < 5; attempts++) {
    const clash = await prisma.employee.findUnique({ where: { inviteCode: code } });
    if (!clash) break;
    code = generateCode(8);
  }

  await prisma.employee.create({
    data: {
      employerId: employer.id,
      name,
      email,
      inviteCode: code,
    },
  });

  revalidatePath("/arbeitgeber/dashboard");
  revalidatePath("/arbeitgeber/dashboard/mitarbeiter");
  redirect("/arbeitgeber/dashboard/mitarbeiter?invited=1");
}

export async function removeEmployee(formData: FormData) {
  const { employer } = await requireEmployer();
  const id = String(formData.get("id") ?? "");

  await prisma.employee
    .delete({ where: { id, employerId: employer.id } })
    .catch(() => null);

  revalidatePath("/arbeitgeber/dashboard/mitarbeiter");
}
