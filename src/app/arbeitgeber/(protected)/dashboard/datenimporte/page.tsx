import { requireCompanyMember } from "@/lib/auth";
import { cardClass } from "@/lib/ui";
import { UploadIcon } from "@/components/icons";

export default async function DatenimportePage() {
  await requireCompanyMember();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className={`${cardClass} max-w-lg text-center`}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/30">
          <UploadIcon className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-sand-900">Datenimporte</h1>
        <p className="mt-2 text-sm text-sand-500 dark:text-cockpit-text-secondary">
          Datenimporte werden als Nächstes eingerichtet. Bald können Sie hier Excel- oder
          CSV-Dateien für einen Monatszeitraum hochladen und automatisch auswerten lassen.
        </p>
      </div>
    </div>
  );
}
