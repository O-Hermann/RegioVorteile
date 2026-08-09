"use client";

import { useState } from "react";
import { formatEuroDetailed } from "@/lib/finance-format";
import { STATUS_LABELS_DE, type CanonicalPaymentStatus } from "@/lib/import-fields";
import { importPanelClass, importSecondaryTextClass } from "@/lib/import-ui";
import { secondaryButtonClass } from "@/lib/ui";

// Reine Anzeigekomponente - erhaelt bereits als Zahl aggregierte Betraege
// (nie Prisma.Decimal direkt, siehe Kommentar in revenue-line-chart.tsx).
export type InvoiceRowView = {
  id: string;
  referenceNumber: string | null;
  invoiceDate: Date | null;
  customer: string | null;
  netAmount: number | null;
  grossAmount: number | null;
  status: string | null;
  statusRaw: string | null;
  dueDate: Date | null;
  // Serverseitig berechneter Anzeigestatus (Phase 5.2.1) - z.B. eine als
  // OPEN importierte, inzwischen faellige Rechnung erscheint hier als
  // OVERDUE. Fuer den Badge WIRD dieser Wert verwendet, nicht "status".
  displayStatus: string | null;
};

const PAGE_SIZE = 10;

// Dezente, zum Effivo-Design passende Statusfarben (Punkt 8) - bewusst keine
// grellen Ampelfarben, gleiche Zurueckhaltung wie die bestehenden
// DataImport-Status-Badges.
const STATUS_BADGE_CLASSES: Record<CanonicalPaymentStatus, string> = {
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  OPEN: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  OVERDUE: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  PARTIALLY_PAID: "bg-gold-100 text-gold-700 dark:bg-amber-500/10 dark:text-amber-300",
  CANCELED: "bg-sand-200 text-sand-700 dark:bg-white/5 dark:text-cockpit-text-weak",
};

function isCanonicalStatus(status: string | null): status is CanonicalPaymentStatus {
  return !!status && status in STATUS_BADGE_CLASSES;
}

function StatusBadge({ status, statusRaw }: { status: string | null; statusRaw: string | null }) {
  if (isCanonicalStatus(status)) {
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}>
        {STATUS_LABELS_DE[status]}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-sand-200 px-2.5 py-1 text-xs font-medium text-sand-700 dark:bg-white/5 dark:text-cockpit-text-weak">
      {statusRaw?.trim() || "—"}
    </span>
  );
}

export function InvoiceTable({ invoices }: { invoices: InvoiceRowView[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (invoices.length === 0) {
    return <p className={`text-sm ${importSecondaryTextClass}`}>Für diesen Monat liegen keine Rechnungen vor.</p>;
  }

  const visible = invoices.slice(0, visibleCount);
  const remaining = invoices.length - visible.length;

  return (
    <div>
      <div className={`overflow-x-auto !p-0 ${importPanelClass}`}>
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-sand-50 dark:bg-white/5">
            <tr className="text-xs uppercase tracking-wide text-sand-500 dark:text-cockpit-text-weak">
              <th className="px-4 py-3 font-semibold">Rechnungsnummer</th>
              <th className="px-4 py-3 font-semibold">Rechnungsdatum</th>
              <th className="px-4 py-3 font-semibold">Kunde</th>
              <th className="px-4 py-3 text-right font-semibold">Netto</th>
              <th className="px-4 py-3 text-right font-semibold">Brutto</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Fällig am</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((inv) => (
              <tr
                key={inv.id}
                className="border-t border-card-border/70 transition-colors hover:bg-sand-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-sand-900 dark:text-cockpit-text">
                  {inv.referenceNumber ?? "—"}
                </td>
                <td className={`whitespace-nowrap px-4 py-3 ${importSecondaryTextClass}`}>
                  {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString("de-DE") : "—"}
                </td>
                <td className={`max-w-[220px] truncate px-4 py-3 ${importSecondaryTextClass}`}>{inv.customer ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sand-900 dark:text-cockpit-text">
                  {formatEuroDetailed(inv.netAmount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-sand-900 dark:text-cockpit-text">
                  {formatEuroDetailed(inv.grossAmount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={inv.displayStatus} statusRaw={inv.statusRaw} />
                </td>
                <td className={`whitespace-nowrap px-4 py-3 ${importSecondaryTextClass}`}>
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("de-DE") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {remaining > 0 && (
        <button type="button" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className={`mt-3 ${secondaryButtonClass}`}>
          Weitere anzeigen ({remaining} weitere)
        </button>
      )}
    </div>
  );
}
