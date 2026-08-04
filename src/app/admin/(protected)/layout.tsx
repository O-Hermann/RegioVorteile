import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminNav } from "@/components/admin-nav";
import { SITE_NAME } from "@/lib/site-config";
import { LogOutIcon } from "@/components/icons";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-card-border bg-card">
        <div className="mx-auto max-w-[1920px] px-8 h-20 flex items-center justify-between gap-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-600 dark:bg-cockpit-accent font-display text-base font-bold text-white">
              C
            </span>
            <span className="font-display text-lg font-semibold text-sand-900">
              {SITE_NAME} <span className="text-sand-500 font-sans text-sm font-normal">Admin</span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-2 text-[15px] font-medium">
            <AdminNav />
          </nav>
          <div className="flex items-center gap-4 shrink-0">
            <ThemeToggle />
            <form action={logout}>
              <button className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-500 hover:text-sand-900">
                <LogOutIcon className="h-4 w-4" />
                Abmelden
              </button>
            </form>
          </div>
        </div>
        <nav className="lg:hidden flex gap-4 overflow-x-auto px-4 pb-3 text-sm font-medium">
          <AdminNav mobile />
        </nav>
      </header>
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-8 py-8">{children}</main>
    </div>
  );
}
