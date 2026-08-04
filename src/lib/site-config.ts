export const SITE_NAME = "UnternehmensCockpit";

export const SITE_TAGLINE =
  "Die verständliche Unternehmensübersicht für kleine und mittlere Unternehmen.";

export const SITE_DESCRIPTION =
  "UnternehmensCockpit führt Ihre wichtigsten Unternehmenszahlen auf einer übersichtlichen Seite zusammen und zeigt verständlich, was sich seit dem letzten Monat verändert hat.";

export const CONTACT_EMAIL = "kontakt@unternehmenscockpit.de";

export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Funktionen", href: "/#funktionen" },
  { label: "So funktioniert es", href: "/#ablauf" },
  { label: "Preise", href: "/#preise" },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];
