"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, BuildingIcon, ShieldIcon, CheckIcon } from "@/components/icons";
import { switchCompanyWorkspace } from "@/actions/company";

type WorkspaceCompany = { id: string; name: string };

const ICON_WRAP_CLASS =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sand-600 dark:bg-white/5 dark:text-cockpit-text-secondary";
const ICON_WRAP_ACTIVE_CLASS =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-700 dark:bg-cockpit-accent-subtle/50 dark:text-cockpit-accent-light";

function WorkspaceRow({
  icon,
  label,
  sublabel,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
}) {
  return (
    <span className="flex w-full items-center gap-3">
      <span className={active ? ICON_WRAP_ACTIVE_CLASS : ICON_WRAP_CLASS}>{icon}</span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate">{label}</span>
        <span className="block truncate text-xs font-normal text-sand-400 dark:text-cockpit-text-weak">
          {sublabel}
        </span>
      </span>
      {active && <CheckIcon className="h-4 w-4 shrink-0 text-ink-600 dark:text-cockpit-accent-light" />}
    </span>
  );
}

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
  const currentLabel = isAdminContext ? "Admin-Dashboard" : (activeCompany?.name ?? "Arbeitsbereich wählen");

  const itemClass =
    "block w-full rounded-xl px-2.5 py-2 text-left text-sm text-sand-700 dark:text-cockpit-text-secondary hover:bg-sand-100 dark:hover:bg-white/5 transition-colors";
  const activeItemClass =
    "flex w-full rounded-xl px-2.5 py-2 text-left text-sm font-semibold text-ink-700 dark:text-cockpit-accent-light bg-ink-50 dark:bg-cockpit-accent-subtle/30";

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
          <div className="p-1.5">
            {companies.map((c) => {
              const active = !isAdminContext && c.id === activeCompanyId;
              const row = (
                <WorkspaceRow
                  icon={<BuildingIcon className="h-4 w-4" />}
                  label={c.name}
                  sublabel="Unternehmen"
                  active={active}
                />
              );
              return active ? (
                <div key={c.id} className={activeItemClass}>
                  {row}
                </div>
              ) : (
                <form key={c.id} action={switchCompanyWorkspace}>
                  <input type="hidden" name="companyId" value={c.id} />
                  <button type="submit" className={itemClass}>
                    {row}
                  </button>
                </form>
              );
            })}

            {hasPlatformAccess &&
              (isAdminContext ? (
                <div className={activeItemClass}>
                  <WorkspaceRow
                    icon={<ShieldIcon className="h-4 w-4" />}
                    label="Admin-Dashboard"
                    sublabel="Systemverwaltung"
                    active
                  />
                </div>
              ) : (
                <Link href="/admin/dashboard" className={itemClass}>
                  <WorkspaceRow
                    icon={<ShieldIcon className="h-4 w-4" />}
                    label="Admin-Dashboard"
                    sublabel="Systemverwaltung"
                    active={false}
                  />
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
