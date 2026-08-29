import { Inter } from "next/font/google";

// Gemeinsame Bausteine ausschliesslich fuer die Effivo-Übersicht (Dashboard-
// Startseite). Design-System 2026-08-30 ("Goldstandard"): ersetzt die
// bisherige Teal/Libre-Franklin-Optik aus dem V12-Port (siehe
// [[controlling_cockpit_v12_dashboard_port]]) - der Nutzer wollte explizit
// eine komplett neue, eigenstaendige Design-Sprache statt der bisherigen
// Teal-Uebernahme oder der schlichteren App-Standard-Optik. Entstanden aus
// mehreren Iterationsrunden an einem eigenstaendigen HTML-Mockup (als
// Artifact "Effivo Goldstandard" freigegeben), hier 1:1 in den echten Code
// uebernommen - siehe [[effivo_mvp_roadmap]] fuer den vollen Verlauf der
// Design-Entscheidungen (Farben, Typografie, Hover-Zustaende, Animationen).
//
// Bewusst weiterhin NUR fuer diese Seite (dash-scope), nicht app-weit - die
// geteilte Navigation (layout.tsx) bleibt unveraendert im bestehenden
// App-Standard-Look, das Ausrollen auf andere Seiten (Datenimporte, Kunden,
// Faelle, Benutzer) ist als eigene, spaetere Phase geplant, nicht Teil
// dieses Portierungsschritts.

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
