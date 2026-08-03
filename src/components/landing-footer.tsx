import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, CONTACT_EMAIL, NAV_ITEMS, FOOTER_LINKS } from "@/lib/site-config";

export function LandingFooter() {
  return (
    <footer className="mt-auto border-t border-petrol-100 dark:border-cockpit-border bg-petrol-50 dark:bg-cockpit-header">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-display text-lg font-semibold text-slate-900 dark:text-cockpit-heading">{SITE_NAME}</p>
          <p className="mt-2 text-slate-600 dark:text-cockpit-text-secondary">{SITE_TAGLINE}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-cockpit-text mb-2">Produkt</p>
          <ul className="space-y-1 text-slate-600 dark:text-cockpit-text-secondary">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-slate-900 dark:hover:text-cockpit-heading">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-cockpit-text mb-2">Kontakt</p>
          <p className="text-slate-600 dark:text-cockpit-text-secondary">
            Fragen zur Pilotphase?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-petrol-800 dark:text-cockpit-accent-light hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2">
            <Link href="/login" className="text-slate-600 dark:text-cockpit-text-secondary hover:text-slate-900 dark:hover:text-cockpit-heading">
              Login
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-cockpit-border py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-xs text-slate-500 dark:text-cockpit-text-weak">
        <span>© {new Date().getFullYear()} {SITE_NAME}</span>
        {FOOTER_LINKS.map((link) => (
          <span key={link.href} className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline">·</span>
            <Link href={link.href} className="hover:text-slate-800 dark:hover:text-cockpit-text">
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  );
}
