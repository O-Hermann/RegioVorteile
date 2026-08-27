import { CopyIcon, FileTextIcon, PercentIcon, ScaleIcon } from "@/components/icons";
import { DASH_ACCENT_HEX, type DashAccent, dashTextTitle, dashTextBody, dashTextSectionHeading, dashTextSecondarySm } from "@/components/dashboard/dash-ui";

// Kernstueck des MVP-Fokus (siehe Nutzer-Vorgabe: "wo Doppelzahlungen
// gefallen sind, wo kein Skonto beruecksichtigt wurde, wo offene
// Gutschriften sind" - Umsatz/Kosten-Uebersicht kommt bewusst erst spaeter).
// Es gibt fuer diese vier Fund-Kategorien weiterhin KEIN echtes
// Fallpruefungs-Datenmodell im Projekt (Arbeitsliste/Fallpruefung sind laut
// Aufgabenstellung explizit zukuenftige Arbeit) - die Werte sind daher
// unveraendert Referenz-Demowerte, wie zuvor bei der kompakten Listenversion
// dieser Karte. Sobald ein echtes Faelle-Modell existiert, ist
// ausschliesslich diese Datei anzupassen (ein Owner, keine Kaskaden-
// Overrides) - siehe getFindingsSummary(), das FindingsHero in page.tsx
// daraus die Gesamtsumme/-anzahl ableitet, statt sie separat zu pflegen.
export type FindingCategory = {
  key: string;
  name: string;
  desc: string;
  amount: number;
  count: number;
  accent: DashAccent;
  icon: (props: { className?: string }) => React.ReactElement;
};

export const FINDINGS: FindingCategory[] = [
  { key: "duplicate", name: "Doppelzahlungen", desc: "Rechnungen, die versehentlich doppelt oder mehrfach beglichen wurden.", amount: 42100, count: 16, accent: "red", icon: CopyIcon },
  { key: "discount", name: "Skonto nicht genutzt", desc: "Frühzahler-Rabatte, die durch verspätete Zahlung verpasst wurden.", amount: 7230, count: 8, accent: "orange", icon: PercentIcon },
  { key: "credit", name: "Offene Gutschriften", desc: "Erhaltene Gutschriften, die noch nicht mit Rechnungen verrechnet wurden.", amount: 19850, count: 11, accent: "blue", icon: FileTextIcon },
  { key: "overpayment", name: "Mögliche Überzahlung", desc: "Gezahlter Betrag weicht vom Rechnungsbetrag ab, z. B. durch Tipp- oder Rundungsfehler.", amount: 13960, count: 6, accent: "purple", icon: ScaleIcon },
];

export function getFindingsSummary() {
  return {
    totalAmount: FINDINGS.reduce((sum, f) => sum + f.amount, 0),
    totalCount: FINDINGS.reduce((sum, f) => sum + f.count, 0),
    topCategory: [...FINDINGS].sort((a, b) => b.amount - a.amount)[0],
  };
}

const ACCENT_CLASS: Record<DashAccent, string> = {
  red: "text-rose-600 border-rose-400/50 bg-rose-500/10 dark:text-dash-red dark:border-dash-red/50 dark:bg-[rgba(255,98,93,0.1)]",
  orange: "text-amber-600 border-amber-400/50 bg-amber-500/10 dark:text-dash-orange dark:border-dash-orange/50 dark:bg-[rgba(240,162,62,0.1)]",
  blue: "text-sky-600 border-sky-400/50 bg-sky-500/10 dark:text-dash-blue dark:border-dash-blue/50 dark:bg-[rgba(79,159,255,0.1)]",
  purple: "text-violet-600 border-violet-400/50 bg-violet-500/10 dark:text-dash-purple dark:border-dash-purple/50 dark:bg-[rgba(170,118,255,0.1)]",
  green: "text-emerald-600 border-emerald-400/50 bg-emerald-500/10 dark:text-dash-green dark:border-dash-green/50 dark:bg-[rgba(50,215,154,0.1)]",
  teal: "text-ink-700 border-ink-400/50 bg-ink-500/10 dark:text-dash-teal dark:border-dash-teal/50 dark:bg-[rgba(37,216,206,0.1)]",
};

export function FindingsList() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {FINDINGS.map((f) => (
        <div
          key={f.key}
          style={{ "--case-accent": DASH_ACCENT_HEX[f.accent] } as React.CSSProperties}
          className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] p-4 shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.032),0_16px_36px_rgba(0,0,0,0.19)] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[var(--case-accent)]"
        >
          <div className="flex items-start gap-2.5">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border ${ACCENT_CLASS[f.accent]}`}>
              <f.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className={`${dashTextTitle} font-bold text-sand-900 dark:text-dash-text`}>{f.name}</h3>
              <p className={`mt-0.5 ${dashTextSecondarySm} leading-snug text-sand-500 dark:text-[#89a3bb]`}>{f.desc}</p>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`font-display ${dashTextSectionHeading} font-extrabold tabular-nums text-sand-900 dark:text-dash-text`}>
              {f.amount.toLocaleString("de-DE")}&nbsp;€
            </span>
            <span className={`rounded-full border border-card-border/60 bg-sand-50 px-2 py-0.5 ${dashTextSecondarySm} font-semibold text-sand-500 dark:border-[rgba(83,121,151,0.24)] dark:bg-[rgba(5,23,41,0.55)] dark:text-[#c9dde9]`}>
              {f.count} {f.count === 1 ? "Fall" : "Fälle"}
            </span>
          </div>

          <span
            aria-disabled
            title="Noch nicht verfügbar"
            className={`mt-auto flex cursor-default items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 ${dashTextBody} font-bold ${ACCENT_CLASS[f.accent]}`}
          >
            {f.count} {f.count === 1 ? "Fall" : "Fälle"} ansehen →
          </span>
        </div>
      ))}
    </div>
  );
}
