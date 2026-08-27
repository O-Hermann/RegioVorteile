import { Libre_Franklin, Public_Sans } from "next/font/google";

// Gemeinsame Bausteine ausschliesslich fuer die Effivo-Übersicht (Dashboard-
// Startseite), urspruenglich 1:1 aus der vom Nutzer freigegebenen "Effivo_
// V12_Dashboard_Final.html"-Designreferenz übernommen. Bewusst eigenstaendig
// statt aus lib/import-ui.ts oder der Dashboard-Seite selbst importiert -
// siehe Kommentar zum eigenen --color-dash-*-Namensraum in globals.css:
// gleiche Idee (dunkle Effivo-Flaeche), andere Referenzdatei, andere exakte
// Werte, daher eigene Konstanten statt Wiederverwendung.
//
// Jede Karte hat hier genau einen Owner (diese Datei + die jeweilige
// Komponente) statt - wie im urspruenglichen V12-Referenz-HTML selbst -
// zwoelf uebereinander gestapelter, sich gegenseitig ueberschreibender CSS-
// Versionsebenen (legacy -> V2 … V11.14). Der optische Endzustand ist
// identisch, der Code dahinter bewusst nicht.

// Schriften seit dem MVP-Pivot (2026-08-27, aus dem freigegebenen HTML-
// Mockup): Libre Franklin (Ueberschriften/Zahlen) + Public Sans (Fliesstext)
// - bewusst NUR fuer diese Seite ueber next/font/google geladen, nicht
// App-weit als --font-display/--font-sans (die werden auf ueber 80 anderen
// Seiten der App verwendet und sollen unveraendert bleiben, siehe
// [[controlling_cockpit_v12_dashboard_port]]). dashFontScopeClass gehoert auf
// den aeussersten Wrapper der Seite (page.tsx) - Fliesstext erbt daraus per
// CSS-Vererbung automatisch, Ueberschriften (h1-h4) brauchen zusaetzlich
// dashFontDisplayClass direkt auf dem Element, weil globals.css dafuer eine
// eigene, staerker spezifische Regel definiert (Element-Selektor auf h1-h4),
// die eine reine Vererbung vom Wrapper sonst nicht schlagen wuerde.
const dashDisplayFont = Libre_Franklin({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-dash-display" });
const dashBodyFont = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dash-body" });
// "dash-scope" traegt die h1-h4-Ueberschriften-Ueberschreibung aus
// globals.css (siehe Kommentar dort - unlayered Cascade-Layer-Grund, warum
// eine reine Tailwind-Utility-Klasse auf dem Element allein nicht reicht).
export const dashFontScopeClass = `dash-scope ${dashDisplayFont.variable} ${dashBodyFont.variable} font-[family-name:var(--font-dash-body)]`;
export const dashFontDisplayClass = "font-[family-name:var(--font-dash-display)]";

export const dashCardClass =
  "rounded-2xl border border-card-border dark:border-dash-line bg-card dark:bg-[linear-gradient(180deg,rgba(17,43,72,0.97),rgba(11,31,53,0.99))] shadow-warm-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_15px_34px_rgba(0,0,0,0.18)]";

export const dashModuleHoverClass =
  "transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-ink-400 dark:hover:border-[rgba(71,119,156,0.78)] hover:shadow-warm-lg dark:hover:shadow-[0_18px_38px_rgba(0,0,0,0.21)]";

export const dashSecondaryTextClass = "text-sand-600 dark:text-dash-text-secondary";
export const dashMutedTextClass = "text-sand-400 dark:text-dash-text-muted";

export const dashIconBoxClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-ink-700 dark:text-dash-teal bg-gradient-to-b from-ink-400/25 to-ink-400/5 dark:bg-[linear-gradient(180deg,rgba(45,214,197,0.14),rgba(45,214,197,0.07))] border border-ink-400/30 dark:border-[rgba(45,214,197,0.14)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_16px_rgba(45,214,197,0.06)]";

export const dashModuleFootClass =
  "mt-auto flex items-center justify-between gap-2 border-t border-card-border/70 dark:border-white/[0.06] pt-2 text-[11px] text-ink-600 dark:text-dash-teal";

// Zentraler Ort fuer die sechs Akzentfarben, statt wiederholter Hex-Werte in
// attention-list/findings-list - welche Farbe zu welcher Fund-/Handlungs-
// bedarf-Kategorie gehoert, legt jede Komponente selbst fest (siehe dortige
// FINDINGS/ACCENT_MAP-Konstanten). Werte seit dem MVP-Pivot (2026-08-27) aus
// dem freigegebenen HTML-Mockup uebernommen, deckungsgleich mit den
// --color-dash-*-Tokens in globals.css.
export const DASH_ACCENT_HEX = {
  red: "#ff756d",
  orange: "#e2ab48",
  blue: "#63aaff",
  purple: "#aa76ff",
  green: "#47d795",
  teal: "#2dd6c5",
} as const;

export type DashAccent = keyof typeof DASH_ACCENT_HEX;

// Viewport-abhaengige Schriftgroessen (Readability-/Scale-Pass): auf hohen
// Desktop-Viewports (z.B. 1920x1080) bleibt unterhalb des fest auf
// "100dvh - 9rem" limitierten Grids sonst ungenutzter Raum uebrig - dieser
// wird hier gezielt fuer groessere, besser lesbare Typografie genutzt, statt
// als Leerflaeche zu verschenken. "clamp()" ist bewusst an "dvh" gekoppelt
// (nicht an die Breite) und nicht an einen festen Breakpoint: dieselbe Hoehe
// (z.B. 900px bei 1672 UND 1920 Breite) ergibt dieselbe Groesse, und kurze
// Displays wie 1366x768 bleiben automatisch bei der kompakten Basisgroesse
// (= der bisherige, bereits freigegebene Wert - clamp() unterschreitet ihn
// nie). Ein Wert pro Text-Rolle (Titel/Wert/Fliesstext/Sekundaertext) statt
// pro einzelner Komponente, damit die Skalierung app-weit konsistent bleibt.
//
// WICHTIG: jede Konstante haelt hier bewusst die VOLLSTAENDIGE, woertliche
// Tailwind-Klasse (z.B. "text-[clamp(...)]"), nicht nur den rohen clamp()-
// Wert. Tailwinds Build-Scanner wertet kein JavaScript aus - er sucht nur
// nach woertlich im Quelltext vorkommenden Klassennamen. Ein Ausdruck wie
// `text-[${dashTextValue}]` in einer Komponente wuerde NICHT erkannt, weil
// im Scan dieser Datei nur "text-[" + Platzhalter sichtbar waere. Die volle
// Klasse muss daher bereits HIER woertlich stehen (Tailwind scannt auch
// diese .ts-Datei) und wird an der Verwendungsstelle unveraendert
// eingesetzt, nicht erneut in "text-[...]" eingepackt.
// dashTextValue/dashTextKpiLabel/dashTextSecondary werden auch von der jetzt
// eingefrorenen linken Spalte (kpi-grid.tsx) genutzt - bewusst NICHT mehr
// veraendert, auch nicht fuer den Readability-Pass der mittleren/rechten
// Spalte. Fuer "sekundaeren" Text dort, der etwas grosszuegiger werden soll,
// gibt es stattdessen "dashTextSecondaryLg" (siehe unten) statt den
// gemeinsam genutzten Wert zu verschieben.
export const dashTextTitle = "text-[clamp(13.5px,6.112px+0.962dvh,16.5px)]"; // Kartentitel (Analysevergleich, Entwicklung, Prüfübersicht, Funde & Prüfung)
export const dashTextSectionHeading = "text-[clamp(15.5px,8.112px+0.962dvh,18.5px)]"; // Handlungsbedarf/Letzte Aktivitäten h3, Entwicklung-Aktuellwert, Funde-Potenzialwert
export const dashTextValue = "text-[clamp(19px,9.154px+1.282dvh,23px)]"; // KPI-Hauptwerte (linke Spalte, eingefroren)
export const dashTextDonutNumber = "text-[clamp(23px,10.689px+1.603dvh,28px)]"; // "46" im Prüfübersicht-Donut
export const dashTextBody = "text-[clamp(12px,7.692px+0.561dvh,13.75px)]"; // Fliesstext: Legende, Funde-Namen, Aktivitätstitel, Fallzeilen
export const dashTextBodyLg = "text-[clamp(13px,8.077px+0.641dvh,15px)]"; // etwas groesserer Fliesstext (Fallbeträge, Statuszeilen)
export const dashTextKpiLabel = "text-[clamp(11px,6.692px+0.561dvh,12.75px)]"; // KPI-Bezeichnungen (linke Spalte, eingefroren)
export const dashTextSecondary = "text-[clamp(10px,6.92px+0.401dvh,11.25px)]"; // Sekundärtext (linke Spalte, eingefroren - siehe dashTextSecondaryLg fuer Mitte/rechts)
export const dashTextSecondaryLg = "text-[clamp(10.5px,6.806px+0.481dvh,12px)]"; // Sekundärtext ausschliesslich fuer Mitte/rechts (Deltas, Zeitstempel, Beschreibungen) - bewusst eigener Wert statt dashTextSecondary, damit die KPI-Kacheln unveraendert bleiben
export const dashTextSecondarySm = "text-[clamp(9.5px,6.42px+0.401dvh,10.75px)]"; // kleinste Labels/Eyebrows
export const dashDonutSizeClass = "h-[clamp(104px,54.771px+6.41dvh,124px)] w-[clamp(104px,54.771px+6.41dvh,124px)]"; // Durchmesser Prüfübersicht-Donut
export const dashDonutInsetClass = "inset-[clamp(16px,11.077px+0.641dvh,18px)]"; // Ringbreite des Donuts (skaliert mit dashDonutSizeClass mit)
export const dashDonutColClass = "grid-cols-[clamp(108px,58.771px+6.41dvh,128px)_1fr]"; // Spaltenbreite fuer den Donut-Bereich - muss mit dashDonutSizeClass mitwachsen, sonst wuerde der groessere Donut seine Spalte ueberragen
