import { Inter } from "next/font/google";

// Gemeinsame Bausteine fuer das Goldstandard-Design-System. Ursprung
// 2026-08-30: zunaechst ausschliesslich fuer die Effivo-Übersicht
// (Dashboard-Startseite) entwickelt, ersetzte dort die bisherige Teal/
// Libre-Franklin-Optik aus dem V12-Port (siehe
// [[controlling_cockpit_v12_dashboard_port]]) - der Nutzer wollte explizit
// eine komplett neue, eigenstaendige Design-Sprache statt der bisherigen
// Teal-Uebernahme oder der schlichteren App-Standard-Optik. Entstanden aus
// mehreren Iterationsrunden an einem eigenstaendigen HTML-Mockup (als
// Artifact "Effivo Goldstandard" freigegeben) - siehe [[effivo_mvp_roadmap]]
// fuer den vollen Verlauf der Design-Entscheidungen (Farben, Typografie,
// Hover-Zustaende, Animationen).
//
// Phase 2 (2026-08-30): app-weiter Rollout auf die geteilte Navigation
// (layout.tsx/employer-nav.tsx) sowie Datenimporte/Kunden/Auftraege/Faelle/
// Benutzer - alles innerhalb der Arbeitgeber-App (/arbeitgeber/...), NICHT
// Admin/Mitarbeiter/die oeffentliche Startseite (jeweils eigene
// Design-Systeme, siehe globals.css). Die generischen Listen-/Formular-
// Bausteine dafuer (dashInputClass, dashPrimaryButtonClass, ...) stehen
// weiter unten in diesem File, als Goldstandard-Pendant zu lib/ui.ts und
// lib/import-ui.ts - bewusst NICHT durch Aendern jener beiden Dateien
// erreicht, da beide auch von Admin-Seiten genutzt werden.

// Inter statt Libre Franklin/Public Sans - explizite Vorgabe aus der
// Design-Spezifikation, die der Nutzer als Ausgangspunkt vorgegeben hat
// ("Schriftfamilie: Inter / Manrope / Plus Jakarta Sans - empfohlen:
// Inter"). Eine einzige Familie fuer Display UND Fliesstext (nur andere
// Schriftschnitte), nicht wie zuvor zwei verschiedene Fonts gepaart.
const dashFont = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dash-body" });
// "dash-scope" traegt die h1-h4-Ueberschriften-Ueberschreibung aus
// globals.css (unlayered-Cascade-Layer-Grund, siehe Kommentar dort - eine
// reine Tailwind-Utility-Klasse auf dem Element allein reicht nicht, um die
// globale bare-Selector-Regel zu schlagen).
export const dashFontScopeClass = `dash-scope ${dashFont.variable} font-[family-name:var(--font-dash-body)]`;
export const dashFontDisplayClass = "font-[family-name:var(--font-dash-body)]";

// 12px Radius, 1px Border, weicher Schatten - exakt aus der Design-
// Spezifikation uebernommen (vorher 16px/20px Radius, staerkere Schatten).
export const dashCardClass =
  "rounded-xl border border-dash-line bg-dash-panel shadow-[0_1px_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.35)] transition-[transform,border-color,box-shadow] duration-200";

export const dashModuleHoverClass =
  "hover:-translate-y-[3px] hover:border-dash-gold/40 hover:shadow-[0_1px_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.35),0_10px_24px_rgba(226,188,107,0.14)]";

export const dashSecondaryTextClass = "text-dash-text-secondary";
export const dashMutedTextClass = "text-dash-text-muted";

// Gold-getoente Icon-Box (ersetzt die bisherige Teal-Variante) - Standard-
// Icon-Behandlung fuer Kartenkoepfe (Pruefstatus, Datenstatus, Donut).
export const dashIconBoxClass = "flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl text-dash-gold bg-dash-gold-glow";

export const dashModuleFootClass =
  "mt-auto flex items-center justify-between gap-2 border-t border-dash-line pt-4 text-[13px] font-semibold text-dash-gold cursor-pointer transition-colors hover:text-dash-gold-deep";

// Vier Fund-Kategorien-Akzente, 1:1 aus der Design-Spezifikation (jeweils
// eigene, klar unterscheidbare Farbe statt der bisherigen generischen
// Ampel-Mischung): Doppelzahlungen = Rubinrot, Skonto = Grasgruen (daher
// buildFindings() in findings-list.tsx: accent "green" statt vormals
// "orange" - der Schluesselname aendert sich, der Farbwert war ohnehin nie
// an den Namen gebunden), Gutschriften = Himmelblau, Ueberzahlung =
// Amethyst. "orange"/"teal" gibt es im Mockup nicht als eigene
// Kategoriefarbe (nur die vier oben) - fuer die uebrigen Verwendungsstellen
// (Handlungsbedarf-Warnungen, "neutrale" Aktivitaets-Icons) bewusst auf das
// Marken-Gold gemappt statt eine fuenfte/sechste, im Mockup nicht
// vorgesehene Farbe zu erfinden.
export const DASH_ACCENT_HEX = {
  red: "#EF5878",
  green: "#6FBD5C",
  blue: "#3FA9DE",
  purple: "#B15FD1",
  orange: "#E2BC6B",
  teal: "#E2BC6B",
} as const;

export type DashAccent = keyof typeof DASH_ACCENT_HEX;

