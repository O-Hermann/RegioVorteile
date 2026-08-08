import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DATA_IMPORT_CATEGORY_LABELS,
  DATA_IMPORT_STATUS_LABELS,
  dataImportStatusBadgeClass,
  periodLabel,
} from "@/lib/data-import";
import { importPanelClass, importSecondaryTextClass, importIconGlowClass } from "@/lib/import-ui";
import { InboxIcon, EyeIcon } from "@/components/icons";

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
      <p className={`mt-2 ${importSecondaryTextClass}`}>
        Alle von Unternehmen hochgeladenen Dateien, unternehmensübergreifend.
      </p>

      {imports.length === 0 ? (
        <div className={`relative mx-auto mt-10 max-w-[820px] overflow-hidden !p-10 text-center ${importPanelClass}`}>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cockpit-accent-light/10 blur-3xl opacity-0 dark:opacity-100"
          />
          <span className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full ${importIconGlowClass}`}>
            <InboxIcon className="h-7 w-7" />
          </span>
          <h2 className="relative mt-5 font-display text-xl font-semibold text-sand-900">Noch keine Datenimporte vorhanden</h2>
          <p className={`relative mx-auto mt-2 max-w-md text-sm leading-relaxed ${importSecondaryTextClass}`}>
            Sobald Unternehmen Dateien hochladen, erscheinen sie hier unternehmensübergreifend.
          </p>
        </div>
      ) : (
        <div className={`mt-8 overflow-x-auto !p-0 ${importPanelClass}`}>
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
                  <tr
                    key={i.id}
                    className="border-t border-card-border/70 transition-colors hover:bg-sand-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-sand-900 dark:text-cockpit-text">
                      {i.company.name}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3.5 ${importSecondaryTextClass}`}>
                      {periodLabel(i.periodMonth, i.periodYear)}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3.5 ${importSecondaryTextClass}`}>
                      {DATA_IMPORT_CATEGORY_LABELS[i.category]}
                    </td>
                    <td className={`max-w-[200px] truncate px-4 py-3.5 ${importSecondaryTextClass}`}>{i.fileName}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${dataImportStatusBadgeClass(i.status)}`}>
                        {DATA_IMPORT_STATUS_LABELS[i.status]}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3.5 ${importSecondaryTextClass}`}>{uploaderName}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sand-500 dark:text-cockpit-text-weak">
                      {i.createdAt.toLocaleDateString("de-DE")} ·{" "}
                      {i.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
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
  );
}
