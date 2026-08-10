"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PlusIcon, UploadIcon, ChatIcon, AlertTriangleIcon, TrendingUpIcon, UsersIcon, BriefcaseIcon } from "@/components/icons";

const ACTIONS = [
  {
    href: "/arbeitgeber/dashboard/auftraege/neu",
    label: "Auftrag anlegen",
    icon: BriefcaseIcon,
    color:
      "bg-gradient-to-br from-amber-400/35 to-amber-500/10 text-amber-600 dark:text-amber-200 border border-amber-400/35 dark:border-amber-300/30",
  },
  {
    href: "/arbeitgeber/dashboard/kunden/neu",
    label: "Kunde anlegen",
    icon: UsersIcon,
    color:
      "bg-gradient-to-br from-violet-400/30 to-violet-500/10 text-violet-600 dark:text-violet-200 border border-violet-400/30 dark:border-violet-300/25",
  },
  {
    href: "/arbeitgeber/dashboard/datenimporte/neu",
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

// Bewusster Abschluss der mittleren Dashboard-Spalte, kein Grid-Modul und
// kein viewport-fixiertes Floating-Element - die Zentrierung ergibt sich
// rein daraus, dass die aufrufende Seite diese Komponente in einen mit
// "flex justify-center" horizontal zentrierenden Wrapper innerhalb der
// mittleren Spalte einbettet (siehe arbeitgeber/(protected)/dashboard/page.tsx).
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
    <div ref={containerRef} className="relative">
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
        className="group relative flex w-[264px] items-center gap-4 overflow-hidden rounded-[26px] border border-card-border/70 dark:border-white/10 bg-gradient-to-b from-card to-card dark:from-cockpit-card dark:to-cockpit-card-dark py-1.5 pl-2 pr-6 shadow-warm-lg ring-1 ring-inset ring-black/[0.02] dark:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.65)] dark:ring-white/[0.06] transition-all duration-200 hover:-translate-y-1 hover:border-ink-300 dark:hover:border-cockpit-accent-light/50"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -left-6 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-cockpit-accent-light/25 opacity-0 blur-2xl transition-opacity duration-300 dark:opacity-70 dark:group-hover:opacity-100"
        />
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-500 to-ink-800 dark:from-cockpit-accent-light dark:to-cockpit-accent-dark text-white shadow-[0_0_0_1px_rgba(255,255,255,0.15)_inset,0_0_24px_-4px_rgba(8,122,120,0.75)] transition-shadow duration-200 group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.25)_inset,0_0_32px_-2px_rgba(8,122,120,0.9)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_0_28px_-4px_rgba(30,151,148,0.9)] dark:group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.3)_inset,0_0_38px_-2px_rgba(30,151,148,1)]">
          <PlusIcon className={`h-6 w-6 transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
        </span>
        <span className="relative text-left">
          <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600 dark:text-cockpit-accent-light">
            Schnellaktion
          </span>
          <span className="block text-lg font-extrabold leading-tight tracking-tight text-sand-900 dark:text-cockpit-heading">
            Aktion wählen
          </span>
        </span>
      </button>
    </div>
  );
}
