"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PlusIcon, UploadIcon, ChatIcon, AlertTriangleIcon, TrendingUpIcon } from "@/components/icons";

const ACTIONS = [
  {
    href: "/arbeitgeber/dashboard/datenimporte",
    label: "Datenimport starten",
    icon: UploadIcon,
    color:
      "bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/30",
  },
  {
    href: "/arbeitgeber/dashboard/support?category=HELP",
    label: "Support anfragen",
    icon: ChatIcon,
    color:
      "bg-gradient-to-br from-sky-400/30 to-sky-500/10 text-sky-600 dark:text-sky-200 border border-sky-400/30 dark:border-sky-300/25",
  },
  {
    href: "/arbeitgeber/dashboard/support?category=BUG",
    label: "Bug melden",
    icon: AlertTriangleIcon,
    color:
      "bg-gradient-to-br from-rose-400/35 to-rose-500/10 text-rose-600 dark:text-rose-200 border border-rose-400/35 dark:border-rose-300/30",
  },
  {
    href: "/arbeitgeber/dashboard/support?category=SUGGESTION",
    label: "Verbesserung vorschlagen",
    icon: TrendingUpIcon,
    color:
      "bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 text-emerald-600 dark:text-emerald-200 border border-emerald-400/30 dark:border-emerald-300/25",
  },
];

// Eigenstaendige, viewport-fixierte Schnellaktion fuer den Unternehmens-
// bereich - bewusst kein Bestandteil des Dashboard-Grids mehr, damit sie
// unabhaengig von Spalten-/Modulhoehen immer griffbereit am unteren
// Bildschirmrand schwebt (wie eine echte SaaS-Quick-Action).
export function QuickActionButton() {
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
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 sm:bottom-8">
      <div ref={containerRef} className="pointer-events-auto relative">
        {open && (
          <div className="absolute bottom-full left-1/2 mb-4 w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-card-border/70 dark:border-white/10 bg-card dark:bg-cockpit-card shadow-warm-lg dark:shadow-2xl dark:shadow-black/40">
            <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sand-400 dark:text-cockpit-text-weak">
              Schnellaktion
            </p>
            <div className="p-1.5">
              {ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-sand-700 dark:text-cockpit-text-secondary hover:bg-sand-100 dark:hover:bg-white/5 transition-colors"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Schnellaktion öffnen"
          className="group flex items-center gap-3 rounded-full border border-card-border/70 dark:border-white/10 bg-card dark:bg-cockpit-card py-2 pl-1.5 pr-5 shadow-warm-lg dark:shadow-2xl dark:shadow-black/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-300 dark:hover:border-cockpit-accent-light/40 sm:gap-5 sm:py-2 sm:pl-3 sm:pr-9"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-500 to-ink-700 dark:from-cockpit-accent-light dark:to-cockpit-accent-dark text-white shadow-[0_0_16px_-3px_rgba(8,122,120,0.55)] transition-shadow duration-200 group-hover:shadow-[0_0_22px_-2px_rgba(8,122,120,0.7)] dark:shadow-[0_0_18px_-3px_rgba(30,151,148,0.6)] dark:group-hover:shadow-[0_0_26px_-2px_rgba(30,151,148,0.75)] sm:h-12 sm:w-12">
            <PlusIcon className={`h-5 w-5 transition-transform duration-200 sm:h-6 sm:w-6 ${open ? "rotate-45" : ""}`} />
          </span>
          <span className="text-left">
            <span className="block text-[9px] font-semibold uppercase tracking-widest text-sand-400 dark:text-cockpit-text-weak sm:text-[10px]">
              Schnellaktion
            </span>
            <span className="block text-sm font-bold text-sand-900 dark:text-cockpit-heading sm:text-base">
              Aktion wählen
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
