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
import { dashCardClass, dashIconGlowClass, dashKebabPanelClass, dashKebabTriggerClass } from "@/components/dashboard/dash-ui";
import {
  EyeIcon,
  RefreshIcon,
  SearchIcon,
  FilterIcon,
  SortIcon,
  TrendingUpIcon,
  BriefcaseIcon,
  UsersIcon,
  FileTextIcon,
} from "@/components/icons";
import { KebabMenu } from "@/components/kebab-menu";
import { DeleteImportDialog } from "./delete-import-dialog";

export type ImportRow = {
  id: string;
  period: string;
  periodSortKey: number;
  category: DataImportCategory;
  categoryLabel: string;
  fileName: string;
  status: DataImportStatus;
  statusLabel: string;
  uploaderName: string;
  dateLabel: string;
  createdAtMs: number;
  sizeLabel: string;
  isProcessed: boolean;
};

type SortKey = "period" | "date";
type SortState = { key: SortKey; direction: "asc" | "desc" };

const CATEGORY_ICON: Record<DataImportCategory, typeof TrendingUpIcon> = {
  FINANCE: TrendingUpIcon,
  ORDERS: BriefcaseIcon,
  CUSTOMERS: UsersIcon,
};

const menuItemClass =
  "flex w-full items-center gap-2.5 px-[15px] py-[13px] text-left text-sm font-semibold text-dash-text hover:bg-dash-panel-soft transition-colors";

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
  // Kein Sortier-Status = Standardreihenfolge wie vom Server geladen
  // (createdAt absteigend), passend zur bisherigen, unveraenderten Query in
  // page.tsx.
  const [sort, setSort] = useState<SortState | null>(null);
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

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const factor = sort.direction === "asc" ? 1 : -1;
    const key = sort.key === "period" ? "periodSortKey" : "createdAtMs";
    return [...filtered].sort((a, b) => (a[key] - b[key]) * factor);
  }, [filtered, sort]);

  function toggleStatus(status: DataImportStatus) {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }

  const filterActive = activeStatuses.size < statusOptions.length;

  return (
    <div className="mt-8">
      <div className={`overflow-hidden ${dashCardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dash-line p-5">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${dashIconGlowClass}`}>
              <FileTextIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-dash-text">Importhistorie</h2>
              <p className="mt-0.5 text-sm text-dash-text-muted">
                Übersicht aller hochgeladenen Dateien und ihres Bearbeitungsstatus.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-text-faint" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Suchen..."
                aria-label="Datenimporte durchsuchen"
                className="w-48 rounded-xl border border-dash-line bg-dash-panel py-2 pl-9 pr-3 text-sm text-dash-text placeholder:text-dash-text-faint focus:outline-none focus:ring-2 focus:ring-dash-gold/40 sm:w-56"
              />
            </div>

            <div ref={filterRef} className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={filterOpen}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                  filterActive
                    ? "border-dash-gold/50 bg-dash-gold-glow text-dash-gold"
                    : "border-dash-line bg-dash-panel text-dash-text-secondary hover:bg-dash-panel-soft"
                }`}
              >
                <FilterIcon className="h-3.5 w-3.5" />
                Filter
              </button>

              {filterOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-30 w-56 overflow-hidden rounded-xl border border-dash-line bg-dash-panel shadow-[0_18px_42px_rgba(0,0,0,0.34)]"
                >
                  <div className="p-3">
                    <p className="px-1.5 pb-2 text-xs font-semibold uppercase tracking-wide text-dash-text-faint">
                      Status
                    </p>
                    {statusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-dash-text hover:bg-dash-panel-soft"
                      >
                        <input
                          type="checkbox"
                          checked={activeStatuses.has(status)}
                          onChange={() => toggleStatus(status)}
                          className="h-4 w-4 rounded border-dash-line text-dash-gold focus:ring-dash-gold/40"
                        />
                        <span aria-hidden className={`h-2 w-2 rounded-full ${dataImportStatusDotClass(status)}`} />
                        {DATA_IMPORT_STATUS_LABELS[status]}
                      </label>
                    ))}
                    {filterActive && (
                      <button
                        type="button"
                        onClick={() => setActiveStatuses(new Set(statusOptions))}
                        className="mt-2 w-full rounded-lg px-1.5 py-1.5 text-left text-xs font-semibold text-dash-gold hover:bg-dash-panel-soft"
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

        {/* overflow-x-auto ist ein reines Sicherheitsnetz fuer sehr schmale
            Viewports (Tabelle hat min-w-[880px]). Das je Zeile nach unten
            aufklappende KebabMenu wird davon NICHT mehr abgeschnitten, da es
            per Portal in document.body rendert (siehe kebab-menu.tsx) - ein
            Versuch, das ueber "overflow-y-visible" auf diesem Wrapper zu
            loesen, WIRKT NICHT: per CSS-Spezifikation zwingt jeder overflow-x
            != visible automatisch auch overflow-y auf "auto", unabhaengig
            davon, was overflow-y explizit gesetzt wird. */}
        <div className="mx-5 mb-5 overflow-x-auto rounded-xl border border-dash-line">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-dash-panel-soft">
              <tr className="text-xs uppercase tracking-wide text-dash-text-faint">
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort("period")}
                    className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-dash-text transition-colors"
                  >
                    Zeitraum
                    <SortIcon
                      className={`h-3.5 w-3.5 ${sort?.key === "period" ? "text-dash-gold" : "text-dash-text-faint"}`}
                    />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Kategorie</th>
                <th className="px-4 py-3 font-semibold">Dateiname</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Hochgeladen von</th>
                <th className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort("date")}
                    className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-dash-text transition-colors"
                  >
                    Datum
                    <SortIcon
                      className={`h-3.5 w-3.5 ${sort?.key === "date" ? "text-dash-gold" : "text-dash-text-faint"}`}
                    />
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Größe</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-dash-text-muted">
                    {search ? `Keine Datenimporte gefunden für „${search}“.` : "Keine Datenimporte für die gewählten Filter."}
                  </td>
                </tr>
              ) : (
                sorted.map((row) => {
                  const CategoryIcon = CATEGORY_ICON[row.category];
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-dash-line transition-colors hover:bg-dash-panel-soft"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-dash-text">
                        {row.period}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${DATA_IMPORT_CATEGORY_BADGE_CLASS[row.category]}`}
                          >
                            <CategoryIcon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-dash-text-secondary">{row.categoryLabel}</span>
                        </div>
                      </td>
                      <td
                        className="max-w-[220px] truncate px-4 py-3.5 text-dash-text-muted"
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
                      <td className="whitespace-nowrap px-4 py-3.5 text-dash-text-muted">
                        {row.uploaderName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-dash-text-muted">{row.dateLabel}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-dash-text-muted">{row.sizeLabel}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <KebabMenu panelClassName={dashKebabPanelClass} triggerClassName={dashKebabTriggerClass}>
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
