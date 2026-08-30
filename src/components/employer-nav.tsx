"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href?: string;
};

// Kunden/Aufträge (2026-08-29): bewusst aus der Navigation entfernt, nicht
// geloescht - beide Bereiche sind vollstaendig gebaute CRUD-Features, haengen
// aber mit dem Effivo-MVP-Kernablauf (Datenimport -> automatische
// Fund-Erkennung -> Fallpruefung, siehe [[effivo_mvp_roadmap]]) inhaltlich
// nicht zusammen - die Erkennung liest ausschliesslich importierte FINANCE-
// Zeilen, nie Kunden-/Auftrags-Datensaetze. Routen/Code/Datenmodell bleiben
// unveraendert bestehen, nur der einzige Navigationszugang (dieses Array) ist
// entfernt, damit kein Kunde ueber einen Link dorthin gelangt. Bei Bedarf
// spaeter einfach hier wieder eintragen, um sie zurueckzuholen.
const NAV: NavItem[] = [
  { label: "Übersicht", href: "/arbeitgeber/dashboard" },
  { label: "Datenimporte", href: "/arbeitgeber/dashboard/datenimporte" },
  { label: "Auswertungen" },
  { label: "Berichte" },
  { label: "Benutzer", href: "/arbeitgeber/dashboard/benutzer" },
  { label: "Einstellungen", href: "/arbeitgeber/dashboard/einstellungen" },
];

function NavLink({ item, mobile, active }: { item: NavItem; mobile?: boolean; active: boolean }) {
  if (!item.href) {
    return (
      <span
        className={`${mobile ? "whitespace-nowrap" : ""} inline-flex items-center gap-1 px-3 py-2 text-dash-text-faint cursor-default`}
        title="Noch nicht verfügbar"
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${mobile ? "whitespace-nowrap " : ""}rounded-lg px-4 py-2 transition-all duration-200 ${
        active
          ? "bg-dash-panel-soft text-dash-gold border border-dash-gold/50 shadow-[inset_0_0_0_1px_rgba(226,188,107,0.12)]"
          : "border border-transparent text-dash-text-secondary hover:text-dash-text hover:bg-dash-panel-soft"
      }`}
    >
      {item.label}
    </Link>
  );
}

export function EmployerNav({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {NAV.map((item) => (
        <NavLink
          key={item.label}
          item={item}
          mobile={mobile}
          active={!!item.href && (item.href === "/arbeitgeber/dashboard" ? pathname === item.href : pathname.startsWith(item.href))}
        />
      ))}
    </>
  );
}
