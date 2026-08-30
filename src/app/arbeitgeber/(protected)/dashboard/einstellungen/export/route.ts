import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { COMPANY_ROLE_LABELS, MEMBERSHIP_STATUS_LABELS } from "@/lib/company";

// MVP-Roadmap Phase 7-Erweiterung (siehe [[effivo_mvp_roadmap]]): Export nur
// der PERSOENLICHEN Kontodaten des eingeloggten Nutzers (per Nachfrage
// bewusst begrenzt, NICHT die geschaeftlichen Firmendaten) - Route Handler
// statt Server Action, da ein echter Datei-Download (Content-Disposition)
// gebraucht wird. Route Handler liegen NICHT hinter dem (protected)-Layout
// (das wrappt nur gerenderte Seiten, keine route.ts-Handler), daher hier
// eine eigene, minimale Auth-Pruefung statt requireCompanyMember() (das bei
// fehlendem Zugriff einen React-Redirect ausloest, der fuer einen reinen
// Request/Response-Handler nicht das richtige Werkzeug ist).
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.redirect(new URL("/arbeitgeber/login", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { memberships: { include: { company: true } } },
  });
  if (!user) {
    return NextResponse.redirect(new URL("/arbeitgeber/login", request.url));
  }

  // Bewusst NICHT enthalten: passwordHash, totpSecret, totpBackupCodes -
  // selbst als Hash/gehashtes Bearer-Credential gehoeren diese nicht in eine
  // herunterladbare Datei, die z.B. per E-Mail weitergeleitet werden koennte.
  const exportData = {
    exportedAt: new Date().toISOString(),
    account: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      zweiFaktorAuthentifizierungAktiv: user.totpEnabled,
    },
    unternehmensmitgliedschaften: user.memberships.map((m) => ({
      unternehmen: m.company.name,
      rolle: COMPANY_ROLE_LABELS[m.role],
      status: MEMBERSHIP_STATUS_LABELS[m.status],
      eingeladenAm: m.invitedAt,
      aktiviertAm: m.activatedAt,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="effivo-meine-daten.json"',
    },
  });
}
