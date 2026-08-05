"use client";

import { useEffect } from "react";

// Faengt alte/eingehende Hash-URLs ab (z.B. "/#funktionen"): scrollt beim
// Laden weich zum Zielabschnitt und entfernt den Hash danach ueber
// history.replaceState wieder aus der sichtbaren URL - ohne Neuladen und
// ohne zusaetzlichen History-Eintrag.
export function HashScrollHandler() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.slice(1);
    const timeout = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
