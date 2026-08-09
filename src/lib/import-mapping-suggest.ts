import type { DataImportCategory } from "@/generated/prisma/client";
import {
  IMPORT_FIELD_REGISTRY,
  normalizeColumnName,
  detectColumnDataType,
  type ImportFieldDataType,
} from "@/lib/import-fields";

// Deterministische, einfache automatische Erkennung (Punkt 13) - AUSDRÜCKLICH
// KEINE KI/LLM-Integration. Grundlage: normalisierter Spaltenname exakt gegen
// bekannte Synonyme, danach eine schwaechere Enthaelt-Heuristik, jeweils mit
// dem erkannten Beispielwert-Datentyp als Plausibilitaetsfilter. Ergebnis ist
// immer nur ein VORSCHLAG (Punkt 12/14) - nie eine endgueltige Festlegung.
export type ColumnSuggestion = {
  index: number;
  header: string;
  detectedType: ImportFieldDataType;
  suggestedFieldKey: string | null;
};

export function suggestColumnMapping(
  category: DataImportCategory,
  headers: string[],
  sampleValuesByColumn: string[][],
): ColumnSuggestion[] {
  const fields = IMPORT_FIELD_REGISTRY[category];
  const normalizedSynonyms = fields.map((f) => ({
    key: f.key,
    dataType: f.dataType,
    synonyms: f.synonyms.map(normalizeColumnName),
  }));

  const columns = headers.map((header, index) => ({
    index,
    header,
    normalized: normalizeColumnName(header),
    detectedType: detectColumnDataType(sampleValuesByColumn[index] ?? []),
  }));

  // Kandidaten je Spalte sammeln (mehrere moegliche Treffer, absteigend nach
  // Vertrauen), danach global gierig nach Konfidenz vergeben, damit ein
  // Zielfeld nicht doppelt vorgeschlagen wird (Punkt 15).
  type Candidate = { columnIndex: number; fieldKey: string; score: number };
  const candidates: Candidate[] = [];

  for (const col of columns) {
    if (!col.normalized) continue;
    for (const field of normalizedSynonyms) {
      let score = 0;
      if (field.synonyms.includes(col.normalized)) {
        score = 100;
      } else if (field.synonyms.some((syn) => syn.length >= 4 && (col.normalized.includes(syn) || syn.includes(col.normalized)))) {
        score = 40;
      }
      if (score === 0) continue;
      // Datentyp-Plausibilitaet: passt der erkannte Beispielwert-Typ nicht
      // zum erwarteten Feldtyp, wird der Kandidat abgewertet statt verworfen
      // (leere/uneindeutige Beispielwerte sollen einen sonst eindeutigen
      // Namenstreffer nicht komplett verhindern).
      if (col.detectedType !== "text" && col.detectedType !== field.dataType) {
        score -= 25;
      }
      candidates.push({ columnIndex: col.index, fieldKey: field.key, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const usedColumns = new Set<number>();
  const usedFields = new Set<string>();
  const suggestionByColumn = new Map<number, string>();
  for (const c of candidates) {
    if (c.score <= 0) continue;
    if (usedColumns.has(c.columnIndex) || usedFields.has(c.fieldKey)) continue;
    usedColumns.add(c.columnIndex);
    usedFields.add(c.fieldKey);
    suggestionByColumn.set(c.columnIndex, c.fieldKey);
  }

  return columns.map((col) => ({
    index: col.index,
    header: col.header,
    detectedType: col.detectedType,
    suggestedFieldKey: suggestionByColumn.get(col.index) ?? null,
  }));
}
