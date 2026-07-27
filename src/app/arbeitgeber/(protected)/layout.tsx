import Link from "next/link";
import { requireEmployer } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/arbeitgeber/dashboard", label: "Übersicht" },
  { href: "/arbeitgeber/dashboard/mitarbeiter", label: "Mitarbeitende" },
  { href: "/arbeitgeber/dashboard/feedback", label: "Feedback" },
];

export default async function ArbeitgeberLayout({ children }: { children: React.ReactNode }) {
  const { employer } = await requireEmployer();

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-card-border bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/arbeitgeber/dashboard" className="font-display text-lg font-semibold text-sand-900">
            Regiovorteile{" "}
            <span className="text-sand-500 font-sans text-sm font-normal">
              {employer.companyName}
            </span>
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
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10">{children}</main>
    </div>
  );
}
