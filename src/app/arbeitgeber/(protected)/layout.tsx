import Link from "next/link";
import { requireCompanyMember, getWorkspaces } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmployerNav } from "@/components/employer-nav";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { SITE_NAME } from "@/lib/site-config";
import { LogOutIcon } from "@/components/icons";

export default async function ArbeitgeberLayout({ children }: { children: React.ReactNode }) {
  const { session, company } = await requireCompanyMember();
  const workspaces = await getWorkspaces(session.userId!);

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-card-border/70 dark:border-white/5 bg-card/90 dark:bg-cockpit-header/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1920px] px-8 h-16 flex items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/arbeitgeber/dashboard" className="flex min-w-0 items-center gap-3 shrink-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-500 to-ink-700 dark:from-cockpit-accent-light dark:to-cockpit-accent-dark font-display text-base font-bold text-white shadow-[0_0_16px_-3px_rgba(8,122,120,0.55)] dark:shadow-[0_0_18px_-3px_rgba(30,151,148,0.6)]">
                C
              </span>
              <span className="min-w-0 truncate font-display text-lg font-semibold tracking-tight text-sand-900">
                {SITE_NAME}{" "}
                <span className="hidden text-sand-500 font-sans text-sm font-normal sm:inline">
                  · {company.name}
                </span>
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
              <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-sand-500 hover:text-sand-900 hover:bg-sand-100 dark:hover:bg-white/5 transition-colors">
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-500"
        >
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-cockpit-accent/10 blur-[110px]" />
          <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-cockpit-accent-light/10 blur-[130px]" />
        </div>
        {children}
      </main>
    </div>
  );
}
