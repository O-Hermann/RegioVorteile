"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember, assertCanManageCustomers } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";

// Zentrale Mutationen fuer das Kunden-Grundsystem (Phase 6.1, Punkt 37).
// Lese-/Aggregationslogik lebt getrennt in lib/customers.ts. Jede Mutation
// prueft die Berechtigung serverseitig ueber assertCanManageCustomers -
// niemals nur ueber ausgeblendete UI-Buttons (Punkt 7).

const MAX_NAME = 200;
const MAX_NUMBER = 50;
const MAX_SHORT = 200;
const MAX_POSTAL = 20;
const MAX_WEBSITE = 300;
const MAX_NOTES = 5000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimmed(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim();
}

function optionalField(raw: FormDataEntryValue | null): string | null {
  const v = trimmed(raw);
  return v || null;
}

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value) && value.length <= MAX_SHORT;
}

// Normalisiert eine Website-Eingabe zu einer absoluten http(s)-URL. Liefert
// null bei einer nicht eindeutig interpretierbaren/unsicheren Eingabe (z.B.
// "javascript:..."), statt zu raten - dieselbe Zurueckhaltung wie an anderen
// Stellen des Projekts (siehe normalizeDateFromString in import-fields.ts).
function normalizeWebsite(raw: string): string | null {
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.toString().length > MAX_WEBSITE) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

type CustomerFieldValues = {
  name: string;
  customerNumber: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  status: "ACTIVE" | "INACTIVE";
};

// Liest und validiert die Stammdaten-/Kontakt-/Adressfelder eines Kunden-
// Formulars. Bei einem Validierungsfehler wird direkt auf errorRedirectPath
// mit einem passenden ?error=-Code umgeleitet (redirect() wirft intern -
// diese Funktion kehrt in diesem Fall nie zurueck).
function parseCustomerFields(formData: FormData, errorRedirectPath: string): CustomerFieldValues {
  const nameRaw = trimmed(formData.get("name"));
  if (!nameRaw) redirect(`${errorRedirectPath}?error=missing`);
  if (nameRaw.length > MAX_NAME) redirect(`${errorRedirectPath}?error=name-too-long`);

  const customerNumberRaw = trimmed(formData.get("customerNumber"));
  if (customerNumberRaw.length > MAX_NUMBER) redirect(`${errorRedirectPath}?error=number-too-long`);

  const emailRaw = trimmed(formData.get("email"));
  if (emailRaw && !isValidEmail(emailRaw)) redirect(`${errorRedirectPath}?error=invalid-email`);

  const websiteRaw = trimmed(formData.get("website"));
  let website: string | null = null;
  if (websiteRaw) {
    website = normalizeWebsite(websiteRaw);
    if (!website) redirect(`${errorRedirectPath}?error=invalid-website`);
  }

  const postalCodeRaw = trimmed(formData.get("postalCode"));

  const notesRaw = trimmed(formData.get("notes"));
  if (notesRaw.length > MAX_NOTES) redirect(`${errorRedirectPath}?error=notes-too-long`);

  const statusRaw = trimmed(formData.get("status"));
  const status: "ACTIVE" | "INACTIVE" = statusRaw === "INACTIVE" ? "INACTIVE" : "ACTIVE";

  return {
    name: nameRaw,
    customerNumber: customerNumberRaw || null,
    email: emailRaw || null,
    phone: optionalField(formData.get("phone"))?.slice(0, MAX_SHORT) ?? null,
    website,
    street: optionalField(formData.get("street"))?.slice(0, MAX_SHORT) ?? null,
    postalCode: postalCodeRaw ? postalCodeRaw.slice(0, MAX_POSTAL) : null,
    city: optionalField(formData.get("city"))?.slice(0, MAX_SHORT) ?? null,
    country: optionalField(formData.get("country"))?.slice(0, MAX_SHORT) ?? null,
    notes: notesRaw || null,
    status,
  };
}

