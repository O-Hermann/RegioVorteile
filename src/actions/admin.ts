"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function createRegion(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const plzCodes = String(formData.get("plzCodes") ?? "").trim();
  if (!name || !plzCodes) return;

  await prisma.region.create({ data: { name, plzCodes } });
  revalidatePath("/admin/regionen");
  redirect("/admin/regionen");
}

export async function updateRegion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const plzCodes = String(formData.get("plzCodes") ?? "").trim();
  if (!id || !name || !plzCodes) return;

  await prisma.region.update({ where: { id }, data: { name, plzCodes } });
  revalidatePath("/admin/regionen");
  redirect("/admin/regionen");
}

export async function deleteRegion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.region.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/regionen");
}

export async function createPartner(formData: FormData) {
  await requireAdmin();
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    discountText: String(formData.get("discountText") ?? "").trim(),
    regionId: String(formData.get("regionId") ?? ""),
    street: String(formData.get("street") ?? "").trim(),
    plz: String(formData.get("plz") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
    contractEndDate: new Date(String(formData.get("contractEndDate") ?? "")),
  };
  if (!data.name || !data.regionId) return;

  await prisma.partnerBusiness.create({ data });
  revalidatePath("/admin/partnerbetriebe");
  redirect("/admin/partnerbetriebe");
}

export async function updatePartner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    discountText: String(formData.get("discountText") ?? "").trim(),
    regionId: String(formData.get("regionId") ?? ""),
    street: String(formData.get("street") ?? "").trim(),
    plz: String(formData.get("plz") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
    contractEndDate: new Date(String(formData.get("contractEndDate") ?? "")),
  };
  if (!id || !data.name || !data.regionId) return;

  await prisma.partnerBusiness.update({ where: { id }, data });
  revalidatePath("/admin/partnerbetriebe");
  redirect("/admin/partnerbetriebe");
}

export async function togglePartnerActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const partner = await prisma.partnerBusiness.findUnique({ where: { id } });
  if (!partner) return;
  await prisma.partnerBusiness.update({
    where: { id },
    data: { active: !partner.active },
  });
  revalidatePath("/admin/partnerbetriebe");
}

export async function deletePartner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.partnerBusiness.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/partnerbetriebe");
}

export async function updateEmployer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    companyName: String(formData.get("companyName") ?? "").trim(),
    employeeCount: Number(formData.get("employeeCount") ?? 0),
    regionId: String(formData.get("regionId") ?? ""),
    pricingTierId: String(formData.get("pricingTierId") ?? ""),
    subscriptionStatus: String(formData.get("subscriptionStatus") ?? "").trim(),
    contractEndDate: new Date(String(formData.get("contractEndDate") ?? "")),
    contactFirstName: String(formData.get("contactFirstName") ?? "").trim() || null,
    contactLastName: String(formData.get("contactLastName") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    street: String(formData.get("street") ?? "").trim() || null,
    plz: String(formData.get("plz") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
  };
  if (!id || !data.companyName || !data.employeeCount || !data.regionId || !data.pricingTierId) return;

  await prisma.employer.update({ where: { id }, data });
  revalidatePath("/admin/arbeitgeber");
  revalidatePath(`/admin/arbeitgeber/${id}`);
  redirect(`/admin/arbeitgeber/${id}`);
}

export async function toggleEmployerApproval(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const employer = await prisma.employer.findUnique({ where: { id } });
  if (!employer) return;

  await prisma.employer.update({
    where: { id },
    data: { approved: !employer.approved },
  });
  revalidatePath("/admin/arbeitgeber");
  revalidatePath(`/admin/arbeitgeber/${id}`);
  revalidatePath("/admin/dashboard");
}

export async function cancelEmployerContract(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.employer
    .update({ where: { id }, data: { subscriptionStatus: "gekündigt" } })
    .catch(() => null);
  revalidatePath("/admin/arbeitgeber");
  revalidatePath(`/admin/arbeitgeber/${id}`);
}

export async function renewEmployerContract(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const employer = await prisma.employer.findUnique({ where: { id } });
  if (!employer) return;

  const base = employer.contractEndDate > new Date() ? employer.contractEndDate : new Date();
  const newEndDate = new Date(base);
  newEndDate.setFullYear(newEndDate.getFullYear() + 1);

  await prisma.employer.update({
    where: { id },
    data: { contractEndDate: newEndDate, subscriptionStatus: "aktiv" },
  });
  revalidatePath("/admin/arbeitgeber");
  revalidatePath(`/admin/arbeitgeber/${id}`);
}
