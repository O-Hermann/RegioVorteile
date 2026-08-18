import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { LandingThemeToggle } from "@/components/landing-theme-toggle";
import { LandingNav } from "@/components/landing-nav";
import { SITE_NAME } from "@/lib/site-config";

export function LandingHeader() {
  return (
    <header className="border-b border-landing-border bg-landing-header-bg/85 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-tight text-landing-text-primary">
          {SITE_NAME}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-landing-text-secondary">
          <LandingNav />
        </nav>
        <div className="flex items-center gap-2">
          <LandingThemeToggle />
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-landing-text-secondary hover:text-landing-text-primary px-3 py-2 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/kontakt"
            className="group inline-flex items-center gap-1.5 rounded-full bg-landing-accent hover:bg-landing-accent-hover px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            Pilot anfragen
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