export async function createCustomer(formData: FormData) {
  const { company, user } = await requireCompanyMember();
  await assertCanManageCustomers(company.id);

  const fields = parseCustomerFields(formData, "/arbeitgeber/dashboard/kunden/neu");

  // Optionaler erster Hauptansprechpartner (Punkt 20): nur anlegen, wenn
  // mindestens Vor- oder Nachname ausgefuellt wurde - kein leerer Contact.
  const contactFirstName = optionalField(formData.get("contactFirstName"))?.slice(0, MAX_SHORT) ?? null;
  const contactLastName = optionalField(formData.get("contactLastName"))?.slice(0, MAX_SHORT) ?? null;
  const contactEmailRaw = trimmed(formData.get("contactEmail"));
  if (contactEmailRaw && !isValidEmail(contactEmailRaw)) {
    redirect("/arbeitgeber/dashboard/kunden/neu?error=invalid-email");
  }
  const contactPosition = optionalField(formData.get("contactPosition"))?.slice(0, MAX_SHORT) ?? null;
  const contactPhone = optionalField(formData.get("contactPhone"))?.slice(0, MAX_SHORT) ?? null;
  const hasContact = !!(contactFirstName || contactLastName);

  let customer;
  try {
    // Kunde + erster Hauptansprechpartner werden atomar angelegt (Punkt 38).
    customer = await prisma.$transaction(async (tx) => {
      const c = await tx.customer.create({
        data: {
          companyId: company.id,
          createdByUserId: user.id,
          ...fields,
        },
      });
      if (hasContact) {
        await tx.customerContact.create({
          data: {
            customerId: c.id,
            firstName: contactFirstName,
            lastName: contactLastName,
            position: contactPosition,
            email: contactEmailRaw || null,
            phone: contactPhone,
            isPrimary: true,
          },
        });
      }
      return c;
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) redirect("/arbeitgeber/dashboard/kunden/neu?error=number-taken");
    throw err;
  }

  revalidatePath("/arbeitgeber/dashboard/kunden");
  revalidatePath("/arbeitgeber/dashboard");
  redirect(`/arbeitgeber/dashboard/kunden/${customer.id}`);
}

export async function updateCustomer(formData: FormData) {
  const customerId = trimmed(formData.get("customerId"));
  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!existing) redirect("/arbeitgeber/dashboard/kunden?error=not-found");

  await assertCanManageCustomers(existing.companyId);

  const editPath = `/arbeitgeber/dashboard/kunden/${customerId}/bearbeiten`;
  const fields = parseCustomerFields(formData, editPath);

  try {
    await prisma.customer.update({ where: { id: customerId }, data: fields });
  } catch (err) {
    if (isUniqueConstraintError(err)) redirect(`${editPath}?error=number-taken`);
    throw err;
  }

  revalidatePath("/arbeitgeber/dashboard/kunden");
  revalidatePath(`/arbeitgeber/dashboard/kunden/${customerId}`);
  redirect(`/arbeitgeber/dashboard/kunden/${customerId}`);
}

// Kein hartes Loeschen (Punkt 8) - ausschliesslich ACTIVE <-> INACTIVE.
export async function setCustomerStatus(formData: FormData) {
  const customerId = trimmed(formData.get("customerId"));
  const statusRaw = trimmed(formData.get("status"));
  const status: "ACTIVE" | "INACTIVE" = statusRaw === "INACTIVE" ? "INACTIVE" : "ACTIVE";

  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!existing) redirect("/arbeitgeber/dashboard/kunden?error=not-found");

  await assertCanManageCustomers(existing.companyId);

  await prisma.customer.update({ where: { id: customerId }, data: { status } });

  revalidatePath("/arbeitgeber/dashboard/kunden");
  revalidatePath(`/arbeitgeber/dashboard/kunden/${customerId}`);
  revalidatePath("/arbeitgeber/dashboard");
  redirect(`/arbeitgeber/dashboard/kunden/${customerId}`);
}

