import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

// Wiederverwendbarer, dezenter Zurueck-Link fuer Unterseiten (Feinschliff
// Teil A) - bewusst kein grosser Button, damit er sich der Haupt-Ueberschrift
// unterordnet. Wird oberhalb des Seitentitels platziert.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-500 hover:text-ink-700 dark:text-cockpit-text-secondary dark:hover:text-cockpit-accent-light transition-colors"
    >
      <ArrowLeftIcon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
