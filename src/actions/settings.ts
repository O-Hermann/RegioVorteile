"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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
