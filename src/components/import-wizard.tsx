"use client";

import { useMemo, useRef, useState, useActionState } from "react";
import Link from "next/link";
import { createDataImport } from "@/actions/data-import";
import { parseSpreadsheetPreview, ImportParseError, type SpreadsheetPreview } from "@/lib/import-parse";
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
import { cardClass, primaryButtonClass, secondaryButtonClass, labelClass, inputClass } from "@/lib/ui";
import { UploadIcon, FileTextIcon, XIcon, CheckCircleIcon, AlertTriangleIcon, ArrowLeftIcon } from "@/components/icons";
import type { DataImportCategory } from "@/generated/prisma/client";

const CATEGORY_OPTIONS = Object.entries(DATA_IMPORT_CATEGORY_LABELS) as [DataImportCategory, string][];
const STEPS = ["Angaben", "Datei", "Vorschau", "Bestätigen"] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 4 + i);

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${
                active
                  ? "bg-ink-600 text-white dark:bg-cockpit-accent-light dark:text-cockpit-header"
                  : done
                    ? "bg-ink-100 text-ink-700 dark:bg-cockpit-accent-subtle dark:text-cockpit-accent-light"
                    : "bg-sand-100 text-sand-400 dark:bg-white/5 dark:text-cockpit-text-weak"
              }`}
            >
              {n} · {label}
            </span>
            {n < STEPS.length && <span className="h-px w-4 bg-card-border dark:bg-white/10" />}
          </div>
        );
      })}
    </div>
  );
}

function PreviewTable({ preview }: { preview: SpreadsheetPreview }) {
  const [header, ...rest] = preview.rows;
  return (
    <div className="overflow-x-auto rounded-xl border border-card-border dark:border-white/10">
      <table className="w-full min-w-[480px] text-left text-sm">
        {header && (
          <thead className="bg-sand-50 dark:bg-white/5">
            <tr>
              {header.map((cell, i) => (
                <th key={i} className="whitespace-nowrap px-3 py-2 font-semibold text-sand-700 dark:text-cockpit-text">
                  {cell || `Spalte ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rest.map((row, ri) => (
            <tr key={ri} className="border-t border-card-border/70 dark:border-white/5">
              {row.map((cell, ci) => (
                <td key={ci} className="whitespace-nowrap px-3 py-2 text-sand-600 dark:text-cockpit-text-secondary">
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
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<SpreadsheetPreview | null>(null);
  const [selectedSheetName, setSelectedSheetName] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmDuplicateInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(createDataImport, CREATE_DATA_IMPORT_IDLE_STATE);

  const fileType = useMemo(() => (file ? fileTypeForExtension(extensionForFileName(file.name)) : null), [file]);

  async function handleFile(selected: File | null) {
    setFileError(null);
    setPreview(null);
    setFile(selected);
    setFileBytes(null);
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
      setFileError("Dateityp nicht unterstützt. Bitte eine XLSX-, XLS- oder CSV-Datei auswählen.");
      return;
    }

    try {
      const buffer = new Uint8Array(await selected.arrayBuffer());
      setFileBytes(buffer);
      const result = parseSpreadsheetPreview(buffer, type);
      setPreview(result);
      setSelectedSheetName(result.selectedSheetName);
    } catch (err) {
      setFileError(err instanceof ImportParseError ? err.message : "Die Datei konnte nicht gelesen werden.");
    }
  }

  function handleSheetChange(sheetName: string) {
    setSelectedSheetName(sheetName);
    if (!fileBytes || !fileType || fileType === "csv") return;
    try {
      const result = parseSpreadsheetPreview(fileBytes, fileType, sheetName);
      setPreview(result);
    } catch (err) {
      setFileError(err instanceof ImportParseError ? err.message : "Die Datei konnte nicht gelesen werden.");
    }
  }

  function removeFile() {
    handleFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const canGoToStep2 = periodMonth >= 1 && periodMonth <= 12 && periodYear >= 2000;
  const canGoToStep3 = !!file && !fileError && !!preview;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sand-900">Neuer Datenimport</h1>
          <p className="mt-2 text-sand-600 dark:text-cockpit-text-secondary">
            Zeitraum und Kategorie festlegen, Datei hochladen und die Vorschau bestätigen.
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
        className={`${cardClass} max-w-2xl`}
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
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-sand-900">Zeitraum und Kategorie</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="periodMonth-select">
                  Monat
                </label>
                <select
                  id="periodMonth-select"
                  className={inputClass}
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
                  className={inputClass}
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
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value as DataImportCategory)}
              >
                {CATEGORY_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-sand-500 dark:text-cockpit-text-weak">
                {DATA_IMPORT_CATEGORY_DESCRIPTIONS[category]}
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="sourceSystem-select">
                Quellsystem <span className="font-normal text-sand-400">(optional)</span>
              </label>
              <select
                id="sourceSystem-select"
                className={inputClass}
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
              className={`w-full ${primaryButtonClass}`}
            >
              Weiter
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-sand-900">Datei hochladen</h2>
            <p className="text-sm text-sand-500 dark:text-cockpit-text-secondary">
              XLSX, XLS oder CSV – maximal {MAX_IMPORT_FILE_SIZE_LABEL}.
            </p>

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
                className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  dragOver
                    ? "border-ink-400 bg-ink-50 dark:border-cockpit-accent-light/50 dark:bg-cockpit-accent-subtle/30"
                    : "border-card-border dark:border-white/15 hover:border-ink-300 dark:hover:border-cockpit-accent-light/30"
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/30">
                  <UploadIcon className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-sand-800 dark:text-cockpit-text">
                  Datei hierher ziehen oder klicken zum Auswählen
                </p>
              </div>
            )}

            {file && (
              <div className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${fileError ? "border-rose-300 bg-rose-50 dark:border-rose-400/30 dark:bg-rose-500/10" : "border-card-border dark:border-white/10"}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/30">
                    <FileTextIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-sand-900">{file.name}</p>
                    <p className="text-xs text-sand-500 dark:text-cockpit-text-weak">
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
                  className={inputClass}
                  value={selectedSheetName}
                  onChange={(e) => handleSheetChange(e.target.value)}
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
              <button type="button" onClick={() => setStep(1)} className={secondaryButtonClass}>
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Zurück
              </button>
              <button
                type="button"
                disabled={!canGoToStep3}
                onClick={() => setStep(3)}
                className={`flex-1 ${primaryButtonClass}`}
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {step === 3 && preview && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-sand-900">Vorschau</h2>
            <p className="text-sm text-sand-500 dark:text-cockpit-text-secondary">
              Erste {Math.min(preview.rows.length - 1, 9)} Datenzeilen von {preview.rowCount} · {preview.columnCount} Spalten.
              Dies ist eine rein technische Vorschau der vorhandenen Werte, noch keine Zuordnung zu Effivo-Kennzahlen.
            </p>
            <PreviewTable preview={preview} />
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className={secondaryButtonClass}>
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Zurück
              </button>
              <button type="button" onClick={() => setStep(4)} className={`flex-1 ${primaryButtonClass}`}>
                Weiter
              </button>
            </div>
          </div>
        )}

        {step === 4 && file && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-sand-900">Bestätigen</h2>

            <dl className="space-y-2 rounded-xl border border-card-border dark:border-white/10 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-sand-500 dark:text-cockpit-text-secondary">Zeitraum</dt>
                <dd className="font-medium text-sand-900 dark:text-cockpit-text">
                  {MONTH_LABELS_DE[periodMonth - 1]} {periodYear}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-sand-500 dark:text-cockpit-text-secondary">Kategorie</dt>
                <dd className="font-medium text-sand-900 dark:text-cockpit-text">{DATA_IMPORT_CATEGORY_LABELS[category]}</dd>
              </div>
              {sourceSystem && (
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-500 dark:text-cockpit-text-secondary">Quellsystem</dt>
                  <dd className="font-medium text-sand-900 dark:text-cockpit-text">{sourceSystem}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-sand-500 dark:text-cockpit-text-secondary">Datei</dt>
                <dd className="truncate font-medium text-sand-900 dark:text-cockpit-text">{file.name}</dd>
              </div>
              {selectedSheetName && (
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-500 dark:text-cockpit-text-secondary">Tabellenblatt</dt>
                  <dd className="font-medium text-sand-900 dark:text-cockpit-text">{selectedSheetName}</dd>
                </div>
              )}
            </dl>

            {state.status === "duplicate" && (
              <div className="space-y-3 rounded-lg bg-gold-100 px-3 py-3 text-sm text-gold-700">
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
              <button type="button" onClick={() => setStep(3)} className={secondaryButtonClass}>
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Zurück
              </button>
              <button type="submit" disabled={isPending} className={`flex-1 ${primaryButtonClass}`}>
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
