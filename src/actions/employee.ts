"use server";

import { requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/codes";

export async function getOrCreateRedemptionCode(partnerBusinessId: string) {
  const { employee } = await requireEmployee();

  const existing = await prisma.redemption.findFirst({
    where: { employeeId: employee.id, partnerBusinessId },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing.code;

  const code = `${generateCode(4)}-${generateCode(4)}`;
  await prisma.redemption.create({
    data: { employeeId: employee.id, partnerBusinessId, code },
  });
  return code;
}
