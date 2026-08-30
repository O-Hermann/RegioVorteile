"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { requireCompanyMember, hashPassword, verifyPassword } from "@/lib/auth";
import { verifyTotpCode, generateBackupCodes } from "@/lib/totp";

const SETTINGS_PATH = "/arbeitgeber/dashboard/einstellungen";

// MVP-Roadmap Phase 7-Erweiterung, 2FA (siehe [[effivo_mvp_roadmap]]):
// Login-Zeit-Verifizierung - Gegenstueck zur pendingTwoFactorUserId-
// Zwischenstufe in loginEmployer()/login() (actions/auth.ts). Nimmt
// entweder einen 6-stelligen TOTP-Code ODER einen Wiederherstellungscode
// entgegen (ein Formularfeld fuer beides, siehe login-form Komponente).
export async function verifyTwoFactorLogin(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const next = String(formData.get("next") ?? "");
  const safeNext = next.startsWith("/einladung/") ? next : null;

  const session = await getSession();
  const pendingUserId = session.pendingTwoFactorUserId;
  if (!pendingUserId) {
    redirect("/arbeitgeber/login");
  }

  const user = await prisma.user.findUnique({ where: { id: pendingUserId } });
  if (!user || !user.totpEnabled || !user.totpSecret) {
    session.destroy();
    redirect("/arbeitgeber/login");
  }

  const isValidTotp = /^\d{6}$/.test(code) && verifyTotpCode(user.totpSecret, code);
  const matchedBackupCode = isValidTotp ? null : await findMatchingBackupCode(user.totpBackupCodes, code);

  if (!isValidTotp && !matchedBackupCode) {
    redirect("/arbeitgeber/login/2fa?error=1");
  }

  const membership = await prisma.companyMembership.findFirst({
    where: { userId: user.id, status: "ACTIVE", company: { status: "ACTIVE" } },
    orderBy: { activatedAt: "asc" },
  });
  if (!membership) {
    session.destroy();
    redirect("/arbeitgeber/login?error=pending");
  }

  const remember = session.pendingTwoFactorRemember ?? true;
  const finalSession = await getSession({ persistent: remember });
  finalSession.userId = user.id;
  finalSession.selectedCompanyId = membership.companyId;
  finalSession.pendingTwoFactorUserId = undefined;
  finalSession.pendingTwoFactorRemember = undefined;
  await finalSession.save();

  const updates: Promise<unknown>[] = [prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })];
  // Ein verbrauchter Wiederherstellungscode ist danach ungueltig (Einmal-
  // Verwendung, wie bei den Einladungs-/Passwort-Reset-Tokens im Projekt).
  if (matchedBackupCode) {
    updates.push(
      prisma.user.update({
        where: { id: user.id },
        data: { totpBackupCodes: user.totpBackupCodes.filter((h) => h !== matchedBackupCode) },
      }),
    );
  }
  await Promise.all(updates);

  redirect(safeNext ?? "/arbeitgeber/dashboard");
}

async function findMatchingBackupCode(hashedCodes: string[], candidate: string): Promise<string | null> {
  if (!candidate) return null;
  for (const hash of hashedCodes) {
    if (await verifyPassword(candidate, hash)) return hash;
  }
  return null;
}

// --- Einrichtung/Verwaltung ueber die Einstellungen-Seite -----------------

export type TwoFactorSetupResult = { status: "ok"; backupCodes: string[] } | { status: "error"; message: string };

// Nimmt das waehrend der Einrichtung im Browser generierte Secret entgegen
// (siehe two-factor-setup.tsx - wird als Server Component gerendert und pro
// Seitenaufruf frisch erzeugt, siehe einstellungen/page.tsx) und schaltet es
// erst nach einem gueltigen Bestaetigungscode scharf. So landet nie ein
// nie-verifiziertes Secret als "aktiv" in der DB.
export async function confirmTwoFactorSetup(secret: string, code: string): Promise<TwoFactorSetupResult> {
  const { user } = await requireCompanyMember();

  if (!verifyTotpCode(secret, code)) {
    return { status: "error", message: "Der Code ist nicht korrekt. Bitte erneut versuchen." };
  }

  const backupCodes = generateBackupCodes();
  const hashedCodes = await Promise.all(backupCodes.map((c) => hashPassword(c)));

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: secret, totpEnabled: true, totpBackupCodes: hashedCodes },
  });

  revalidatePath(SETTINGS_PATH);
  return { status: "ok", backupCodes };
}

export type DisableTwoFactorResult = { status: "ok" } | { status: "error"; message: string };

// Bewusst eine typisierte Aktion statt redirect()-basiert (wie
// changeOwnPassword) - eine Server Action loest nach Abschluss IMMER eine
// Aktualisierung der aktuellen Route aus, was die aufrufende Client-
// Komponente unmounten wuerde, wenn deren Sichtbarkeit vom Server aus
// (user.totpEnabled) gesteuert waere. Der Aufrufer (TwoFactorSection) haelt
// den Aktiviert/Deaktiviert-Zustand daher rein lokal, siehe Kommentar dort.
export async function disableTwoFactor(currentPassword: string): Promise<DisableTwoFactorResult> {
  const { user } = await requireCompanyMember();

  if (!user.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return { status: "error", message: "Das aktuelle Passwort ist nicht korrekt." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: false, totpSecret: null, totpBackupCodes: [] },
  });

  return { status: "ok" };
}

export type RegenerateBackupCodesResult = { status: "ok"; backupCodes: string[] } | { status: "error"; message: string };

// Alte Codes werden vollstaendig ersetzt (nicht ergaenzt) - verhindert, dass
// ein einmal kompromittierter alter Code weiterhin gueltig bleibt.
export async function regenerateBackupCodes(currentPassword: string): Promise<RegenerateBackupCodesResult> {
  const { user } = await requireCompanyMember();

  if (!user.totpEnabled) {
    return { status: "error", message: "Zwei-Faktor-Authentifizierung ist nicht aktiviert." };
  }
  if (!user.passwordHash || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return { status: "error", message: "Das aktuelle Passwort ist nicht korrekt." };
  }

  const backupCodes = generateBackupCodes();
  const hashedCodes = await Promise.all(backupCodes.map((c) => hashPassword(c)));
  await prisma.user.update({ where: { id: user.id }, data: { totpBackupCodes: hashedCodes } });

  revalidatePath(SETTINGS_PATH);
  return { status: "ok", backupCodes };
}
