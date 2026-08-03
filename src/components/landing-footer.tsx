import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, CONTACT_EMAIL, NAV_ITEMS, FOOTER_LINKS } from "@/lib/site-config";

export function LandingFooter() {
  return (
    <footer className="mt-auto border-t border-card-border bg-sand-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-display text-lg font-semibold text-sand-900">{SITE_NAME}</p>
          <p className="mt-2 text-sand-600">{SITE_TAGLINE}</p>
        </div>
        <div>
          <p className="font-semibold text-sand-800 mb-2">Produkt</p>
          <ul className="space-y-1 text-sand-600">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-sand-900">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sand-800 mb-2">Kontakt</p>
          <p className="text-sand-600">
            Fragen zur Pilotphase?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-petrol-700 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2">
            <Link href="/login" className="text-sand-600 hover:text-sand-900">
              Login
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-card-border py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-xs text-sand-500">
        <span>© {new Date().getFullYear()} {SITE_NAME}</span>
        {FOOTER_LINKS.map((link) => (
          <span key={link.href} className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline">·</span>
            <Link href={link.href} className="hover:text-sand-800">
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  );
}
