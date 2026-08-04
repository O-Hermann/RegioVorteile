"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href?: string;
};

const NAV: NavItem[] = [
  { label: "Übersicht", href: "/admin/dashboard" },
  { label: "Unternehmen", href: "/admin/arbeitgeber" },
  { label: "Datenimporte" },
  { label: "Analysen" },
  { label: "Benutzer" },
  { label: "Pilotkunden", href: "/admin/kontaktanfragen" },
  { label: "Support", href: "/admin/feedback" },
  { label: "Einstellungen", href: "/admin/rechtliches" },
];

function NavLink({ item, mobile, active }: { item: NavItem; mobile?: boolean; active: boolean }) {
  if (!item.href) {
    return (
      <span
        className={`${mobile ? "whitespace-nowrap" : ""} inline-flex items-center gap-1 text-sand-400 dark:text-cockpit-text-weak cursor-default`}
        title="Noch nicht verfügbar"
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${mobile ? "whitespace-nowrap " : ""}rounded-lg px-2.5 py-1.5 transition-colors ${
        active
          ? "bg-ink-50 text-ink-700 dark:bg-cockpit-accent-subtle dark:text-cockpit-accent-light border border-ink-200 dark:border-cockpit-accent/40"
          : "border border-transparent text-sand-700 hover:text-sand-900 dark:text-cockpit-text-secondary dark:hover:text-cockpit-heading"
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
