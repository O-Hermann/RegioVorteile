import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-card-border bg-card/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-sand-900">
          Regio<span className="text-gold-600">vorteile</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-sand-700">
          <Link href="/#arbeitgeber" className="hover:text-sand-900">
            Für Arbeitgeber
          </Link>
          <Link href="/#partnerbetriebe" className="hover:text-sand-900">
            Für Partnerbetriebe
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-sand-700 hover:text-sand-900 px-3 py-2"
          >
            Login
          </Link>
          <Link
            href="/arbeitgeber/registrieren"
            className="group inline-flex items-center gap-1.5 rounded-full bg-ink-600 px-4 py-2 text-sm font-semibold text-white shadow-warm-sm hover:bg-ink-700 hover:shadow-warm transition-all"
          >
            Jetzt starten
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
