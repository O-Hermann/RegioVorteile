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
            ? "inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-import-danger/30 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-import-danger hover:bg-rose-50 dark:hover:bg-import-danger/10 transition-colors"
            : "flex w-full items-center gap-2.5 px-[15px] py-[13px] text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-import-danger dark:hover:bg-[#142a44] transition-colors"
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
            className="relative w-full max-w-[570px] rounded-2xl border border-card-border dark:border-import-accent/55 bg-card dark:bg-[linear-gradient(180deg,#071a2d,#07182a)] shadow-warm-lg dark:shadow-[0_24px_70px_rgba(0,0,0,0.5),0_0_35px_rgba(23,200,195,0.08)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Schließen"
              className="absolute right-4 top-3.5 flex h-8 w-8 items-center justify-center rounded-full text-sand-400 hover:bg-sand-100 hover:text-sand-700 dark:text-import-text-secondary dark:hover:bg-white/5 dark:hover:text-import-text transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <div className="flex gap-4.5 p-6 pb-5">
              <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-import-danger/12 dark:text-import-danger">
                <TrashIcon className="h-6 w-6" />
              </span>

              <div className="min-w-0 flex-1">
                <h2
                  id="delete-import-title"
                  className="font-display text-xl font-semibold text-sand-900 dark:text-import-text"
                >
                  Dateiimport löschen?
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-sand-600 dark:text-[#aebed0]">
                  Möchten Sie diesen Dateiimport wirklich löschen? Der Eintrag wird aus der Historie entfernt. Diese
                  Aktion kann nicht rückgängig gemacht werden.
                  {isProcessed && " Die daraus abgeleiteten Auswertungsdaten werden dabei ebenfalls entfernt."}
                </p>

                <dl className="mt-4 grid grid-cols-[1fr_1.6fr] gap-5 rounded-[10px] border border-card-border dark:border-transparent bg-sand-50 dark:bg-[#0a2138] p-4 text-sm">
                  <div>
                    <dt className="text-sand-500 dark:text-[#7d93ac]">Zeitraum</dt>
                    <dd className="mt-0.5 font-medium text-sand-900 dark:text-import-text">{period}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-sand-500 dark:text-[#7d93ac]">Dateiname</dt>
                    <dd className="mt-0.5 truncate font-medium text-sand-900 dark:text-import-text" title={fileName}>
                      {fileName}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <form
              action={deleteDataImport}
              className="flex justify-end gap-3.5 border-t border-card-border dark:border-import-border px-6 py-4"
            >
              <input type="hidden" name="dataImportId" value={dataImportId} />
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                className="min-w-[180px] rounded-lg border border-card-border px-5 py-2.5 text-sm font-bold text-sand-800 hover:bg-sand-100 dark:border-[#31506d] dark:bg-[#091a2c] dark:text-import-text dark:hover:bg-[#0d2338] transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="min-w-[180px] rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 active:bg-rose-800 dark:bg-[linear-gradient(180deg,#ef4650,#d93642)] dark:hover:brightness-110 transition-[filter,background-color]"
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
