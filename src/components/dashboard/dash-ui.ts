// Gemeinsame Bausteine ausschliesslich fuer die Effivo-Übersicht (Dashboard-
// Startseite), 1:1 aus der vom Nutzer freigegebenen "Effivo_V12_Dashboard_
// Final.html"-Designreferenz übernommen. Bewusst eigenstaendig statt aus
// lib/import-ui.ts oder der Dashboard-Seite selbst importiert - siehe
// Kommentar zum eigenen --color-dash-*-Namensraum in globals.css: gleiche
// Idee (dunkle Effivo-Flaeche), andere Referenzdatei, andere exakte Werte,
// daher eigene Konstanten statt Wiederverwendung.
//
// Jede V12-Karte hat hier genau einen Owner (diese Datei + die jeweilige
// Komponente) statt - wie im Referenz-HTML selbst - zwoelf uebereinander
// gestapelter, sich gegenseitig ueberschreibender CSS-Versionsebenen (legacy
// -> V2 … V11.14). Der optische Endzustand ist identisch, der Code dahinter
// bewusst nicht.
export const dashCardClass =
  "rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_15px_34px_rgba(0,0,0,0.18)]";

export const dashModuleHoverClass =
  "transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-ink-400 dark:hover:border-[rgba(71,119,156,0.78)] hover:shadow-warm-lg dark:hover:shadow-[0_18px_38px_rgba(0,0,0,0.21)]";

export const dashSecondaryTextClass = "text-sand-600 dark:text-dash-text-secondary";
export const dashMutedTextClass = "text-sand-400 dark:text-dash-text-muted";

export const dashIconBoxClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-ink-700 dark:text-dash-teal bg-gradient-to-b from-ink-400/25 to-ink-400/5 dark:bg-[linear-gradient(180deg,rgba(37,216,206,0.14),rgba(37,216,206,0.07))] border border-ink-400/30 dark:border-[rgba(37,216,206,0.14)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_16px_rgba(37,216,206,0.06)]";

export const dashModuleFootClass =
  "mt-auto flex items-center justify-between gap-2 border-t border-card-border/70 dark:border-white/[0.06] pt-2 text-[11px] text-ink-600 dark:text-dash-teal";

// Akzentfarben je Fund-/Fallkategorie (Doppelzahlung=rot, Gutschrift=orange,
// Skonto=blau, Überzahlung=lila) - ein zentraler Ort statt wiederholter Hex-
// Werte in attention-list/findings-list, exakt aus der Referenz.
export const DASH_ACCENT_HEX = {
  red: "#ff625d",
  orange: "#f0a23e",
  blue: "#4f9fff",
  purple: "#aa76ff",
  green: "#32d79a",
  teal: "#25d8ce",
} as const;

export type DashAccent = keyof typeof DASH_ACCENT_HEX;
