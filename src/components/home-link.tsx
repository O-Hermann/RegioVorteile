import Link from "next/link";
import { HomeIcon } from "@/components/icons";

// Feinschliff 6.2.1.1, Punkt 7/8/9: schneller, statischer Ruecksprung zur
// Effivo-Uebersicht von jeder relevanten Unterseite aus - bewusst zusaetzlich
// zur bereits bestehenden Hauptnavigation (dort steht "Übersicht" auch schon),
// dient hier aber als lokale Seitenorientierung/schneller Ausstieg aus
// tieferen Workflows. Immer /arbeitgeber/dashboard, kein router.back().
// Gleiche Button-Sprache wie BackLink, damit beide als Paar wirken.
export function HomeLink() {
  return (
    <Link
      href="/arbeitgeber/dashboard"
      className="inline-flex items-center gap-1.5 rounded-full border border-dash-line bg-dash-panel px-3.5 py-2 text-sm font-semibold text-dash-text transition-colors duration-150 hover:border-dash-gold/40 hover:bg-dash-panel-soft hover:text-dash-gold"
    >
      <HomeIcon className="h-3.5 w-3.5" />
      Übersicht
    </Link>
  );
}
