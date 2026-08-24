"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { DataImportCategory, DataImportStatus } from "@/generated/prisma/client";
import {
  DATA_IMPORT_STATUS_LABELS,
  DATA_IMPORT_CATEGORY_BADGE_CLASS,
  dataImportStatusBadgeClass,
  dataImportStatusDotClass,
} from "@/lib/data-import";
import { importPanelClass, importIconBadgeClass } from "@/lib/import-ui";
import { EyeIcon, RefreshIcon, SearchIcon, FilterIcon, TrendingUpIcon, BriefcaseIcon, UsersIcon, FileTextIcon } from "@/components/icons";
import { KebabMenu } from "@/components/kebab-menu";
import { DeleteImportDialog } from "./delete-import-dialog";

export type ImportRow = {
  id: string;
  period: string;
  category: DataImportCategory;
  categoryLabel: string;
  fileName: string;
  status: DataImportStatus;
  statusLabel: string;
  uploaderName: string;
  dateLabel: string;
  sizeLabel: string;
  isProcessed: boolean;
};

const CATEGORY_ICON: Record<DataImportCategory, typeof TrendingUpIcon> = {
  FINANCE: TrendingUpIcon,
  ORDERS: BriefcaseIcon,
  CUSTOMERS: UsersIcon,
};

const menuItemClass =
  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-sand-700 hover:bg-sand-100 dark:text-cockpit-text dark:hover:bg-white/5 transition-colors";

