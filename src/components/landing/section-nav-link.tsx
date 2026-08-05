"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, MouseEvent } from "react";

// Fuer Links, die zu einem Abschnitt auf der Startseite scrollen sollen
// (z.B. "/#funktionen"). Auf der Startseite selbst wird der native
// Anchor-Klick abgefangen und stattdessen weich zum Zielelement gescrollt,
// ohne die URL um einen Hash zu ergaenzen oder einen History-Eintrag zu
// erzeugen. Von einer anderen Seite aus navigiert der Link ganz normal zu
// "/#id" - der HashScrollHandler auf der Startseite scrollt dann dorthin
// und entfernt den Hash anschliessend wieder aus der sichtbaren URL.
export function SectionNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1 || pathname !== "/") return;

    const id = href.slice(hashIndex + 1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
