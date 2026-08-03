import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { LandingThemeToggle } from "@/components/landing-theme-toggle";
import { SITE_NAME, NAV_ITEMS } from "@/lib/site-config";

export function LandingHeader() {
  return (
    <header className="border-b border-petrol-100 dark:border-cockpit-border bg-white/85 dark:bg-cockpit-header/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-cockpit-heading">
          {SITE_NAME}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-cockpit-text-secondary">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-slate-900 dark:hover:text-cockpit-heading">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LandingThemeToggle />
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-slate-600 dark:text-cockpit-text-secondary hover:text-slate-900 dark:hover:text-cockpit-heading px-3 py-2"
          >
            Login
          </Link>
          <a
            href="#preise"
            className="group inline-flex items-center gap-1.5 rounded-full bg-cockpit-accent hover:bg-cockpit-accent-hover px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            Pilotphase anfragen
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
