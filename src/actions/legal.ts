"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { LegalPageSlug } from "@/generated/prisma/client";

export async function updateLegalPage(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "") as LegalPageSlug;
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (slug !== "IMPRESSUM" && slug !== "DATENSCHUTZ") return;
  if (!title || !content) return;

  await prisma.legalPage.upsert({
    where: { slug },
    create: { slug, title, content },
    update: { title, content },
  });

  revalidatePath("/admin/rechtliches");
  revalidatePath("/impressum");
  revalidatePath("/datenschutz");
}