export async function createCustomerContact(formData: FormData) {
  const customerId = trimmed(formData.get("customerId"));
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) redirect("/arbeitgeber/dashboard/kunden?error=not-found");

  await assertCanManageCustomers(customer.companyId);

  const newContactPath = `/arbeitgeber/dashboard/kunden/${customerId}/kontakt/neu`;
  const firstName = optionalField(formData.get("firstName"))?.slice(0, MAX_SHORT) ?? null;
  const lastName = optionalField(formData.get("lastName"))?.slice(0, MAX_SHORT) ?? null;
  if (!firstName && !lastName) redirect(`${newContactPath}?error=contact-name-missing`);

  const emailRaw = trimmed(formData.get("email"));
  if (emailRaw && !isValidEmail(emailRaw)) redirect(`${newContactPath}?error=invalid-email`);

  const position = optionalField(formData.get("position"))?.slice(0, MAX_SHORT) ?? null;
  const phone = optionalField(formData.get("phone"))?.slice(0, MAX_SHORT) ?? null;
  const isPrimary = trimmed(formData.get("isPrimary")) === "on";

  await prisma.$transaction(async (tx) => {
    // Hauptansprechpartner-Regel (Punkt 28): maximal EIN Primary je Kunde,
    // serverseitig innerhalb derselben Transaktion abgesichert.
    if (isPrimary) {
      await tx.customerContact.updateMany({ where: { customerId, isPrimary: true }, data: { isPrimary: false } });
    }
    await tx.customerContact.create({
      data: { customerId, firstName, lastName, position, email: emailRaw || null, phone, isPrimary },
    });
  });

  revalidatePath(`/arbeitgeber/dashboard/kunden/${customerId}`);
  redirect(`/arbeitgeber/dashboard/kunden/${customerId}`);
}

export async function updateCustomerContact(formData: FormData) {
  const contactId = trimmed(formData.get("contactId"));
  const contact = await prisma.customerContact.findUnique({ where: { id: contactId }, include: { customer: true } });
  if (!contact) redirect("/arbeitgeber/dashboard/kunden?error=not-found");

  await assertCanManageCustomers(contact.customer.companyId);

  const customerId = contact.customerId;
  const editPath = `/arbeitgeber/dashboard/kunden/${customerId}/kontakt/${contactId}/bearbeiten`;
  const firstName = optionalField(formData.get("firstName"))?.slice(0, MAX_SHORT) ?? null;
  const lastName = optionalField(formData.get("lastName"))?.slice(0, MAX_SHORT) ?? null;
  if (!firstName && !lastName) redirect(`${editPath}?error=contact-name-missing`);

  const emailRaw = trimmed(formData.get("email"));
  if (emailRaw && !isValidEmail(emailRaw)) redirect(`${editPath}?error=invalid-email`);

  const position = optionalField(formData.get("position"))?.slice(0, MAX_SHORT) ?? null;
  const phone = optionalField(formData.get("phone"))?.slice(0, MAX_SHORT) ?? null;
  const isPrimary = trimmed(formData.get("isPrimary")) === "on";

  await prisma.$transaction(async (tx) => {
    if (isPrimary) {
      await tx.customerContact.updateMany({
        where: { customerId, isPrimary: true, id: { not: contactId } },
        data: { isPrimary: false },
      });
    }
    await tx.customerContact.update({
      where: { id: contactId },
      data: { firstName, lastName, position, email: emailRaw || null, phone, isPrimary },
    });
  });

  revalidatePath(`/arbeitgeber/dashboard/kunden/${customerId}`);
  redirect(`/arbeitgeber/dashboard/kunden/${customerId}`);
}

// Entfernen ist in Phase 6.1 erlaubt (Punkt 29) - ein Kunde darf auch 0
// Hauptansprechpartner haben, es wird kein Ersatz-Primary bestimmt.
export async function deleteCustomerContact(formData: FormData) {
  const contactId = trimmed(formData.get("contactId"));
  const contact = await prisma.customerContact.findUnique({ where: { id: contactId }, include: { customer: true } });
  if (!contact) redirect("/arbeitgeber/dashboard/kunden?error=not-found");

  await assertCanManageCustomers(contact.customer.companyId);

  const customerId = contact.customerId;
  await prisma.customerContact.delete({ where: { id: contactId } });

  revalidatePath(`/arbeitgeber/dashboard/kunden/${customerId}`);
  redirect(`/arbeitgeber/dashboard/kunden/${customerId}`);
}
