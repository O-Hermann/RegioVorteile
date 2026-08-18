"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { NAV_ITEMS } from "@/lib/site-config";

// Header-Navigation zu Abschnitten der Startseite. Klicks auf der
// Startseite scrollen weich zum Zielelement ohne Hash in der URL (siehe
// SectionNavLink). Zusaetzlich wird per IntersectionObserver dezent
// markiert, welcher Abschnitt gerade sichtbar ist - rein optisch, ohne
// Einfluss auf die URL.
export function LandingNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!isHome) return;

    const ids = NAV_ITEMS.map((item) => item.href.split("#")[1]).filter(Boolean);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  function handleClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (!isHome) return;
    const id = href.split("#")[1];
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const id = item.href.split("#")[1];
        const active = isHome && activeId === id;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleClick(e, item.href)}
            className={`transition-colors hover:text-landing-text-primary ${
              active ? "text-landing-text-primary" : ""
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
