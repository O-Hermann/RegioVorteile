"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href?: string;
};

const NAV: NavItem[] = [
  { label: "Übersicht", href: "/admin/dashboard" },
  { label: "Unternehmen", href: "/admin/unternehmen" },
  { label: "Datenimporte", href: "/admin/datenimporte" },
  { label: "Analysen" },
  { label: "Benutzer", href: "/admin/benutzer" },
  { label: "Pilotkunden", href: "/admin/kontaktanfragen" },
  { label: "Support", href: "/admin/feedback" },
  { label: "Einstellungen", href: "/admin/rechtliches" },
];

function NavLink({ item, mobile, active }: { item: NavItem; mobile?: boolean; active: boolean }) {
  if (!item.href) {
    return (
      <span
        className={`${mobile ? "whitespace-nowrap" : ""} inline-flex items-center gap-1 px-3 py-2 text-sand-400 dark:text-cockpit-text-weak cursor-default`}
        title="Noch nicht verfügbar"
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${mobile ? "whitespace-nowrap " : ""}rounded-full px-4 py-2 transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-ink-50 to-ink-100/60 text-ink-700 dark:from-cockpit-accent-subtle dark:to-cockpit-accent-subtle/40 dark:text-cockpit-accent-light border border-ink-200 dark:border-cockpit-accent-light/30 shadow-[0_0_14px_-4px_rgba(8,122,120,0.35)] dark:shadow-[0_0_16px_-3px_rgba(30,151,148,0.4)]"
          : "border border-transparent text-sand-700 hover:text-sand-900 hover:bg-sand-100 dark:text-cockpit-text-secondary dark:hover:text-cockpit-heading dark:hover:bg-white/5"
      }`}
    >
      {item.label}
    </Link>
  );
}

export function AdminNav({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {NAV.map((item) => (
        <NavLink
          key={item.label}
          item={item}
          mobile={mobile}
          active={!!item.href && pathname.startsWith(item.href)}
        />
      ))}
    </>
  );
}
