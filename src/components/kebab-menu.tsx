"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVerticalIcon } from "@/components/icons";

// Dezentes "Weitere Aktionen"-Menue fuer selten benutzte, insbesondere
// destruktive Aktionen, die nicht gleichwertig neben den Hauptbuttons stehen
// sollen (Feinschliff Teil B). Gleiches Klick-aussen-/Escape-Muster wie
// QuickActionButton/WorkspaceSwitcher.
//
// Das Panel wird per Portal direkt in document.body gerendert (Feinschliff
// Runde 4): vorher war es ein normaler DOM-Nachfahre des Triggers, wodurch
// jeder Vorfahre mit overflow != visible (z.B. ein "overflow-x-auto"-
// Tabellen-Wrapper) das nach unten aufklappende Panel abgeschnitten hat -
// das ist keine Tailwind-Eigenheit, sondern eine feste CSS-Spec-Regel
// (overflow-x auf einen Wert != visible setzt automatisch AUCH overflow-y
// auf "auto", selbst wenn overflow-y explizit auf "visible" gesetzt wird).
// Per Portal umgeht das Panel diese Vorfahren komplett; Position wird beim
// Oeffnen aus der Trigger-Bounding-Box berechnet und ueber "right" (nicht
// "left") verankert, damit es unabhaengig von seiner eigenen Breite bündig
// mit der rechten Trigger-Kante bleibt, wie zuvor per CSS "right-0".
export function KebabMenu({
  children,
  label = "Weitere Aktionen",
  panelClassName,
  triggerClassName,
}: {
  children: React.ReactNode;
  label?: string;
  // Optionale Overrides fuer das Erscheinungsbild von Trigger-Button und
  // aufklappendem Panel - Interaktionslogik (open/close, Klick-aussen,
  // Escape) bleibt fuer alle Nutzer identisch. Bestehende Aufrufer ohne
  // diese Props erhalten unveraendert das Standard-Erscheinungsbild.
  panelClassName?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    // Einfachste robuste Loesung fuer Scroll/Resize waehrend das Panel offen
    // ist: schliessen statt Position live nachzuverfolgen - ein kurz offenes
    // Aktionsmenu, das beim Scrollen verschwindet, ist unauffaelliger als
    // eines, das an der falschen Stelle "kleben" bleibt.
    function handleScrollOrResize() {
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  function toggleOpen() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={
          triggerClassName ??
          "flex h-9 w-9 items-center justify-center rounded-full border border-dash-line text-dash-text-secondary hover:bg-dash-panel-soft hover:text-dash-text transition-colors"
        }
      >
        <MoreVerticalIcon className="h-4 w-4" />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            onClick={() => setOpen(false)}
            style={{ position: "fixed", top: position.top, right: position.right, left: "auto" }}
            className={
              panelClassName ??
              "z-30 w-56 overflow-hidden rounded-2xl border border-dash-line bg-dash-panel shadow-[0_18px_42px_rgba(0,0,0,0.34)]"
            }
          >
            <div className="p-1.5">{children}</div>
          </div>,
          document.body,
        )}
    </>
  );
}
