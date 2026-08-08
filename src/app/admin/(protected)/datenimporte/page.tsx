import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DATA_IMPORT_CATEGORY_LABELS,
  DATA_IMPORT_STATUS_LABELS,
  dataImportStatusBadgeClass,
  periodLabel,
} from "@/lib/data-import";
import { cardClass } from "@/lib/ui";
import { EyeIcon } from "@/components/icons";

export default async function AdminDatenimportePage() {
  await requireAdmin();

  const imports = await prisma.dataImport.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: true, uploadedByUser: true },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-sand-900">Datenimporte</h1>
      <p className="mt-2 text-sand-600 dark:text-cockpit-text-secondary">
        Alle von Unternehmen hochgeladenen Dateien, unternehmensübergreifend.
      </p>

      <div className="mt-8">
        {imports.length === 0 ? (
          <p className={`${cardClass} text-sand-500 dark:text-cockpit-text-secondary`}>
            Noch keine Datenimporte vorhanden.
          </p>
        ) : (
          <div className={`overflow-x-auto ${cardClass} !p-0`}>
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-sand-50 dark:bg-white/5">
                <tr className="text-xs uppercase tracking-wide text-sand-500 dark:text-cockpit-text-weak">
                  <th className="px-4 py-3 font-semibold">Unternehmen</th>
                  <th className="px-4 py-3 font-semibold">Zeitraum</th>
                  <th className="px-4 py-3 font-semibold">Kategorie</th>
                  <th className="px-4 py-3 font-semibold">Dateiname</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Hochgeladen von</th>
                  <th className="px-4 py-3 font-semibold">Datum</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {imports.map((i) => {
                  const uploaderName =
                    [i.uploadedByUser.firstName, i.uploadedByUser.lastName].filter(Boolean).join(" ") ||
                    i.uploadedByUser.email;
                  return (
                    <tr key={i.id} className="border-t border-card-border/70 dark:border-white/5">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-sand-900 dark:text-cockpit-text">
                        {i.company.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sand-600 dark:text-cockpit-text-secondary">
                        {periodLabel(i.periodMonth, i.periodYear)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sand-600 dark:text-cockpit-text-secondary">
                        {DATA_IMPORT_CATEGORY_LABELS[i.category]}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-sand-600 dark:text-cockpit-text-secondary">
                        {i.fileName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${dataImportStatusBadgeClass(i.status)}`}>
                          {DATA_IMPORT_STATUS_LABELS[i.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sand-600 dark:text-cockpit-text-secondary">
                        {uploaderName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sand-500 dark:text-cockpit-text-weak">
                        {i.createdAt.toLocaleDateString("de-DE")} · {i.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          href={`/admin/datenimporte/${i.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-card-border dark:border-white/15 px-3 py-1.5 text-xs font-semibold text-sand-800 dark:text-cockpit-text hover:border-ink-400 dark:hover:border-cockpit-accent-light/50 hover:text-ink-700 dark:hover:text-cockpit-accent-light transition-colors"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                          Ansehen
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