// Feste Groessen statt der bisherigen dvh-basierten clamp()-Skalierung -
// die Design-Spezifikation gibt eine exakte Typografie-Skala vor (H1
// 40/48, H3 20/28 fuer Kartentitel, Body 14/20, Label 12/16, Caption
// 11/14), keine Notwendigkeit mehr fuer Viewport-Hoehen-Anpassung.
export const dashTextTitle = "text-[20px] leading-[28px]"; // Kartentitel (Pruefstatus, Pruefuebersicht, Datenstatus, Fund-Karten)
export const dashTextSectionHeading = "text-[20px] leading-[28px]"; // Handlungsbedarf/Letzte-Aktivitaeten-Titel, Funde-Potenzialwert-Kontext
export const dashTextValue = "text-[23px]"; // KPI-Hauptwerte (linke Spalte, eingefroren)
export const dashTextDonutNumber = "text-[24px]"; // Zahl im Pruefuebersicht-Donut
export const dashTextBody = "text-[13px] leading-[18px]"; // Fliesstext: Legende, Funde-Namen, Aktivitaetstitel, Fallzeilen
export const dashTextBodyLg = "text-[14px] leading-[20px]"; // etwas groesserer Fliesstext (Fallbetraege, Statuszeilen)
export const dashTextKpiLabel = "text-[12.75px]"; // KPI-Bezeichnungen (linke Spalte, eingefroren)
export const dashTextSecondary = "text-[11.25px]"; // Sekundaertext (linke Spalte, eingefroren)
export const dashTextSecondaryLg = "text-[12px]"; // Sekundaertext Mitte/rechts (Deltas, Zeitstempel, Beschreibungen)
export const dashTextSecondarySm = "text-[11px]"; // kleinste Labels/Eyebrows
export const dashDonutSizeClass = "h-[136px] w-[136px]"; // Durchmesser Pruefuebersicht-Donut
export const dashDonutInsetClass = "inset-[20px]"; // Ringbreite des Donuts
export const dashDonutColClass = "grid-cols-[136px_1fr]"; // Spaltenbreite fuer den Donut-Bereich

// ---------------------------------------------------------------------------
// App-weiter Rollout (Phase 2, 2026-08-30, siehe [[effivo_mvp_roadmap]]):
// generische Bausteine fuer die "Listen/Formular"-Seiten (Datenimporte,
// Kunden, Auftraege, Faelle, Benutzer, geteiltes Nav/Header) - Pendant zu
// lib/ui.ts + lib/import-ui.ts, aber im Goldstandard-Farbsystem. Bewusst
// NICHT ui.ts/import-ui.ts selbst umgestellt: beide werden auch von den
// Admin-Datenimporte-Seiten genutzt (siehe Kommentar in import-ui.ts ueber
// einen frueheren Vorfall, als eine Aenderung dort versehentlich Kunden/
// Auftraege/Admin mitveraendert hat) - Admin ist nicht Teil dieses Rollouts.
// Neue, eigene Exporte hier vermeiden dieses Risiko vollstaendig.
export const dashInputClass =
  "w-full rounded-lg border border-dash-line bg-dash-panel px-3 py-2 text-[14px] text-dash-text placeholder:text-dash-text-faint focus:outline-none focus:ring-2 focus:ring-dash-gold/40 focus:border-dash-gold/60 transition-colors";

export const dashLabelClass = "block text-[13px] font-medium text-dash-text-secondary mb-1";

export const dashPrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-dash-gold-deep to-dash-gold px-5 py-2.5 text-[14px] font-semibold text-dash-panel transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(226,188,107,0.14)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none";

export const dashSecondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-dash-line bg-dash-panel px-5 py-2.5 text-[14px] font-semibold text-dash-text hover:border-dash-gold/40 hover:bg-dash-panel-soft transition-colors disabled:opacity-50";

export const dashDangerButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-dash-red/35 bg-dash-red-tint px-4 py-2 text-[13px] font-semibold text-dash-red hover:bg-dash-red/25 hover:border-dash-red/55 transition-colors disabled:opacity-50";

// Gradient-Icon-Badge fuer Panel-/Listen-Kopfzeilen (Pendant zu
// importIconGlowClass) - dasselbe Gold-Gradient wie die primaere
// Schnellaktion-Kachel im Dashboard.
export const dashIconGlowClass = "bg-gradient-to-br from-dash-gold-deep to-dash-gold text-dash-panel shadow-[0_0_20px_-5px_rgba(226,188,107,0.5)]";

export const dashKebabPanelClass =
  "absolute right-0 top-[calc(100%+8px)] z-30 w-[185px] overflow-hidden rounded-xl border border-dash-line bg-dash-panel shadow-[0_18px_42px_rgba(0,0,0,0.34)]";

export const dashKebabTriggerClass =
  "flex h-[34px] w-[34px] items-center justify-center rounded-full border border-dash-line bg-dash-panel-soft text-dash-text-secondary transition-colors hover:border-dash-gold/50 hover:text-dash-gold";

// Zebra-Streifen fuer Listenzeilen - dasselbe Muster wie in findings-list.tsx/
// activity-timeline.tsx auf der Uebersicht-Seite (bg-dash-panel-soft auf
// geraden Zeilen), hier als kleine Hilfsfunktion statt Inline-Ternary an
// jeder Aufrufstelle.
export function dashZebraRowClass(index: number) {
  return index % 2 === 0 ? "bg-dash-panel-soft" : "";
}
