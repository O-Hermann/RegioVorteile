"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { assertCanManageCompany, requireCompanyMember, hashPassword, verifyPassword } from "@/lib/auth";

const SETTINGS_PATH = "/arbeitgeber/dashboard/einstellungen";

function trimmedOrNull(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

// MVP-Roadmap Phase 7 (siehe [[effivo_mvp_roadmap]]): Firmenprofil-Speicherung,
// gleiche Berechtigungspruefung wie die Benutzer-Verwaltung
// (assertCanManageCompany - OWNER/COMPANY_ADMIN). companyId kommt aus dem
// Formular, wird aber serverseitig gegen die tatsaechliche Mitgliedschaft des
// anfragenden Nutzers geprueft (assertCanManageCompany redirectet sonst),
// nie blind vertraut.
export async function updateCompanyProfile(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  await assertCanManageCompany(companyId);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect(`${SETTINGS_PATH}?tab=firma&error=missing`);
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      name,
      contactName: trimmedOrNull(formData, "contactName"),
      contactEmail: trimmedOrNull(formData, "contactEmail"),
      contactPhone: trimmedOrNull(formData, "contactPhone"),
      street: trimmedOrNull(formData, "street"),
      zipCode: trimmedOrNull(formData, "zipCode"),
      city: trimmedOrNull(formData, "city"),
    },
  });

  revalidatePath(SETTINGS_PATH);
  redirect(`${SETTINGS_PATH}?tab=firma&saved=1`);
}

// Reine Praeferenzen, KEIN Versand - siehe Kommentar am NotificationPreference-
// Modell in schema.prisma fuer die explizite Nutzer-Entscheidung dahinter.
export async function updateNotificationPreference(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  await assertCanManageCompany(companyId);

  const data = {
    email: trimmedOrNull(formData, "email"),
    notifyDuplicatePayment: formData.get("notifyDuplicatePayment") === "on",
    notifyMissedDiscount: formData.get("notifyMissedDiscount") === "on",
    notifyOpenCreditNote: formData.get("notifyOpenCreditNote") === "on",
    notifyOverpayment: formData.get("notifyOverpayment") === "on",
  };

  await prisma.notificationPreference.upsert({
    where: { companyId },
    create: { companyId, ...data },
    update: data,
  });

  revalidatePath(SETTINGS_PATH);
  redirect(`${SETTINGS_PATH}?tab=benachrichtigungen&saved=1`);
}

// Passwort-Aenderung fuer den EINGELOGGTEN Nutzer selbst (im Unterschied zu
// actions/password-reset.ts, das einen Token-basierten "Passwort vergessen"-
// Ablauf ohne bekanntes altes Passwort abbildet) - verlangt daher zusaetzlich
// das aktuelle Passwort zur Bestaetigung.
export async function changeOwnPassword(formData: FormData) {
  const { user } = await requireCompanyMember();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!user.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
    redirect(`${SETTINGS_PATH}?tab=konto&error=wrong-current`);
  }
  if (password.length < 8 || password !== passwordConfirm) {
    redirect(`${SETTINGS_PATH}?tab=konto&error=invalid-new`);
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
  redirect(`${SETTINGS_PATH}?tab=konto&saved=1`);
}

// MVP-Roadmap Phase 7-Erweiterung (siehe [[effivo_mvp_roadmap]]): Konto-
// Loeschung, per Nachfrage bewusst auf "meinen eigenen Zugang" begrenzt (NICHT
// die Firma/ihre Daten) - entfernt alle Mitgliedschaften des Nutzers und
// deaktiviert das Login (status=DISABLED, passwordHash=null, 2FA geloescht).
// Der User-Datensatz selbst bleibt bestehen (kein Hard-Delete): mehrere
// Pflichtfelder anderer Tabellen (DataImport.uploadedByUserId,
// Customer.createdByUserId, Order.createdByUserId, ...) verweisen ohne
// Kaskade auf User.id - ein Hard-Delete wuerde entweder an einer FK-
// Verletzung scheitern (bei bereits vorhandener Aktivitaet) oder die
// Nachvollziehbarkeit "wer hat diesen Import/Kunden angelegt" fuer die
// verbleibenden Firmenmitglieder zerstoeren. Gleiches Prinzip wie das
// bestehende removeMembership() in actions/company.ts, hier nur
// selbstbedient (kein Admin/Owner noetig) und ueber ALLE Mitgliedschaften
// des Nutzers hinweg statt nur einer.
export async function deleteOwnAccount(formData: FormData) {
  const { user } = await requireCompanyMember();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!user.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
    redirect(`${SETTINGS_PATH}?tab=konto&error=wrong-current`);
  }

  // Fuer jede Firma, in der der Nutzer aktiver Inhaber ist: mindestens ein
  // weiterer aktiver Inhaber muss uebrig bleiben (gleiche Regel wie
  // removeMembership()/changeMembershipRole() in actions/company.ts, hier
  // aber ueber ALLE Firmen des Nutzers gepruft, nicht nur eine).
  const activeOwnerMemberships = await prisma.companyMembership.findMany({
    where: { userId: user.id, role: "OWNER", status: "ACTIVE" },
    include: { company: true },
  });
  for (const membership of activeOwnerMemberships) {
    const otherOwners = await prisma.companyMembership.count({
      where: { companyId: membership.companyId, role: "OWNER", status: "ACTIVE", userId: { not: user.id } },
    });
    if (otherOwners === 0) {
      redirect(`${SETTINGS_PATH}?tab=konto&error=last-owner-self`);
    }
  }

  await prisma.$transaction([
    prisma.companyMembership.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({
      where: { id: user.id },
      data: { status: "DISABLED", passwordHash: null, totpEnabled: false, totpSecret: null, totpBackupCodes: [] },
    }),
  ]);

  const session = await getSession();
  session.destroy();

  redirect("/arbeitgeber/login?deleted=1");
}
