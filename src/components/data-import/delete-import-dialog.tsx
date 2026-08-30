"use client";

import { useEffect, useRef, useState } from "react";
import { deleteDataImport } from "@/actions/data-import";
import { TrashIcon, XIcon } from "@/components/icons";

// Bewusst ein eigener, gestalteter Bestaetigungsdialog statt des einfachen
// window.confirm() aus ConfirmSubmitButton (siehe deleteCustomer): das
// Loeschen eines Dateiimports soll den Zeitraum/Dateinamen noch einmal klar
// zeigen, bevor bestaetigt wird - bei mehreren aehnlich benannten Importen
// (z.B. "Juli 2026" vs. "August 2026" derselben Kategorie) reicht eine reine
// Ja/Nein-Frage nicht aus, um Verwechslungen sicher auszuschliessen. Nutzt
// trotzdem denselben Server-Action-Weg (deleteDataImport) wie alle anderen
// Loesch-Aktionen im Projekt - kein separater Client-Fetch/State-Umweg.
//
// Styling 1:1 aus der vom Nutzer gelieferten HTML/CSS-Designreferenz
// uebernommen (Modal-Breite, Verlauf, Icon-links-Layout, Footer mit eigener
// Trennlinie) - bewusst lokal in dieser Komponente statt in lib/import-ui.ts,
// da DeleteImportDialog ausschliesslich fuer Datenimporte existiert und
// keine andere Seite diese Modal-Optik erben soll.
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
            ? "inline-flex items-center gap-1.5 rounded-full border border-dash-red/35 px-3 py-1.5 text-xs font-semibold text-dash-red hover:bg-dash-red-tint transition-colors"
            : "flex w-full items-center gap-2.5 px-[15px] py-[13px] text-left text-sm font-semibold text-dash-red hover:bg-dash-red-tint transition-colors"
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
            className="relative w-full max-w-[570px] rounded-2xl border border-dash-line bg-dash-panel shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              className="absolute right-4 top-3.5 flex h-8 w-8 items-center justify-center rounded-full text-dash-text-faint hover:bg-dash-panel-soft hover:text-dash-text transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <div className="flex gap-4.5 p-6 pb-5">
              <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-dash-red-tint text-dash-red">
                <TrashIcon className="h-6 w-6" />
              </span>

              <div className="min-w-0 flex-1">
                <h2
                  id="delete-import-title"
                  className="text-xl font-semibold text-dash-text"
                >
                  Dateiimport löschen?
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-dash-text-secondary">
                  Möchten Sie diesen Dateiimport wirklich löschen? Der Eintrag wird aus der Historie entfernt. Diese
                  Aktion kann nicht rückgängig gemacht werden.
                  {isProcessed && " Die daraus abgeleiteten Auswertungsdaten werden dabei ebenfalls entfernt."}
                </p>

                <dl className="mt-4 grid grid-cols-[1fr_1.6fr] gap-5 rounded-[10px] border border-dash-line bg-dash-panel-soft p-4 text-sm">
                  <div>
                    <dt className="text-dash-text-faint">Zeitraum</dt>
                    <dd className="mt-0.5 font-medium text-dash-text">{period}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-dash-text-faint">Dateiname</dt>
                    <dd className="mt-0.5 truncate font-medium text-dash-text" title={fileName}>
                      {fileName}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <form
              action={deleteDataImport}
              className="flex justify-end gap-3.5 border-t border-dash-line px-6 py-4"
            >
              <input type="hidden" name="dataImportId" value={dataImportId} />
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                className="min-w-[180px] rounded-lg border border-dash-line bg-dash-panel px-5 py-2.5 text-sm font-bold text-dash-text hover:bg-dash-panel-soft transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="min-w-[180px] rounded-lg bg-dash-red px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-[filter,background-color]"
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
