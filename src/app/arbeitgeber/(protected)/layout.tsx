import Link from "next/link";
import { requireCompanyMember, getWorkspaces } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmployerNav } from "@/components/employer-nav";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { SITE_NAME } from "@/lib/site-config";
import { LogOutIcon } from "@/components/icons";
import { dashFontScopeClass } from "@/components/dashboard/dash-ui";

// Goldstandard-Rollout Phase 2 (2026-08-30, siehe [[effivo_mvp_roadmap]]):
// "dashFontScopeClass" hier auf dem Wurzel-Element statt nur auf der
// Uebersicht-Seite - dadurch erben ALLE Arbeitgeber-Seiten (auch noch nicht
// einzeln umgestellte) sofort die Inter-Typografie + h1-h4-Ueberschreibung
// aus globals.css. Bewusst NUR hier (arbeitgeber-Layout), nicht im
// Admin-/Mitarbeiter-Layout - beide bleiben unveraendert im alten
// App-Standard-Look (siehe eigener Kommentar in dash-ui.ts).
export default async function ArbeitgeberLayout({ children }: { children: React.ReactNode }) {
  const { session, company } = await requireCompanyMember();
  const workspaces = await getWorkspaces(session.userId!);

  return (
    <div className={`flex-1 flex flex-col bg-dash-bg ${dashFontScopeClass}`}>
      <header className="sticky top-0 z-20 border-b border-dash-line bg-dash-panel/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1920px] px-8 h-16 flex items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/arbeitgeber/dashboard" className="flex min-w-0 items-center gap-3 shrink-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dash-gold-deep to-dash-gold text-base font-bold text-dash-panel shadow-[0_0_16px_-3px_rgba(226,188,107,0.45)]">
                C
              </span>
              <span className="min-w-0 truncate text-lg font-semibold tracking-tight text-dash-text">
                {SITE_NAME}
              </span>
            </Link>
            <div className="hidden md:block">
              <WorkspaceSwitcher
                companies={workspaces.companies}
                hasPlatformAccess={!!workspaces.platformRole}
                activeCompanyId={company.id}
                isAdminContext={false}
              />
            </div>
          </div>
          <nav className="hidden min-[1360px]:flex items-center gap-1.5 text-[15px] font-medium">
            <EmployerNav />
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <form action={logout}>
              <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-dash-text-muted hover:text-dash-text hover:bg-dash-panel-soft transition-colors">
                <LogOutIcon className="h-4 w-4" />
                Abmelden
              </button>
            </form>
          </div>
        </div>
        <nav className="min-[1360px]:hidden flex gap-4 overflow-x-auto px-4 pb-3 text-sm font-medium">
          <EmployerNav mobile />
        </nav>
      </header>
      <main className="relative flex-1 w-full max-w-[1920px] mx-auto px-8 py-4">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-dash-gold/[0.06] blur-[110px]" />
          <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-dash-status-active/[0.05] blur-[130px]" />
        </div>
        {children}
      </main>
    </div>
  );
}
