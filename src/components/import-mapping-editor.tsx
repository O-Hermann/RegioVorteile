"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveDataImportMapping, confirmAndProcessDataImport } from "@/actions/data-import-mapping";
import { IGNORE_FIELD_KEY, IMPORT_FIELD_DATA_TYPE_LABELS, type ImportFieldDataType } from "@/lib/import-fields";
import { dashCardClass, dashSecondaryTextClass, dashPrimaryButtonClass, dashSecondaryButtonClass } from "@/components/dashboard/dash-ui";
import { CheckCircleIcon, AlertTriangleIcon, ArrowLeftIcon, TargetIcon } from "@/components/icons";
import { PageNav } from "@/components/page-nav";

export type MappingFieldOption = { key: string; label: string; group: string };

// Herkunft einer vorbelegten Zuordnung (Punkt 3 im Feinschliff-Auftrag):
// "template" = aus einer gespeicherten DataImportMappingTemplate uebernommen,
// "suggested" = von der Synonym-/Datentyp-Heuristik vorgeschlagen, null = keine
// automatische Herkunft (manuell gewaehlt oder bereits gespeicherter Entwurf).
export type MappingColumnOrigin = "template" | "suggested" | null;

export type MappingColumnInitial = {
  index: number;
  header: string;
  samples: string[];
  detectedType: ImportFieldDataType;
  targetField: string | null;
  origin: MappingColumnOrigin;
};

