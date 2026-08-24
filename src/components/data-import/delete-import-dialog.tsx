"use client";

import { useEffect, useRef, useState } from "react";
import { deleteDataImport } from "@/actions/data-import";
import { importPanelClass } from "@/lib/import-ui";
import { secondaryButtonClass } from "@/lib/ui";
import { TrashIcon, XIcon } from "@/components/icons";

// Bewusst ein eigener, gestalteter Bestaetigungsdialog statt des einfachen
// window.confirm() aus ConfirmSubmitButton (siehe deleteCustomer): das
// Loeschen eines Dateiimports soll den Zeitraum/Dateinamen noch einmal klar
// zeigen, bevor bestaetigt wird - bei mehreren aehnlich benannten Importen
// (z.B. "Juli 2026" vs. "August 2026" derselben Kategorie) reicht eine reine
// Ja/Nein-Frage nicht aus, um Verwechslungen sicher auszuschliessen. Nutzt
// trotzdem denselben Server-Action-Weg (deleteDataImport) wie alle anderen
// Loesch-Aktionen im Projekt - kein separater Client-Fetch/State-Umweg.
export function DeleteImportDialog({
  dataImportId,
  fileName,
  period,
  isProcessed,
  variant = "menu-item",
}: {
  dataImportId: string;
  fileName: string;
  period: string;
  isProcessed: boolean;
  variant?: "menu-item" | "button";
}) {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    cancelRef.current?.focus();
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          // KebabMenu schliesst sich (und unmountet damit seine Kinder,
          // inklusive dieses Dialogs) bei JEDEM Klick innerhalb des Menues,
          // auch auf diesem Trigger selbst (role="menu" hat einen eigenen
          // onClick={() => setOpen(false)}). Ohne stopPropagation wuerde der
          // Dialog also im selben Klick geoeffnet UND sofort durch das
          // schliessende KebabMenu wieder unmountet, bevor er sichtbar wird.
          event.stopPropagation();
          setOpen(true);
        }}
        className={
          variant === "button"
            ? "inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            : "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10 transition-colors"
        }
      >
        <TrashIcon className="h-3.5 w-3.5" />
        Löschen
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-import-title"
            onClick={(event) => event.stopPropagation()}
            className={`relative w-full max-w-md p-6 ${importPanelClass}`}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-sand-400 hover:bg-sand-100 hover:text-sand-700 dark:text-cockpit-text-weak dark:hover:bg-white/5 dark:hover:text-cockpit-text transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              <TrashIcon className="h-5 w-5" />
            </span>

            <h2 id="delete-import-title" className="mt-4 font-display text-lg font-semibold text-sand-900 dark:text-cockpit-text">
              Dateiimport löschen?
            </h2>
            <p className="mt-2 text-sm text-sand-600 dark:text-cockpit-text-secondary">
              Möchten Sie diesen Dateiimport wirklich löschen? Der Eintrag wird aus der Historie entfernt. Diese Aktion kann
              nicht rückgängig gemacht werden.
              {isProcessed && " Die daraus abgeleiteten Auswertungsdaten werden dabei ebenfalls entfernt."}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-card-border dark:border-white/10 bg-sand-50 dark:bg-white/5 p-4 text-sm">
              <div>
                <dt className="text-sand-500 dark:text-cockpit-text-weak">Zeitraum</dt>
                <dd className="mt-0.5 font-medium text-sand-900 dark:text-cockpit-text">{period}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-sand-500 dark:text-cockpit-text-weak">Dateiname</dt>
                <dd className="mt-0.5 truncate font-medium text-sand-900 dark:text-cockpit-text" title={fileName}>
                  {fileName}
                </dd>
              </div>
            </dl>

            <form action={deleteDataImport} className="mt-6 flex justify-end gap-3">
              <input type="hidden" name="dataImportId" value={dataImportId} />
              <button ref={cancelRef} type="button" onClick={() => setOpen(false)} className={secondaryButtonClass}>
                Abbrechen
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 active:bg-rose-800 transition-colors"
              >
                Löschen
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
