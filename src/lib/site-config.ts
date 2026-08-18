export const SITE_NAME = "Effivo";

export const SITE_TAGLINE =
  "Die verständliche Unternehmensübersicht für kleine und mittlere Unternehmen.";

export const SITE_DESCRIPTION = `${SITE_NAME} führt Ihre wichtigsten Unternehmenszahlen auf einer übersichtlichen Seite zusammen und zeigt verständlich, was sich seit dem letzten Monat verändert hat.`;

export const CONTACT_EMAIL = "kontakt@effivo.de";

export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Was Effivo findet", href: "/#geldlecks" },
  { label: "So funktioniert es", href: "/#ablauf" },
  { label: "Sicherheit", href: "/#sicherheit" },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];
