import Link from "next/link";
import { requireEmployee } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function MitarbeiterLayout({ children }: { children: React.ReactNode }) {
  const { employee } = await requireEmployee();

  return (
    <div className="flex-1 flex flex-col bg-sand-50">
      <header className="border-b border-card-border bg-card sticky top-0 z-30">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between">
          <Link href="/mitarbeiter/vorteile" className="font-display text-lg font-semibold text-sand-900">
            Regiovorteile
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-sand-500 hidden sm:inline">{employee.name}</span>
            <Link href="/mitarbeiter/feedback" className="text-sm font-medium text-sand-600 hover:text-sand-900">
              Feedback
            </Link>
            <ThemeToggle />
            <form action={logout}>
              <button className="text-sm font-medium text-sand-500 hover:text-sand-900">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
