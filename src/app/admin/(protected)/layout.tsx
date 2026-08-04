import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminNav } from "@/components/admin-nav";
import { SITE_NAME } from "@/lib/site-config";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-card-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/admin/dashboard" className="font-display text-lg font-semibold text-sand-900 shrink-0">
            {SITE_NAME} <span className="text-sand-500 font-sans text-sm font-normal">Admin</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <AdminNav />
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <form action={logout}>
              <button className="text-sm font-medium text-sand-500 hover:text-sand-900">
                Abmelden
              </button>
            </form>
          </div>
        </div>
        <nav className="lg:hidden flex gap-4 overflow-x-auto px-4 pb-3 text-sm font-medium">
          <AdminNav mobile />
        </nav>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
