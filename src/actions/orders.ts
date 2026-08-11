"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember, assertCanManageOrders } from "@/lib/auth";
import { Prisma, type OrderStatus } from "@/generated/prisma/client";

// Zentrale Mutationen fuer die Auftragsverwaltung (Phase 6.2.1: Anlegen;
// Phase 6.2.2: Bearbeiten + Loeschen). Lese-/Aggregationslogik lebt getrennt
// in lib/orders.ts.

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

// companyId wird IMMER erst nach dem Laden des bestehenden Auftrags aus der
// DB ermittelt (nie aus dem Formular vertraut) - exakt gleiches Muster wie
// updateCustomer()/deleteCustomer() in actions/customers.ts.
export async function updateOrder(formData: FormData) {
  const orderId = trimmed(formData.get("orderId"));
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) redirect("/arbeitgeber/dashboard/auftraege?error=not-found");

  await assertCanManageOrders(existing.companyId);

  const errorPath = `/arbeitgeber/dashboard/auftraege/${existing.id}/bearbeiten`;

  const title = trimmed(formData.get("title"));
  if (!title) redirect(`${errorPath}?error=title-missing`);
  if (title.length > MAX_TITLE) redirect(`${errorPath}?error=title-too-long`);

  const orderNumber = trimmed(formData.get("orderNumber"));
  if (!orderNumber) redirect(`${errorPath}?error=number-missing`);
  if (orderNumber.length > MAX_NUMBER) redirect(`${errorPath}?error=number-too-long`);

  const customerId = trimmed(formData.get("customerId"));
  // Der Kunde wird erneut serverseitig gegen die Company DES BESTEHENDEN
  // AUFTRAGS geprueft (nicht gegen eine Company aus dem Formular) - Punkt 9.
  const customer = customerId ? await prisma.customer.findFirst({ where: { id: customerId, companyId: existing.companyId } }) : null;
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

  // completedAt-Logik (Punkt 6): beim Uebergang IN den Status "Erledigt"
  // wird der Zeitpunkt einmalig gesetzt. Bleibt der Auftrag "Erledigt"
  // (z.B. nur Titel geaendert), bleibt der urspruengliche Zeitpunkt
  // unangetastet - ein erneutes "Speichern" darf das echte Abschlussdatum
  // nicht verfaelschen. Verlaesst der Auftrag den Status "Erledigt" wieder,
  // wird completedAt bewusst zurueckgesetzt: das Feld bedeutet "wann wurde
  // dieser Auftrag abgeschlossen" - ohne den Status "Erledigt" waere ein
  // stehen gebliebenes Datum irrefuehrend (z.B. in einer spaeteren
  // "erledigt diesen Monat"-Auswertung).
  let completedAt = existing.completedAt;
  if (status === "COMPLETED" && existing.status !== "COMPLETED") {
    completedAt = new Date();
  } else if (status !== "COMPLETED") {
    completedAt = null;
  }

  try {
    await prisma.order.update({
      where: { id: existing.id },
      data: {
        title,
        orderNumber,
        customerId: customer.id,
        status,
        startDate,
        dueDate,
        description: descriptionRaw || null,
        completedAt,
      },
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) redirect(`${errorPath}?error=number-taken`);
    throw err;
  }

  revalidatePath("/arbeitgeber/dashboard/auftraege");
  revalidatePath(`/arbeitgeber/dashboard/auftraege/${existing.id}`);
  revalidatePath("/arbeitgeber/dashboard");
  redirect(`/arbeitgeber/dashboard/auftraege/${existing.id}?updated=1`);
}

// Hard Delete ist hier zulaessig (Punkt 8) - im Schema haengt keine weitere
// Relation an Order (keine Auftragspositionen, Aufgaben o.ae. existieren
// bisher), ein Cascade-Risiko besteht damit nicht. companyId wird auch hier
// ausschliesslich aus dem geladenen Datensatz abgeleitet.
export async function deleteOrder(formData: FormData) {
  const orderId = trimmed(formData.get("orderId"));
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) redirect("/arbeitgeber/dashboard/auftraege?error=not-found");

  await assertCanManageOrders(existing.companyId);

  await prisma.order.delete({ where: { id: existing.id } });

  revalidatePath("/arbeitgeber/dashboard/auftraege");
  revalidatePath("/arbeitgeber/dashboard");
  redirect("/arbeitgeber/dashboard/auftraege?deleted=1");
}
