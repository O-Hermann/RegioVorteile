"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember, assertCanManageOrders } from "@/lib/auth";
import { Prisma, type OrderStatus } from "@/generated/prisma/client";

// Zentrale Mutationen fuer die Auftragsverwaltung (Phase 6.2.1). Lese-/
// Aggregationslogik lebt getrennt in lib/orders.ts. Bewusst NUR "Auftrag
// anlegen" in dieser Phase - Bearbeiten/Loeschen folgen in einer spaeteren
// Unterphase (siehe Auftrag "Noch NICHT Bestandteil dieser Phase").

const MAX_TITLE = 200;
const MAX_NUMBER = 50;
const MAX_DESCRIPTION = 5000;
const VALID_STATUSES: OrderStatus[] = ["OPEN", "IN_PROGRESS", "WAITING", "COMPLETED", "CANCELED"];

function trimmed(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim();
}

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

// "YYYY-MM-DD" aus einem <input type="date"> - bewusst als lokale Mitternacht
// interpretiert (reines Datumsfeld ohne Uhrzeitbedeutung). Ein leeres Feld
// ist zulaessig (Punkt 14) und liefert null, kein ungueltiges Datum.
function parseDateInput(raw: FormDataEntryValue | null): Date | null {
  const value = trimmed(raw);
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createOrder(formData: FormData) {
  const { company, user } = await requireCompanyMember();
  await assertCanManageOrders(company.id);

  const errorPath = "/arbeitgeber/dashboard/auftraege/neu";

  const title = trimmed(formData.get("title"));
  if (!title) redirect(`${errorPath}?error=title-missing`);
  if (title.length > MAX_TITLE) redirect(`${errorPath}?error=title-too-long`);

  const orderNumber = trimmed(formData.get("orderNumber"));
  if (!orderNumber) redirect(`${errorPath}?error=number-missing`);
  if (orderNumber.length > MAX_NUMBER) redirect(`${errorPath}?error=number-too-long`);

  const customerId = trimmed(formData.get("customerId"));
  // Kunde wird IMMER serverseitig erneut geladen und gegen die aktive
  // Company geprueft (Punkt 25) - dem Auswahlfeld selbst wird nicht vertraut,
  // auch wenn es nur Kunden des aktuellen Unternehmens anzeigt.
  const customer = customerId ? await prisma.customer.findFirst({ where: { id: customerId, companyId: company.id } }) : null;
  if (!customer) redirect(`${errorPath}?error=invalid-customer`);

  const statusRaw = trimmed(formData.get("status"));
  const status: OrderStatus = (VALID_STATUSES as string[]).includes(statusRaw) ? (statusRaw as OrderStatus) : "OPEN";

  const startDate = parseDateInput(formData.get("startDate"));
  const dueDate = parseDateInput(formData.get("dueDate"));
  if (startDate && dueDate && dueDate < startDate) {
    redirect(`${errorPath}?error=invalid-dates`);
  }

  const descriptionRaw = trimmed(formData.get("description"));
  if (descriptionRaw.length > MAX_DESCRIPTION) redirect(`${errorPath}?error=description-too-long`);

  try {
    await prisma.order.create({
      data: {
        companyId: company.id,
        customerId: customer.id,
        orderNumber,
        title,
        description: descriptionRaw || null,
        status,
        startDate,
        dueDate,
        // Bei direkter Neuanlage mit Status "Erledigt" wird completedAt sofort
        // gesetzt (Punkt 12) - bei jedem anderen Status bleibt es null, bis
        // eine spaetere Bearbeitungsfunktion (Phase 6.2.2+) den Status aendert.
        completedAt: status === "COMPLETED" ? new Date() : null,
        createdByUserId: user.id,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) redirect(`${errorPath}?error=number-taken`);
    throw err;
  }

  revalidatePath("/arbeitgeber/dashboard/auftraege");
  revalidatePath("/arbeitgeber/dashboard");
  redirect("/arbeitgeber/dashboard/auftraege?created=1");
}
