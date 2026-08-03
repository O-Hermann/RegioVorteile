export const SITE_NAME = "Controlling Cockpit";

export const SITE_TAGLINE =
  "Verständliches Controlling für Unternehmen ohne eigenen Controller";

export const SITE_DESCRIPTION =
  "Controlling Cockpit erklärt Ihre Zahlen aus DATEV-Excel-Exporten in klarer Sprache: Umsatz, Kosten, Marge, Liquidität und was jetzt zu tun ist.";

export const CONTACT_EMAIL = "kontakt@controlling-cockpit.de";

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
