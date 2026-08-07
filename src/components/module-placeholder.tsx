import Link from "next/link";
import { cardClass, primaryButtonClass } from "@/lib/ui";

export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
  showImportCta = true,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  showImportCta?: boolean;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className={`${cardClass} max-w-lg text-center`}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/30">
          <Icon className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-sand-900">{title}</h1>
        <p className="mt-2 text-sm text-sand-500 dark:text-cockpit-text-secondary">{description}</p>
        {showImportCta && (
          <Link
            href="/arbeitgeber/dashboard/datenimporte"
            className={`mt-5 inline-flex ${primaryButtonClass}`}
          >
            Datenimport starten
          </Link>
        )}
      </div>
    </div>
  );
}
