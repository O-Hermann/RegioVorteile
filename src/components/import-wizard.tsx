"use client";

import { useMemo, useRef, useState, useActionState } from "react";
import Link from "next/link";
import { createDataImport, previewExcelImport } from "@/actions/data-import";
import { parseCsvPreview, ImportParseError, type SpreadsheetPreview } from "@/lib/import-parse";
import {
  MONTH_LABELS_DE,
  SOURCE_SYSTEM_OPTIONS,
  DATA_IMPORT_CATEGORY_LABELS,
  DATA_IMPORT_CATEGORY_DESCRIPTIONS,
  MAX_IMPORT_FILE_SIZE_BYTES,
  MAX_IMPORT_FILE_SIZE_LABEL,
  extensionForFileName,
  fileTypeForExtension,
  formatFileSize,
  CREATE_DATA_IMPORT_IDLE_STATE,
} from "@/lib/data-import";
import { importPanelClass, importSecondaryTextClass, importIconGlowClass, importIconBadgeClass } from "@/lib/import-ui";
import { primaryButtonClass, secondaryButtonClass, labelClass, inputClass } from "@/lib/ui";
import {
  UploadIcon,
  FileTextIcon,
  XIcon,
  CheckIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
} from "@/components/icons";
import type { DataImportCategory } from "@/generated/prisma/client";

const CATEGORY_OPTIONS = Object.entries(DATA_IMPORT_CATEGORY_LABELS) as [DataImportCategory, string][];
const STEPS = ["Angaben", "Datei", "Vorschau", "Bestätigen"] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 4 + i);

