"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVerticalIcon } from "@/components/icons";

// Dezentes "Weitere Aktionen"-Menue fuer selten benutzte, insbesondere
// destruktive Aktionen, die nicht gleichwertig neben den Hauptbuttons stehen
// sollen (Feinschliff Teil B). Gleiches Klick-aussen-/Escape-Muster wie
// QuickActionButton/WorkspaceSwitcher.
export function KebabMenu({ children, label = "Weitere Aktionen" }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border dark:border-white/15 text-sand-600 dark:text-cockpit-text-secondary hover:bg-sand-100 hover:text-sand-900 dark:hover:bg-white/5 dark:hover:text-cockpit-text transition-colors"
      >
        <MoreVerticalIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className="absolute right-0 top-[calc(100%+8px)] z-30 w-56 overflow-hidden rounded-2xl border border-card-border/70 dark:border-white/10 bg-card dark:bg-cockpit-card shadow-warm-lg dark:shadow-2xl dark:shadow-black/40"
        >
          <div className="p-1.5">{children}</div>
        </div>
      )}
    </div>
  );
}
