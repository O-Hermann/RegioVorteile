import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

// Feinschliff 6.2.1.1, Punkt 10: von einem reinen Text-Link zu einem
// kompakten Outline-Button aufgewertet (wirkte vorher fast wie Fliesstext) -
// bewusst weiterhin klein/zurueckhaltend, kein Primaerbutton. Gleiche
// Button-Sprache wie HomeLink (siehe dort), damit beide als zusammengehoeriges
// Navigations-Paar wirken.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded-full border border-dash-line bg-dash-panel px-3.5 py-2 text-sm font-semibold text-dash-text transition-colors duration-150 hover:border-dash-gold/40 hover:bg-dash-panel-soft hover:text-dash-gold"
    >
      <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
      {label}
    </Link>
  );
}