type MappingState = Record<number, { targetField: string | null; origin: MappingColumnOrigin }>;

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
    for (const c of columns) initial[c.index] = { targetField: c.targetField, origin: c.origin };
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
    // Sobald der Benutzer eine Auswahl manuell aendert, gilt sie nicht mehr
    // als automatisch uebernommen - der Herkunftshinweis verschwindet
    // (ruhigere Variante statt einer zusaetzlichen "Manuell gewaehlt"-Zeile).
    setMapping((prev) => ({ ...prev, [index]: { targetField: value === "" ? null : value, origin: null } }));
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
      <PageNav backHref={detailHref} backLabel="Zurück zum Datenimport" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-dash-text">Spalten zuordnen</h1>
          <p className={`mt-2 max-w-2xl ${dashSecondaryTextClass}`}>
            Ordnen Sie die Spalten Ihrer Datei den passenden Effivo-Feldern zu. Diese Zuordnung bestimmt, wie die Daten
            anschließend verarbeitet werden.
          </p>
        </div>
        <Link href={detailHref} className={dashSecondaryButtonClass}>
          <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
          Zurück
        </Link>
      </div>

      <div className={`flex flex-wrap items-center gap-x-6 gap-y-1.5 !p-4 text-sm ${dashCardClass}`}>
        <span>
          <span className={dashSecondaryTextClass}>Datei: </span>
          <span className="font-medium text-dash-text">{fileName}</span>
        </span>
        <span>
          <span className={dashSecondaryTextClass}>Zeitraum: </span>
          <span className="font-medium text-dash-text">{periodLabel}</span>
        </span>
        <span>
          <span className={dashSecondaryTextClass}>Kategorie: </span>
          <span className="font-medium text-dash-text">{categoryLabel}</span>
        </span>
      </div>

      {!canEdit && (
        <p className="flex items-center gap-2 rounded-lg bg-dash-panel-soft px-3 py-2.5 text-sm text-dash-text-secondary">
          Sie haben Leserechte für diesen Datenimport. Nur Inhaber, Unternehmensadmins und Buchhaltung können die Zuordnung ändern.
        </p>
      )}

      {initialErrorMessage && (
        <p className="flex items-center gap-2 rounded-lg bg-dash-red-tint px-3 py-2.5 text-sm text-dash-red">
          <AlertTriangleIcon className="h-4 w-4 shrink-0" />
          {initialErrorMessage}
        </p>
      )}

      <div className={`!p-4 ${dashCardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-semibold text-dash-text">
            {mappedCount} von {total} Spalten zugeordnet
          </p>
          <p className={dashSecondaryTextClass}>
            {mappedCount} zugeordnet · {ignoredCount} ignoriert · {openCount} noch offen
          </p>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-dash-panel-soft">
          <div
            className="h-full rounded-full bg-gradient-to-r from-dash-gold-deep to-dash-gold transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className={`!p-0 ${dashCardClass}`}>
        {columns.map((col, i) => {
          const state = mapping[col.index];
          const hasActiveTarget = !!state?.targetField && state.targetField !== IGNORE_FIELD_KEY;
          const originLabel =
            hasActiveTarget && state?.origin === "template"
              ? "Aus vorheriger Zuordnung übernommen"
              : hasActiveTarget && state?.origin === "suggested"
                ? "Automatisch vorgeschlagen"
                : null;
          return (
            <div
              key={col.index}
              className={`grid grid-cols-1 items-center gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1.4fr)_110px_minmax(0,1.4fr)] md:gap-4 ${
                i > 0 ? "border-t border-dash-line" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-dash-text" title={col.header}>
                  {col.header || `Spalte ${col.index + 1}`}
                </p>
                <p className={`truncate text-xs ${dashSecondaryTextClass}`}>
                  {col.samples.length > 0 ? col.samples.join(" · ") : "keine Beispielwerte"}
                </p>
              </div>
              <div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${"bg-dash-gold-glow text-dash-gold border border-dash-gold/30"}`}>
                  {IMPORT_FIELD_DATA_TYPE_LABELS[col.detectedType]}
                </span>
              </div>
              <div>
                <select
                  value={state?.targetField ?? ""}
                  disabled={!canEdit}
                  onChange={(e) => updateColumn(col.index, e.target.value)}
                  className="w-full rounded-lg border border-dash-line bg-dash-panel px-3 py-2.5 text-sm text-dash-text transition-colors focus:border-dash-gold/50 focus:outline-none focus:ring-2 focus:ring-dash-gold/40 disabled:opacity-60"
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
                {originLabel && <p className="mt-1 text-xs font-medium text-dash-gold">{originLabel}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {processError && (
        <div className="space-y-2 rounded-xl bg-dash-red-tint px-4 py-3.5 text-sm text-dash-red">
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
        <div className={`space-y-4 !p-5 ${dashCardClass}`}>
          <h2 className="text-lg font-semibold text-dash-text">Zuordnung bereit</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className={dashSecondaryTextClass}>Spalten erkannt</dt>
              <dd className="font-medium text-dash-text">{total}</dd>
            </div>
            <div className="flex justify-between">
              <dt className={dashSecondaryTextClass}>Spalten zugeordnet</dt>
              <dd className="font-medium text-dash-text">{mappedCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className={dashSecondaryTextClass}>Spalten ignoriert</dt>
              <dd className="font-medium text-dash-text">{ignoredCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className={dashSecondaryTextClass}>Datensätze zur Verarbeitung</dt>
              <dd className="font-medium text-dash-text">{rowCount}</dd>
            </div>
          </dl>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowSummary(false)} className={dashSecondaryButtonClass}>
              Nochmal prüfen
            </button>
            <button type="button" disabled={processing} onClick={handleProcess} className={`flex-1 !py-3 ${dashPrimaryButtonClass}`}>
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
          <button type="button" disabled={saving} onClick={handleSave} className={dashSecondaryButtonClass}>
            {saving ? "Wird gespeichert…" : "Zuordnung speichern"}
          </button>
          <button
            type="button"
            disabled={!mappingValid}
            onClick={() => setShowSummary(true)}
            className={`min-w-[240px] flex-1 !py-3 ${dashPrimaryButtonClass}`}
          >
            <TargetIcon className="mr-1.5 h-4 w-4" />
            Zuordnung prüfen
          </button>
        </div>
      )}
      {saveMessage && <p className={`text-sm ${dashSecondaryTextClass}`}>{saveMessage}</p>}
    </div>
  );
}
