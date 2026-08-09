import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { COMPANY_MANAGER_ROLES, COMPANY_IMPORT_UPLOAD_ROLES, CUSTOMER_MANAGE_ROLES } from "@/lib/company";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Prueft die Plattformrolle bei JEDEM Aufruf frisch aus der DB statt aus dem
// Session-Cookie zu vertrauen - wird einem Nutzer die Rolle entzogen, verliert
// er den Zugriff beim naechsten Seitenaufruf, nicht erst nach Session-Ablauf.
export async function requireAdmin() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ACTIVE" || !user.platformRole) {
    redirect("/login");
  }
  return session;
}

// Ermittelt fuer den Arbeitsbereich-Wechsler, welche Bereiche ein Nutzer
// oeffnen darf: seine Plattformrolle (falls vorhanden) und alle Unternehmen,
// in denen er eine aktive Mitgliedschaft hat.
export async function getWorkspaces(userId: string) {
  const [user, memberships] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.companyMembership.findMany({
      where: { userId, status: "ACTIVE", company: { status: "ACTIVE" } },
      include: { company: true },
      orderBy: { activatedAt: "asc" },
    }),
  ]);

  return {
    platformRole: user?.platformRole ?? null,
    companies: memberships.map((m) => ({ id: m.companyId, name: m.company.name, role: m.role })),
  };
}

// Ersetzt requireEmployer() als Einstiegspunkt fuer den Unternehmensbereich.
// Ermittelt die Ziel-Company (expliziter Parameter beim Arbeitsbereich-Wechsel,
// sonst die zuletzt gewaehlte, sonst die erste aktive Mitgliedschaft) und laedt
// die Mitgliedschaft IMMER frisch aus der DB - ein Nutzer kann so nie durch
// Manipulation einer companyId auf ein fremdes Unternehmen zugreifen.
export async function requireCompanyMember(companyId?: string) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/arbeitgeber/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ACTIVE") {
    redirect("/arbeitgeber/login");
  }

  const targetCompanyId = companyId ?? session.selectedCompanyId;

  const membership = await prisma.companyMembership.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
      company: { status: "ACTIVE" },
      ...(targetCompanyId ? { companyId: targetCompanyId } : {}),
    },
    include: { company: true },
    orderBy: { activatedAt: "asc" },
  });

  if (!membership) {
    redirect("/arbeitgeber/login");
  }

  // Hinweis: hier bewusst KEIN session.save() - diese Funktion wird aus
  // Server Components (Layout/Page) aufgerufen, in denen Next.js das Setzen
  // von Cookies verbietet. session.selectedCompanyId wird stattdessen beim
  // tatsaechlichen Wechsel (switchCompanyWorkspace, eine Server Action) oder
  // beim Login persistiert; bis dahin dient der hier ermittelte Wert nur der
  // aktuellen Anfrage.
  return { session, user, company: membership.company, membership };
}

// Autorisierungs-Check fuer alle Mutationen an einer Unternehmensmitgliedschaft
// (einladen, Rolle aendern, entfernen) - genutzt sowohl von den Company-eigenen
// Server Actions als auch vom Admin-Bereich. Redirectet bei fehlender
// Berechtigung (gleiches Muster wie requireAdmin/requireCompanyMember), statt
// nur die UI zu verstecken.
export async function assertCanManageCompany(companyId: string) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  if (user.platformRole === "SUPERADMIN" || user.platformRole === "PLATFORM_ADMIN") {
    return { session, user };
  }

  const membership = await prisma.companyMembership.findFirst({
    where: {
      userId: user.id,
      companyId,
      status: "ACTIVE",
      role: { in: COMPANY_MANAGER_ROLES },
    },
  });
  if (!membership) {
    redirect("/arbeitgeber/dashboard?error=forbidden");
  }
  return { session, user, membership };
}

// Autorisierungs-Check speziell fuer den Datenimport-Upload (Phase 3):
// Geschaeftsfuehrung und Betrachter duerfen die Importhistorie sehen, aber
// keine neuen Dateien hochladen. Wird von der Server Action UND von der
// Wizard-Seite genutzt, damit ein direkter Aufruf der Upload-Route serverseitig
// verweigert wird, nicht nur der Button in der UI versteckt ist.
export async function assertCanUploadDataImport(companyId: string) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/arbeitgeber/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ACTIVE") {
    redirect("/arbeitgeber/login");
  }

  const membership = await prisma.companyMembership.findFirst({
    where: {
      userId: user.id,
      companyId,
      status: "ACTIVE",
      company: { status: "ACTIVE" },
      role: { in: COMPANY_IMPORT_UPLOAD_ROLES },
    },
  });
  if (!membership) {
    redirect("/arbeitgeber/dashboard/datenimporte?error=forbidden");
  }
  return { session, user, membership };
}

// Autorisierungs-Check fuer alle Kunden-/Ansprechpartner-Mutationen (Phase
// 6.1, Punkt 7) - gleiches Muster wie assertCanUploadDataImport: companyId
// kommt IMMER aus einem bereits serverseitig geladenen Customer-Datensatz,
// nie direkt aus dem Formular vertraut, damit ein manipulierter Aufruf mit
// fremder companyId keinen Zugriff erhaelt. Lesen duerfen alle aktiven
// Mitglieder (siehe requireCompanyMember) - dieser Check gilt ausschliesslich
// fuer Schreibzugriffe.
export async function assertCanManageCustomers(companyId: string) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/arbeitgeber/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ACTIVE") {
    redirect("/arbeitgeber/login");
  }

  const membership = await prisma.companyMembership.findFirst({
    where: {
      userId: user.id,
      companyId,
      status: "ACTIVE",
      company: { status: "ACTIVE" },
      role: { in: CUSTOMER_MANAGE_ROLES },
    },
  });
  if (!membership) {
    redirect("/arbeitgeber/dashboard/kunden?error=forbidden");
  }
  return { session, user, membership };
}

export async function requireEmployer() {
  const session = await getSession();
  if (!session.userId || session.userRole !== "EMPLOYER") {
    redirect("/arbeitgeber/login");
  }
  const employer = await prisma.employer.findUnique({
    where: { userId: session.userId },
  });
  if (!employer) {
    redirect("/arbeitgeber/login");
  }
  if (!employer.approved) {
    session.destroy();
    redirect("/arbeitgeber/login?error=pending");
  }
  return { session, employer };
}

export async function requireEmployee() {
  const session = await getSession();
  if (!session.employeeId) {
    redirect("/mitarbeiter/login");
  }
  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    include: { employer: { include: { region: true } } },
  });
  if (!employee) {
    redirect("/mitarbeiter/login");
  }
  return { session, employee };
}