// Suche und Statusfilter laufen bewusst rein clientseitig ueber die bereits
// geladenen Zeilen (typische Importhistorie einer KMU ist klein genug, kein
// Bedarf fuer einen Server-Roundtrip pro Tastenanschlag) - beide sind echte
// Funktionalitaet statt nur Deko, damit die Suchleiste/der Filter-Button
// nicht wie ein totes UI-Element wirken.
export function ImportHistoryTable({ rows, canUpload }: { rows: ImportRow[]; canUpload: boolean }) {
  const statusOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.status))), [rows]);
  const [search, setSearch] = useState("");
  const [activeStatuses, setActiveStatuses] = useState<Set<DataImportStatus>>(() => new Set(statusOptions));
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!activeStatuses.has(row.status)) return false;
      if (!q) return true;
      return (
        row.period.toLowerCase().includes(q) ||
        row.categoryLabel.toLowerCase().includes(q) ||
        row.fileName.toLowerCase().includes(q) ||
        row.statusLabel.toLowerCase().includes(q) ||
        row.uploaderName.toLowerCase().includes(q)
      );
    });
  }, [rows, search, activeStatuses]);

  function toggleStatus(status: DataImportStatus) {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  const filterActive = activeStatuses.size < statusOptions.length;

  return (
    <div className="mt-8">
      <div className={`overflow-hidden ${importPanelClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-card-border/70 dark:border-white/5 p-5">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${importIconBadgeClass}`}>
              <FileTextIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-sand-900 dark:text-cockpit-text">Importhistorie</h2>
              <p className="mt-0.5 text-sm text-sand-500 dark:text-cockpit-text-weak">
                Übersicht aller hochgeladenen Dateien und ihres Bearbeitungsstatus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-400 dark:text-cockpit-text-weak" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Suchen..."
                aria-label="Datenimporte durchsuchen"
                className="w-48 rounded-full border border-card-border bg-card py-2 pl-9 pr-3 text-sm text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-ink-500 dark:border-white/15 dark:text-cockpit-text dark:placeholder:text-cockpit-text-weak sm:w-56"
              />
            </div>

            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={filterOpen}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                  filterActive
                    ? "border-ink-400 bg-ink-50 text-ink-700 dark:border-cockpit-accent-light/40 dark:bg-cockpit-accent-light/10 dark:text-cockpit-accent-light"
                    : "border-card-border bg-card text-sand-700 hover:bg-sand-100 dark:border-white/15 dark:text-cockpit-text dark:hover:bg-white/5"
                }`}
              >
                <FilterIcon className="h-3.5 w-3.5" />
                Filter
              </button>

              {filterOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-30 w-56 overflow-hidden rounded-2xl border border-card-border/70 dark:border-white/10 bg-card dark:bg-cockpit-card shadow-warm-lg dark:shadow-2xl dark:shadow-black/40"
                >
                  <div className="p-3">
                    <p className="px-1.5 pb-2 text-xs font-semibold uppercase tracking-wide text-sand-500 dark:text-cockpit-text-weak">
                      Status
                    </p>
                    {statusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-sand-800 hover:bg-sand-50 dark:text-cockpit-text dark:hover:bg-white/5"
                      >
                        <input
                          type="checkbox"
                          checked={activeStatuses.has(status)}
                          onChange={() => toggleStatus(status)}
                          className="h-4 w-4 rounded border-card-border text-ink-600 focus:ring-ink-500 dark:border-white/20"
                        />
                        <span aria-hidden className={`h-2 w-2 rounded-full ${dataImportStatusDotClass(status)}`} />
                        {DATA_IMPORT_STATUS_LABELS[status]}
                      </label>
                    ))}
                    {filterActive && (
                      <button
                        type="button"
                        onClick={() => setActiveStatuses(new Set(statusOptions))}
                        className="mt-2 w-full rounded-lg px-1.5 py-1.5 text-left text-xs font-semibold text-ink-600 hover:bg-sand-50 dark:text-cockpit-accent-light dark:hover:bg-white/5"
                      >
                        Filter zurücksetzen
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-sand-50 dark:bg-white/5">
              <tr className="text-xs uppercase tracking-wide text-sand-500 dark:text-cockpit-text-weak">
                <th className="px-4 py-3 font-semibold">Zeitraum</th>
                <th className="px-4 py-3 font-semibold">Kategorie</th>
                <th className="px-4 py-3 font-semibold">Dateiname</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Hochgeladen von</th>
                <th className="px-4 py-3 font-semibold">Datum</th>
                <th className="px-4 py-3 font-semibold">Größe</th>
                <th className="px-4 py-3 text-right font-semibold">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-sand-500 dark:text-cockpit-text-weak">
                    {search ? `Keine Datenimporte gefunden für „${search}“.` : "Keine Datenimporte für die gewählten Filter."}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const CategoryIcon = CATEGORY_ICON[row.category];
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-card-border/70 transition-colors hover:bg-sand-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-sand-900 dark:text-cockpit-text">
                        {row.period}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${DATA_IMPORT_CATEGORY_BADGE_CLASS[row.category]}`}
                        >
                          <CategoryIcon className="h-3.5 w-3.5" />
                          {row.categoryLabel}
                        </span>
                      </td>
                      <td
                        className="max-w-[220px] truncate px-4 py-3.5 text-sand-600 dark:text-cockpit-text-secondary"
                        title={row.fileName}
                      >
                        {row.fileName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${dataImportStatusBadgeClass(row.status)}`}
                        >
                          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dataImportStatusDotClass(row.status)}`} />
                          {row.statusLabel}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sand-600 dark:text-cockpit-text-secondary">
                        {row.uploaderName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sand-500 dark:text-cockpit-text-weak">{row.dateLabel}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sand-500 dark:text-cockpit-text-weak">{row.sizeLabel}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <KebabMenu>
                          <Link href={`/arbeitgeber/dashboard/datenimporte/${row.id}`} className={menuItemClass}>
                            <EyeIcon className="h-3.5 w-3.5" />
                            Ansehen
                          </Link>
                          {canUpload && (
                            <Link href="/arbeitgeber/dashboard/datenimporte/neu" className={menuItemClass}>
                              <RefreshIcon className="h-3.5 w-3.5" />
                              Erneut importieren
                            </Link>
                          )}
                          {canUpload && (
                            <DeleteImportDialog
                              dataImportId={row.id}
                              fileName={row.fileName}
                              period={row.period}
                              isProcessed={row.isProcessed}
                            />
                          )}
                        </KebabMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
