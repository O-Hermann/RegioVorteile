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
    <div ref={containerRef} className="relative z-10 inline-block">
      {open && (
        <div className="absolute bottom-full left-1/2 mb-3 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-card-border/70 dark:border-white/10 bg-card dark:bg-cockpit-card shadow-warm-lg dark:shadow-2xl dark:shadow-black/40">
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
        className="flex items-center gap-3 rounded-full border border-card-border/70 dark:border-white/10 bg-card dark:bg-cockpit-card pl-2 pr-5 py-2 shadow-warm-lg dark:shadow-2xl dark:shadow-black/50 hover:-translate-y-0.5 transition-all duration-200"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-600 to-ink-800 dark:from-cockpit-accent dark:to-cockpit-accent-dark text-white shadow-md shadow-ink-900/20">
          <PlusIcon className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
        </span>
        <span className="text-left">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-sand-400 dark:text-cockpit-text-weak">
            Schnellaktion
          </span>
          <span className="block text-sm font-semibold text-sand-900 dark:text-cockpit-heading">
            Aktion wählen
          </span>
        </span>
      </button>
    </div>
  );
}
