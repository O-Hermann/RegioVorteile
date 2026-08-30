import Link from "next/link";
import { requireCompanyMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COMPANY_IMPORT_UPLOAD_ROLES } from "@/lib/company";
import { DATA_IMPORT_CATEGORY_LABELS, DATA_IMPORT_STATUS_LABELS, periodLabel, formatFileSize } from "@/lib/data-import";
import { dashCardClass, dashPrimaryButtonClass, dashSecondaryTextClass, dashIconGlowClass } from "@/components/dashboard/dash-ui";
import { UploadIcon } from "@/components/icons";
import { PageNav } from "@/components/page-nav";
import { ImportHistoryTable, type ImportRow } from "@/components/data-import/import-history-table";

export default async function DatenimportePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string }>;
}) {
  const { company, membership } = await requireCompanyMember();
  const { error, deleted } = await searchParams;
  const canUpload = COMPANY_IMPORT_UPLOAD_ROLES.includes(membership.role);

  const imports = await prisma.dataImport.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    include: { uploadedByUser: true },
  });

  const rows: ImportRow[] = imports.map((i) => ({
    id: i.id,
    period: periodLabel(i.periodMonth, i.periodYear),
    periodSortKey: i.periodYear * 12 + i.periodMonth,
    category: i.category,
    categoryLabel: DATA_IMPORT_CATEGORY_LABELS[i.category],
    fileName: i.fileName,
    status: i.status,
    statusLabel: DATA_IMPORT_STATUS_LABELS[i.status],
    uploaderName:
      [i.uploadedByUser.firstName, i.uploadedByUser.lastName].filter(Boolean).join(" ") || i.uploadedByUser.email,
    dateLabel: `${i.createdAt.toLocaleDateString("de-DE")} · ${i.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`,
    createdAtMs: i.createdAt.getTime(),
    sizeLabel: formatFileSize(i.fileSize),
    isProcessed: i.status === "PROCESSED",
  }));

  return (
    <div>
      <PageNav />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-dash-text">Datenimporte</h1>
          <p className={`mt-2 max-w-xl ${dashSecondaryTextClass}`}>
            Verwalten Sie Ihre hochgeladenen Unternehmensdaten und verfolgen Sie deren Verarbeitungsstatus.
          </p>
        </div>
        {canUpload && (
          <Link href="/arbeitgeber/dashboard/datenimporte/neu" className={dashPrimaryButtonClass}>
            + Neuer Datenimport
          </Link>
        )}
      </div>

      {error === "forbidden" && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          Für diese Aktion fehlt Ihnen die notwendige Berechtigung.
        </p>
      )}
      {error === "not-found" && (
        <p className="mt-4 rounded-lg bg-dash-red-tint px-3 py-2 text-sm text-dash-red">
          Dieser Datenimport wurde nicht gefunden. Möglicherweise wurde er bereits gelöscht.
        </p>
      )}
      {deleted === "1" && (
        <p className="mt-4 rounded-lg bg-dash-green-tint px-3 py-2 text-sm text-dash-green">
          Der Datenimport wurde gelöscht.
        </p>
      )}

      {imports.length === 0 ? (
        <div className={`relative mx-auto mt-10 max-w-[820px] overflow-hidden !p-10 text-center ${dashCardClass}`}>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-dash-gold/[0.08] blur-3xl"
          />
          <span className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full ${dashIconGlowClass}`}>
            <UploadIcon className="h-7 w-7" />
          </span>
          <h2 className="relative mt-5 text-xl font-semibold text-dash-text">Noch keine Datenimporte</h2>
          <p className={`relative mx-auto mt-2 max-w-md text-sm leading-relaxed ${dashSecondaryTextClass}`}>
            {canUpload
              ? "Laden Sie Ihre erste Excel- oder CSV-Datei hoch. Effivo zeigt Ihnen zunächst eine Vorschau und bereitet die Daten anschließend für die Zuordnung vor."
              : "Sobald ein Datenimport hochgeladen wurde, erscheint er hier mit Zeitraum, Kategorie und Status."}
          </p>
          {canUpload && (
            <Link href="/arbeitgeber/dashboard/datenimporte/neu" className={`relative mt-5 inline-flex ${dashPrimaryButtonClass}`}>
              Ersten Datenimport starten
            </Link>
          )}
          <p className={`relative mt-4 text-xs ${dashSecondaryTextClass}`}>XLSX und CSV · maximal 10 MB</p>
        </div>
      ) : (
        <ImportHistoryTable rows={rows} canUpload={canUpload} />
      )}
    </div>
  );
}
