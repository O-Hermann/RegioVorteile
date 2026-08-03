import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME, NAV_ITEMS } from "@/lib/site-config";

export function LandingHeader() {
  return (
    <header className="border-b border-cyan-100 dark:border-white/10 bg-cyan-50/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {SITE_NAME}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-slate-900 dark:hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2"
          >
            Login
          </Link>
          <a
            href="#preise"
            className="group inline-flex items-center gap-1.5 rounded-full bg-blue-600 bg-gradient-to-br from-cyan-400 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_-8px_rgba(37,99,235,0.6)] hover:from-cyan-300 hover:to-blue-500 transition-all"
          >
            Pilotphase anfragen
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
