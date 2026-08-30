"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMappingTemplate } from "@/actions/mapping-templates";
import { IGNORE_FIELD_KEY } from "@/lib/import-fields";
import type { MappingFieldOption } from "@/components/import-mapping-editor";
import { dashInputClass, dashLabelClass, dashPrimaryButtonClass } from "@/components/dashboard/dash-ui";

// MVP-Roadmap Phase 7 (siehe [[effivo_mvp_roadmap]]): bewusst ein eigenes,
// deutlich einfacheres Formular statt Wiederverwendung von
// ImportMappingEditor - jene Komponente ist fuer die Live-Zuordnung EINER
// gerade hochgeladenen Datei gebaut (Beispielwerte, automatische
// Datentyp-Erkennung aus den tatsaechlichen Zellen), eine gespeicherte
// Vorlage hat aber keine zugehoerige offene Datei mehr, nur die
// sourceName/targetField-Paare selbst - hier reicht ein einfaches Select pro
// Zeile.
export function MappingTemplateEditor({
  templateId,
  initialSourceSystem,
  columns,
  fieldGroups,
}: {
  templateId: string;
  initialSourceSystem: string | null;
  columns: { sourceName: string; targetField: string | null }[];
  fieldGroups: { group: string; fields: MappingFieldOption[] }[];
}) {
  const router = useRouter();
  const [sourceSystem, setSourceSystem] = useState(initialSourceSystem ?? "");
  const [targets, setTargets] = useState<string[]>(columns.map((c) => c.targetField ?? IGNORE_FIELD_KEY));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const payload = columns.map((c, index) => ({
        index,
        sourceName: c.sourceName,
        targetField: targets[index] === IGNORE_FIELD_KEY ? IGNORE_FIELD_KEY : targets[index],
      }));
      const result = await updateMappingTemplate(templateId, sourceSystem, payload);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={dashLabelClass} htmlFor="sourceSystem">
          Quellsystem (optional)
        </label>
        <input
          id="sourceSystem"
          type="text"
          value={sourceSystem}
          onChange={(e) => setSourceSystem(e.target.value)}
          placeholder="z. B. DATEV, Lexware …"
          className={`max-w-xs ${dashInputClass}`}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-dash-line">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-dash-panel-soft">
            <tr className="text-xs uppercase tracking-wide text-dash-text-faint">
              <th className="px-4 py-3 font-semibold">Spalte in der Quelldatei</th>
              <th className="px-4 py-3 font-semibold">Effivo-Feld</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((c, index) => (
              <tr key={`${c.sourceName}-${index}`} className="border-t border-dash-line">
                <td className="px-4 py-3 font-medium text-dash-text">{c.sourceName}</td>
                <td className="px-4 py-3">
                  <select
                    value={targets[index]}
                    onChange={(e) =>
                      setTargets((prev) => {
                        const next = [...prev];
                        next[index] = e.target.value;
                        return next;
                      })
                    }
                    className={`w-full max-w-xs ${dashInputClass}`}
                  >
                    <option value={IGNORE_FIELD_KEY}>Spalte ignorieren</option>
                    {fieldGroups.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.fields.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" disabled={isPending} onClick={handleSave} className={dashPrimaryButtonClass}>
          {isPending ? "Speichert …" : "Speichern"}
        </button>
        {saved && <span className="text-sm text-dash-green">Gespeichert.</span>}
        {error && <span className="text-sm text-dash-red">{error}</span>}
      </div>
    </div>
  );
}
