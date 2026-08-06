import type { CompanyRole, PlatformRole, MembershipStatus } from "@/generated/prisma/client";

export const COMPANY_ROLE_LABELS: Record<CompanyRole, string> = {
  OWNER: "Inhaber",
  COMPANY_ADMIN: "Unternehmensadmin",
  ACCOUNTING: "Buchhaltung",
  MANAGEMENT: "Geschäftsführung",
  VIEWER: "Betrachter",
};

// Sichtbare Bezeichnung fuer SUPERADMIN ist "Administrator" - der interne
// Enum-Wert und alle Berechtigungsprüfungen bleiben unveraendert, nur diese
// Anzeige-Map aendert sich.
export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  SUPERADMIN: "Administrator",
  PLATFORM_ADMIN: "Plattformadmin",
  SUPPORT: "Support",
};

// Rollen, die ein Unternehmen verwalten duerfen (Mitglieder einladen/entfernen,
// Rollen aendern) - genutzt von assertCanManageCompany().
export const COMPANY_MANAGER_ROLES: CompanyRole[] = ["OWNER", "COMPANY_ADMIN"];

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  INVITED: "Eingeladen",
  ACTIVE: "Aktiv",
  DISABLED: "Deaktiviert",
};

export function membershipStatusBadgeClass(status: MembershipStatus) {
  if (status === "ACTIVE") return "bg-ink-100 text-ink-800";
  if (status === "INVITED") return "bg-gold-100 text-gold-700";
  return "bg-sand-200 text-sand-700";
}

export const INVITE_ERROR_MESSAGES: Record<string, string> = {
  missing: "Bitte alle Pflichtfelder ausfüllen.",
  "already-member": "Dieser Benutzer ist bereits Mitglied dieses Unternehmens.",
  "last-owner": "Der letzte Inhaber eines Unternehmens kann nicht entfernt oder herabgestuft werden. Legen Sie zuerst einen neuen Inhaber fest.",
  "not-found": "Eintrag wurde nicht gefunden.",
  forbidden: "Keine Berechtigung für diese Aktion.",
  "last-superadmin": "Der letzte aktive Administrator kann nicht deaktiviert oder herabgestuft werden.",
};
