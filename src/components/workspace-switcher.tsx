"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@/components/icons";
import { switchCompanyWorkspace } from "@/actions/company";

type WorkspaceCompany = { id: string; name: string };

export function WorkspaceSwitcher({
  companies,
  hasPlatformAccess,
  activeCompanyId,
  isAdminContext,
}: {
  companies: WorkspaceCompany[];
  hasPlatformAccess: boolean;
  activeCompanyId?: string;
  isAdminContext: boolean;
}) {
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

  const totalWorkspaces = companies.length + (hasPlatformAccess ? 1 : 0);
  if (totalWorkspaces <= 1) return null;

  const activeCompany = !isAdminContext ? companies.find((c) => c.id === activeCompanyId) : undefined;
  const currentLabel = isAdminContext
    ? "Effivo-Plattformverwaltung"
    : activeCompany
      ? `${activeCompany.name} – Unternehmensbereich`
      : "Arbeitsbereich wählen";

  const itemClass =
    "block w-full text-left px-4 py-2.5 text-sm text-sand-700 dark:text-cockpit-text-secondary hover:bg-sand-100 dark:hover:bg-white/5 transition-colors";
  const activeItemClass =
    "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink-700 dark:text-cockpit-accent-light bg-ink-50 dark:bg-cockpit-accent-subtle/30";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-card-border dark:border-white/10 px-3.5 py-2 text-sm font-medium text-sand-700 dark:text-cockpit-text-secondary hover:text-sand-900 dark:hover:text-cockpit-heading hover:bg-sand-100 dark:hover:bg-white/5 transition-colors"
      >
        {currentLabel}
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-72 overflow-hidden rounded-2xl border border-card-border/70 dark:border-white/10 bg-card dark:bg-cockpit-card shadow-warm-lg dark:shadow-2xl dark:shadow-black/40">
          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sand-400 dark:text-cockpit-text-weak">
            Arbeitsbereich wechseln
          </p>
          <div className="py-1">
            {companies.map((c) => {
              const active = !isAdminContext && c.id === activeCompanyId;
              return active ? (
                <div key={c.id} className={activeItemClass}>
                  {c.name} – Unternehmensbereich
                </div>
              ) : (
                <form key={c.id} action={switchCompanyWorkspace}>
                  <input type="hidden" name="companyId" value={c.id} />
                  <button type="submit" className={itemClass}>
                    {c.name} – Unternehmensbereich
                  </button>
                </form>
              );
            })}

            {hasPlatformAccess &&
              (isAdminContext ? (
                <div className={activeItemClass}>Effivo-Plattformverwaltung</div>
              ) : (
                <Link href="/admin/dashboard" className={itemClass}>
                  Effivo-Plattformverwaltung
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
