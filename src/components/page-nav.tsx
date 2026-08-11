import { BackLink } from "@/components/back-link";
import { HomeLink } from "@/components/home-link";

// Feinschliff 6.2.1.1, Punkt 11/12: buendelt die hierarchische Zurueck-
// Navigation (optional, "backHref"/"backLabel") mit dem neuen, immer
// vorhandenen Home-Link zu einer Übersicht - Reihenfolge bewusst
// Zurueck-Button zuerst, Home-Button danach (siehe Beispiele im Auftrag:
// "[← Zurück zu Aufträgen] [Haus] Übersicht"). Auf echten Hauptseiten
// (backHref/backLabel weggelassen) erscheint ausschliesslich der Home-Link.
// Nie auf /arbeitgeber/dashboard selbst verwenden (Punkt 14).
export function PageNav({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {backHref && backLabel && <BackLink href={backHref} label={backLabel} />}
      <HomeLink />
    </div>
  );
}
