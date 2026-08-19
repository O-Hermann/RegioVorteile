import Link from "next/link";
import { SectionNavLink } from "@/components/landing/section-nav-link";
import { SITE_NAME, SITE_TAGLINE, CONTACT_EMAIL, NAV_ITEMS, FOOTER_LINKS } from "@/lib/site-config";

export function LandingFooter() {
  return (
    <footer className="mt-auto border-t border-landing-border bg-landing-header-bg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-display text-lg font-semibold text-landing-text-primary">{SITE_NAME}</p>
          <p className="mt-2 max-w-xs text-landing-text-secondary">{SITE_TAGLINE}</p>
        </div>
        <div>
          <p className="font-semibold text-landing-text-primary mb-3">Produkt</p>
          <ul className="space-y-2 text-landing-text-secondary">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <SectionNavLink href={item.href} className="hover:text-landing-text-primary transition-colors">
                  {item.label}
                </SectionNavLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-landing-text-primary mb-3">Kontakt</p>
          <p className="text-landing-text-secondary">
            Fragen?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-landing-accent-light hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2">
            <Link href="/login" className="text-landing-text-secondary hover:text-landing-text-primary transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-landing-border py-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-xs text-landing-text-muted">
        <span>© {new Date().getFullYear()} {SITE_NAME}</span>
        {FOOTER_LINKS.map((link) => (
          <span key={link.href} className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline">·</span>
            <Link href={link.href} className="hover:text-landing-text-secondary transition-colors">
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  );
}
