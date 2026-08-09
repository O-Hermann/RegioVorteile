"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDataImportMapping, confirmAndProcessDataImport } from "@/actions/data-import-mapping";
import { IGNORE_FIELD_KEY, IMPORT_FIELD_DATA_TYPE_LABELS, type ImportFieldDataType } from "@/lib/import-fields";
import { importPanelClass, importSecondaryTextClass, importIconBadgeClass } from "@/lib/import-ui";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/ui";
import { CheckCircleIcon, AlertTriangleIcon, ArrowLeftIcon, TargetIcon } from "@/components/icons";

export type MappingFieldOption = { key: string; label: string; group: string };

export type MappingColumnInitial = {
  index: number;
  header: string;
  samples: string[];
  detectedType: ImportFieldDataType;
  targetField: string | null;
  suggested: boolean;
};

type MappingState = Record<number, { targetField: string | null; suggested: boolean }>;

export function ImportMappingEditor({
  dataImportId,
  fileName,
  periodLabel,
  categoryLabel,
  columns,
  fieldGroups,
  rowCount,
  canEdit,
  initialErrorMessage,
  detailHref,
}: {
  dataImportId: string;
  fileName: string;
  periodLabel: string;
  categoryLabel: string;
  columns: MappingColumnInitial[];
  fieldGroups: { group: string; fields: MappingFieldOption[] }[];
  rowCount: number;
  canEdit: boolean;
  initialErrorMessage: string | null;
  detailHref: string;
}) {
  const router = useRouter();
  const [mapping, setMapping] = useState<MappingState>(() => {
    const initial: MappingState = {};
    for (const c of columns) initial[c.index] = { targetField: c.targetField, suggested: c.suggested };
    return initial;
  });
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<{ message: string; rowErrors: string[]; totalRowErrors: number } | null>(null);

  const total = columns.length;
  const mappingValues = useMemo(() => Object.values(mapping), [mapping]);
  const mappedCount = mappingValues.filter((m) => m.targetField && m.targetField !== IGNORE_FIELD_KEY).length;
  const ignoredCount = mappingValues.filter((m) => m.targetField === IGNORE_FIELD_KEY).length;
  const openCount = total - mappedCount - ignoredCount;
  const progressPercent = total === 0 ? 0 : Math.round(((mappedCount + ignoredCount) / total) * 100);

  const usedFields = useMemo(
    () => new Set(mappingValues.map((m) => m.targetField).filter((v): v is string => !!v && v !== IGNORE_FIELD_KEY)),
    [mappingValues],
  );

  const mappingValid = mappedCount > 0;

  function updateColumn(index: number, value: string) {
    setMapping((prev) => ({ ...prev, [index]: { targetField: value === "" ? null : value, suggested: false } }));
    setShowSummary(false);
    setProcessError(null);
  }

  function buildPayload() {
    return columns.map((c) => ({ index: c.index, sourceName: c.header, targetField: mapping[c.index]?.targetField ?? null }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    const res = await saveDataImportMapping(dataImportId, buildPayload());
    setSaving(false);
    setSaveMessage(res.status === "ok" ? "Zuordnung gespeichert." : res.message);
    router.refresh();
  }

  async function handleProcess() {
    setProcessing(true);
    setProcessError(null);
    const res = await confirmAndProcessDataImport(dataImportId, buildPayload());
    if (res.status === "ok") {
      router.push(detailHref);
      return;
    }
    setProcessing(false);
    if (res.status === "validation_error") {
      setProcessError({ message: res.message, rowErrors: res.rowErrors, totalRowErrors: res.totalRowErrors });
    } else {
      setProcessError({ message: res.message, rowErrors: [], totalRowErrors: 0 });
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">Spalten zuordnen</h1>
          <p className={`mt-2 max-w-2xl ${importSecondaryTextClass}`}>
            Ordnen Sie die Spalten Ihrer Datei den passenden Effivo-Feldern zu. Diese Zuordnung bestimmt, wie die Daten
            anschließend verarbeitet werden.
          </p>
        </div>
        <Link href={detailHref} className={secondaryButtonClass}>
          <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
          Zurück
        </Link>
      </div>

      <div className={`flex flex-wrap items-center gap-x-6 gap-y-1.5 !p-4 text-sm ${importPanelClass}`}>
        <span>
          <span className={importSecondaryTextClass}>Datei: </span>
          <span className="font-medium text-sand-900 dark:text-cockpit-heading">{fileName}</span>
        </span>
        <span>
          <span className={importSecondaryTextClass}>Zeitraum: </span>
          <span className="font-medium text-sand-900 dark:text-cockpit-heading">{periodLabel}</span>
        </span>
        <span>
          <span className={importSecondaryTextClass}>Kategorie: </span>
          <span className="font-medium text-sand-900 dark:text-cockpit-heading">{categoryLabel}</span>
        </span>
      </div>

      {!canEdit && (
        <p className="flex items-center gap-2 rounded-lg bg-sand-100 px-3 py-2.5 text-sm text-sand-700 dark:bg-white/5 dark:text-cockpit-text-secondary">
          Sie haben Leserechte für diesen Datenimport. Nur Inhaber, Unternehmensadmins und Buchhaltung können die Zuordnung ändern.
        </p>
      )}

      {initialErrorMessage && (
        <p className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertTriangleIcon className="h-4 w-4 shrink-0" />
          {initialErrorMessage}
        </p>
      )}

      <div className={`!p-4 ${importPanelClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-sand-900 dark:text-cockpit-heading">
            {mappedCount} von {total} Spalten zugeordnet
          </p>
          <p className={importSecondaryTextClass}>
            {mappedCount} zugeordnet · {ignoredCount} ignoriert · {openCount} noch offen
          </p>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-sand-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ink-500 to-ink-700 transition-all duration-300 dark:from-cockpit-accent-light dark:to-cockpit-accent-dark"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className={`!p-0 ${importPanelClass}`}>
        {columns.map((col, i) => {
          const state = mapping[col.index];
          const isSuggested = !!state?.suggested && !!state.targetField && state.targetField !== IGNORE_FIELD_KEY;
          return (
            <div
              key={col.index}
              className={`grid grid-cols-1 items-center gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1.4fr)_110px_minmax(0,1.4fr)] md:gap-4 ${
                i > 0 ? "border-t border-card-border/70 dark:border-white/5" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-sand-900 dark:text-cockpit-heading" title={col.header}>
                  {col.header || `Spalte ${col.index + 1}`}
                </p>
                <p className={`truncate text-xs ${importSecondaryTextClass}`}>
                  {col.samples.length > 0 ? col.samples.join(" · ") : "keine Beispielwerte"}
                </p>
              </div>
              <div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${importIconBadgeClass}`}>
                  {IMPORT_FIELD_DATA_TYPE_LABELS[col.detectedType]}
                </span>
              </div>
              <div>
                <select
                  value={state?.targetField ?? ""}
                  disabled={!canEdit}
                  onChange={(e) => updateColumn(col.index, e.target.value)}
                  className="w-full rounded-lg border border-card-border bg-card px-3 py-2.5 text-sm text-sand-900 transition-colors focus:border-ink-500 focus:outline-none focus:ring-2 focus:ring-ink-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-cockpit-text"
                >
                  <option value="">– bitte auswählen –</option>
                  {fieldGroups.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.fields.map((f) => (
                        <option key={f.key} value={f.key} disabled={usedFields.has(f.key) && state?.targetField !== f.key}>
                          {f.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value={IGNORE_FIELD_KEY}>Spalte ignorieren</option>
                </select>
                {isSuggested && <p className="mt-1 text-xs font-medium text-ink-600 dark:text-cockpit-accent-light">Vorgeschlagen</p>}
              </div>
            </div>
          );
        })}
      </div>

      {processError && (
        <div className="space-y-2 rounded-xl bg-rose-50 px-4 py-3.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangleIcon className="h-4 w-4 shrink-0" />
            {processError.message}
          </p>
          {processError.rowErrors.length > 0 && (
            <ul className="ml-6 list-disc space-y-0.5">
              {processError.rowErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          {processError.totalRowErrors > processError.rowErrors.length && (
            <p className="text-xs opacity-80">… und {processError.totalRowErrors - processError.rowErrors.length} weitere.</p>
          )}
        </div>
      )}

      {canEdit && showSummary && (
        <div className={`space-y-4 !p-5 ${importPanelClass}`}>
          <h2 className="font-display text-lg font-semibold text-sand-900 dark:text-cockpit-heading">Zuordnung bereit</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className={importSecondaryTextClass}>Spalten erkannt</dt>
              <dd className="font-medium text-sand-900 dark:text-cockpit-text">{total}</dd>
            </div>
            <div className="flex justify-between">
              <dt className={importSecondaryTextClass}>Spalten zugeordnet</dt>
              <dd className="font-medium text-sand-900 dark:text-cockpit-text">{mappedCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className={importSecondaryTextClass}>Spalten ignoriert</dt>
              <dd className="font-medium text-sand-900 dark:text-cockpit-text">{ignoredCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className={importSecondaryTextClass}>Datensätze werden geprüft</dt>
              <dd className="font-medium text-sand-900 dark:text-cockpit-text">{rowCount}</dd>
            </div>
          </dl>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowSummary(false)} className={secondaryButtonClass}>
              Nochmal prüfen
            </button>
            <button type="button" disabled={processing} onClick={handleProcess} className={`flex-1 !py-3 ${primaryButtonClass}`}>
              {processing ? (
                "Wird verarbeitet…"
              ) : (
                <>
                  <CheckCircleIcon className="mr-1.5 h-4 w-4" />
                  Jetzt verarbeiten
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {canEdit && !showSummary && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={saving} onClick={handleSave} className={secondaryButtonClass}>
            {saving ? "Wird gespeichert…" : "Zuordnung speichern"}
          </button>
          <button
            type="button"
            disabled={!mappingValid}
            onClick={() => setShowSummary(true)}
            className={`min-w-[240px] flex-1 !py-3 ${primaryButtonClass}`}
          >
            <TargetIcon className="mr-1.5 h-4 w-4" />
            Zuordnung bestätigen und verarbeiten
          </button>
        </div>
      )}
      {saveMessage && <p className={`text-sm ${importSecondaryTextClass}`}>{saveMessage}</p>}
    </div>
  );
}
