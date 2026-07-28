import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/admin/dashboard", label: "Übersicht" },
  { href: "/admin/regionen", label: "Regionen" },
  { href: "/admin/partnerbetriebe", label: "Partnerbetriebe" },
  { href: "/admin/arbeitgeber", label: "Arbeitgeber" },
  { href: "/admin/partneranfragen", label: "Partneranfragen" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/rechtliches", label: "Rechtliches" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-card-border bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/admin/dashboard" className="font-display text-lg font-semibold text-sand-900">
            Regiovorteile <span className="text-sand-500 font-sans text-sm font-normal">Admin</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-sm font-medium text-sand-700">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-sand-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={logout}>
              <button className="text-sm font-medium text-sand-500 hover:text-sand-900">
                Abmelden
              </button>
            </form>
          </div>
        </div>
        <nav className="sm:hidden flex gap-4 overflow-x-auto px-4 pb-3 text-sm font-medium text-sand-700">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-sand-900">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 w-full px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