const fieldClass = `${inputClass} !py-2.5 !text-[15px]`;

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className={`flex items-center ${n < STEPS.length ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                  active
                    ? importIconGlowClass
                    : done
                      ? "bg-ink-100 text-ink-700 dark:bg-cockpit-accent-subtle dark:text-cockpit-accent-light"
                      : "bg-sand-100 text-sand-400 dark:bg-white/5 dark:text-cockpit-text-weak"
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : n}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-semibold ${
                  active || done ? "text-sand-800 dark:text-cockpit-heading" : "text-sand-400 dark:text-cockpit-text-weak"
                }`}
              >
                {label}
              </span>
            </div>
            {n < STEPS.length && (
              <div
                className={`mx-2.5 mb-[18px] h-px flex-1 transition-colors duration-300 ${
                  done ? "bg-ink-300 dark:bg-cockpit-accent-light/50" : "bg-card-border dark:bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PreviewTable({ preview }: { preview: SpreadsheetPreview }) {
  const [header, ...rest] = preview.rows;
  return (
    <div className={`overflow-x-auto !p-0 ${importPanelClass}`}>
      <table className="w-full min-w-[480px] text-left text-sm">
        {header && (
          <thead className="bg-sand-50 dark:bg-white/5">
            <tr>
              {header.map((cell, i) => (
                <th key={i} className="whitespace-nowrap px-3 py-2.5 font-semibold text-sand-700 dark:text-cockpit-text">
                  {cell || `Spalte ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rest.map((row, ri) => (
            <tr key={ri} className="border-t border-card-border/70 transition-colors hover:bg-sand-50 dark:border-white/5 dark:hover:bg-white/[0.03]">
              {row.map((cell, ci) => (
                <td key={ci} className={`whitespace-nowrap px-3 py-2.5 ${importSecondaryTextClass}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ImportWizard({ companyId }: { companyId: string }) {
  const [step, setStep] = useState(1);
  const [periodMonth, setPeriodMonth] = useState(new Date().getMonth() + 1);
  const [periodYear, setPeriodYear] = useState(CURRENT_YEAR);
  const [category, setCategory] = useState<DataImportCategory>("FINANCE");
  const [sourceSystem, setSourceSystem] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SpreadsheetPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedSheetName, setSelectedSheetName] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmDuplicateInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(createDataImport, CREATE_DATA_IMPORT_IDLE_STATE);

  const fileType = useMemo(() => (file ? fileTypeForExtension(extensionForFileName(file.name)) : null), [file]);

  // XLSX wird seit Phase 3.1 ausschliesslich serverseitig geparst (exceljs
  // darf nicht ins Client-Bundle) - CSV bleibt aus reiner UX-Sicht weiterhin
  // sofort im Browser lesbar, da hierfuer keine Server-Bibliothek noetig ist
  // und die Verarbeitung ohnehin nur im eigenen Browser-Tab stattfindet.
  async function loadPreview(selectedFile: File, sheetName?: string): Promise<SpreadsheetPreview> {
    const type = fileTypeForExtension(extensionForFileName(selectedFile.name));
    if (type === "csv") {
      return parseCsvPreview(new Uint8Array(await selectedFile.arrayBuffer()));
    }
    const fd = new FormData();
    fd.append("companyId", companyId);
    fd.append("file", selectedFile);
    if (sheetName) fd.append("selectedSheetName", sheetName);
    const result = await previewExcelImport(fd);
    if (result.status === "error") throw new ImportParseError(result.message);
    return result.preview;
  }

  async function handleFile(selected: File | null) {
    setFileError(null);
    setPreview(null);
    setFile(selected);
    setConfirmDuplicate(false);
    if (!selected) return;

    if (selected.size === 0) {
      setFileError("Die Datei ist leer.");
      return;
    }
    if (selected.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      setFileError(`Die Datei ist zu groß. Maximal ${MAX_IMPORT_FILE_SIZE_LABEL}.`);
      return;
    }
    const ext = extensionForFileName(selected.name);
    const type = fileTypeForExtension(ext);
    if (!type) {
      setFileError("Dateityp nicht unterstützt. Bitte eine XLSX- oder CSV-Datei auswählen.");
      return;
    }

    setPreviewLoading(true);
    try {
      const result = await loadPreview(selected);
      setPreview(result);
      setSelectedSheetName(result.selectedSheetName);
    } catch (err) {
      setFileError(err instanceof ImportParseError ? err.message : "Die Datei konnte nicht gelesen werden.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSheetChange(sheetName: string) {
    setSelectedSheetName(sheetName);
    if (!file) return;
    setPreviewLoading(true);
    try {
      const result = await loadPreview(file, sheetName);
      setPreview(result);
    } catch (err) {
      setFileError(err instanceof ImportParseError ? err.message : "Die Datei konnte nicht gelesen werden.");
    } finally {
      setPreviewLoading(false);
    }
  }

  function removeFile() {
    handleFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const canGoToStep2 = periodMonth >= 1 && periodMonth <= 12 && periodYear >= 2000;
  const canGoToStep3 = !!file && !fileError && !!preview && !previewLoading;

  return (
    <div className="mx-auto max-w-[880px] space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">Neuer Datenimport</h1>
          <p className={`mt-2 ${importSecondaryTextClass}`}>
            Zeitraum und Kategorie festlegen, Datei hochladen und Vorschau prüfen.
          </p>
        </div>
        <Link href="/arbeitgeber/dashboard/datenimporte" className={secondaryButtonClass}>
          Abbrechen
        </Link>
      </div>

      <StepIndicator step={step} />

      <form
        ref={formRef}
        action={formAction}
        onSubmit={() => {
          // React setzt unkontrollierte Formularfelder (u.a. den nativen
          // File-Input) nach jedem Action-Dispatch zurueck - auch nach einer
          // Antwort ohne Redirect (z.B. Duplikat-Hinweis oder Validierungs-
          // fehler). Vor jedem (auch wiederholten) Absenden wird der Input
          // deshalb hier aus dem weiterhin vorhandenen React-State neu befuellt.
          if (file && fileInputRef.current) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInputRef.current.files = dt.files;
          }
        }}
        className={`!p-8 ${importPanelClass}`}
      >
        <input type="hidden" name="companyId" value={companyId} />
        <input type="hidden" name="periodMonth" value={periodMonth} />
        <input type="hidden" name="periodYear" value={periodYear} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="sourceSystem" value={sourceSystem} />
        <input type="hidden" name="selectedSheetName" value={selectedSheetName} />
        <input
          ref={confirmDuplicateInputRef}
          type="hidden"
          name="confirmDuplicate"
          value={confirmDuplicate ? "1" : "0"}
        />
        {/* Muss unabhaengig vom aktuellen Schritt gemountet bleiben - waere
            er nur innerhalb des Schritt-2-Blocks gerendert, wuerde React ihn
            beim Weiterklicken zu Schritt 3/4 unmounten und die ausgewaehlte
            Datei ginge vor dem eigentlichen Absenden verloren. */}
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".xlsx,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-sand-900">Zeitraum und Kategorie</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="periodMonth-select">
                  Monat
                </label>
                <select
                  id="periodMonth-select"
                  className={fieldClass}
                  value={periodMonth}
                  onChange={(e) => setPeriodMonth(Number(e.target.value))}
                >
                  {MONTH_LABELS_DE.map((label, i) => (
                    <option key={label} value={i + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="periodYear-select">
                  Jahr
                </label>
                <select
                  id="periodYear-select"
                  className={fieldClass}
                  value={periodYear}
                  onChange={(e) => setPeriodYear(Number(e.target.value))}
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="category-select">
                Datenkategorie
              </label>
              <select
                id="category-select"
                className={fieldClass}
                value={category}
                onChange={(e) => setCategory(e.target.value as DataImportCategory)}
              >
                {CATEGORY_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className={`mt-2 text-sm leading-snug ${importSecondaryTextClass}`}>
                {DATA_IMPORT_CATEGORY_DESCRIPTIONS[category]}
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="sourceSystem-select">
                Quellsystem <span className="font-normal text-sand-400">(optional)</span>
              </label>
              <select
                id="sourceSystem-select"
                className={fieldClass}
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
              >
                <option value="">– kein Quellsystem angeben –</option>
                {SOURCE_SYSTEM_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={!canGoToStep2}
              onClick={() => setStep(2)}
              className={`w-full !py-3 ${primaryButtonClass}`}
            >
              Weiter
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-sand-900">Datei hochladen</h2>
            <p className={`text-sm ${importSecondaryTextClass}`}>XLSX oder CSV – maximal {MAX_IMPORT_FILE_SIZE_LABEL}.</p>

            {!file && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const dropped = e.dataTransfer.files?.[0] ?? null;
                  // Der native File-Input treibt das eigentliche Form-Feld
                  // "file" - bei Drag-and-Drop muss er deshalb manuell
                  // synchronisiert werden, sonst waere er beim Absenden leer.
                  if (dropped && fileInputRef.current) {
                    const dt = new DataTransfer();
                    dt.items.add(dropped);
                    fileInputRef.current.files = dt.files;
                  }
                  handleFile(dropped);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
                  dragOver
                    ? "border-ink-400 bg-ink-50 dark:border-cockpit-accent-light/50 dark:bg-cockpit-accent-subtle/30"
                    : "border-card-border dark:border-white/15 hover:border-ink-300 dark:hover:border-cockpit-accent-light/30"
                }`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cockpit-accent-light/10 blur-3xl opacity-0 dark:opacity-100"
                />
                <span className={`relative flex h-16 w-16 items-center justify-center rounded-full ${importIconGlowClass}`}>
                  <UploadIcon className="h-7 w-7" />
                </span>
                <div className="relative">
                  <p className="text-sm font-semibold text-sand-800 dark:text-cockpit-text">
                    Datei hierher ziehen oder klicken zum Auswählen
                  </p>
                  <p className={`mt-1 text-xs ${importSecondaryTextClass}`}>XLSX oder CSV · maximal {MAX_IMPORT_FILE_SIZE_LABEL}</p>
                </div>
              </div>
            )}

            {file && (
              <div
                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${
                  fileError ? "border-rose-300 bg-rose-50 dark:border-rose-400/30 dark:bg-rose-500/10" : "border-card-border dark:border-white/10"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${importIconBadgeClass}`}>
                    <FileTextIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-sand-900 dark:text-cockpit-heading">{file.name}</p>
                    <p className={`text-xs ${importSecondaryTextClass}`}>
                      {(fileType ?? extensionForFileName(file.name).slice(1)).toUpperCase()} · {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="shrink-0 rounded-full p-2 text-sand-400 hover:bg-sand-100 hover:text-sand-700 dark:hover:bg-white/10"
                  aria-label="Datei entfernen"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            {previewLoading && (
              <p className={`flex items-center gap-2 text-sm ${importSecondaryTextClass}`}>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-300 border-t-ink-600 dark:border-white/20 dark:border-t-cockpit-accent-light" />
                Vorschau wird geladen…
              </p>
            )}

            {fileError && (
              <p className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                {fileError}
              </p>
            )}

            {preview && preview.sheetNames.length > 1 && (
              <div>
                <label className={labelClass} htmlFor="sheet-select">
                  Tabellenblatt
                </label>
                <select
                  id="sheet-select"
                  className={fieldClass}
                  value={selectedSheetName}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  disabled={previewLoading}
                >
                  {preview.sheetNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className={`!py-3 ${secondaryButtonClass}`}>
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Zurück
              </button>
              <button
                type="button"
                disabled={!canGoToStep3}
                onClick={() => setStep(3)}
                className={`flex-1 !py-3 ${primaryButtonClass}`}
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {step === 3 && preview && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-sand-900">Vorschau</h2>
            <p className={`text-sm leading-relaxed ${importSecondaryTextClass}`}>
              Erste {Math.min(preview.rows.length - 1, 9)} Datenzeilen von {preview.rowCount} · {preview.columnCount} Spalten.
              Dies ist eine rein technische Vorschau der vorhandenen Werte, noch keine Zuordnung zu Effivo-Kennzahlen.
            </p>
            <PreviewTable preview={preview} />
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className={`!py-3 ${secondaryButtonClass}`}>
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Zurück
              </button>
              <button type="button" onClick={() => setStep(4)} className={`flex-1 !py-3 ${primaryButtonClass}`}>
                Weiter
              </button>
            </div>
          </div>
        )}

        {step === 4 && file && (
          <div className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-sand-900">Bestätigen</h2>

            <dl className={`space-y-3 !p-5 text-sm ${importPanelClass}`}>
              <div className="flex justify-between gap-3">
                <dt className={importSecondaryTextClass}>Zeitraum</dt>
                <dd className="font-semibold text-sand-900 dark:text-cockpit-heading">
                  {MONTH_LABELS_DE[periodMonth - 1]} {periodYear}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className={importSecondaryTextClass}>Kategorie</dt>
                <dd className="font-semibold text-sand-900 dark:text-cockpit-heading">{DATA_IMPORT_CATEGORY_LABELS[category]}</dd>
              </div>
              {sourceSystem && (
                <div className="flex justify-between gap-3">
                  <dt className={importSecondaryTextClass}>Quellsystem</dt>
                  <dd className="font-semibold text-sand-900 dark:text-cockpit-heading">{sourceSystem}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className={importSecondaryTextClass}>Datei</dt>
                <dd className="truncate font-semibold text-sand-900 dark:text-cockpit-heading">{file.name}</dd>
              </div>
              {selectedSheetName && (
                <div className="flex justify-between gap-3">
                  <dt className={importSecondaryTextClass}>Tabellenblatt</dt>
                  <dd className="font-semibold text-sand-900 dark:text-cockpit-heading">{selectedSheetName}</dd>
                </div>
              )}
            </dl>

            {state.status === "duplicate" && (
              <div className="space-y-3 rounded-xl bg-gold-100 px-4 py-3.5 text-sm text-gold-700">
                <p className="flex items-center gap-2 font-medium">
                  <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                  {state.message}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDuplicate(true);
                    // setState() ist asynchron/gebatcht - requestSubmit()
                    // liest den DOM aber synchron, noch vor dem naechsten
                    // Render. Der versteckte Input wird deshalb hier direkt
                    // gesetzt, statt auf den React-Re-Render zu warten.
                    if (confirmDuplicateInputRef.current) confirmDuplicateInputRef.current.value = "1";
                    formRef.current?.requestSubmit();
                  }}
                  className={secondaryButtonClass}
                >
                  Trotzdem importieren
                </button>
              </div>
            )}
            {state.status === "error" && (
              <p className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                {state.message}
              </p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className={`!py-3 ${secondaryButtonClass}`}>
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Zurück
              </button>
              <button type="submit" disabled={isPending} className={`flex-1 !py-3 ${primaryButtonClass}`}>
                {isPending ? (
                  "Wird gespeichert…"
                ) : (
                  <>
                    <CheckCircleIcon className="mr-1.5 h-4 w-4" />
                    Datenimport speichern
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
