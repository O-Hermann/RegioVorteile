// Gemeinsame, hochwertige Panel-Bausteine ausschliesslich fuer die
// Datenimport-Feature-Flaeche (Uebersicht, Wizard, Detailseiten). Bewusst
// eigenstaendig statt aus dem Dashboard importiert, damit Dashboard/Admin-
// Dashboard unangetastet bleiben - siehe deren eigene, lokal duplizierte
// panelClass-Konstanten. Farben/Rundungen/Schatten sind bewusst identisch
// zur Effivo-Uebersicht gewaehlt, damit die Datenimport-Seiten wie von
// Anfang an Teil desselben Produkts wirken.
// Feinschliff Teil C: im Light Mode volle Border-Deckkraft + der etwas
// kraeftigere "shadow-warm-sm"-Token statt des generischen, sehr flachen
// Tailwind-"shadow-sm" (angeglichen an cardClass in lib/ui.ts, das diesen
// Kontrast bereits nutzt) - Karten heben sich dadurch klarer vom sehr hellen
// Seitenhintergrund ab, ohne einen harten grauen Rahmen zu erzeugen.
//
// WICHTIG (Runde 3 Korrektur): importPanelClass/importIconGlowClass/
// importIconBadgeClass/importSecondaryTextClass werden NICHT nur auf der
// Datenimporte-Liste genutzt, sondern app-weit fuer leere Zustaende und
// Panels auf Kunden, Auftraege, dem Import-Wizard, der Zuordnungsseite und
// den Admin-Datenimporte-Seiten (siehe grep-Ergebnis vor dieser Aenderung).
// Runde 2 hatte diese Konstanten versehentlich auf die neue, kraeftigere
// Datenimporte-Referenzfarbwelt umgestellt - das aenderte ungefragt auch das
// Erscheinungsbild von Kunden/Auftraege/Admin, die nie Teil des Referenz-
// Vergleichs waren. Hier daher zurueckgesetzt auf die urspruenglichen,
// gedaempften Cockpit-Werte; die neue, kraeftigere Optik fuer die
// Datenimporte-Liste lebt stattdessen in eigenen, unten neu hinzugefuegten
// Konstanten, die ausschliesslich von import-history-table.tsx genutzt
// werden.
export const importPanelClass =
  "rounded-2xl border border-card-border dark:border-white/10 bg-card dark:bg-gradient-to-b dark:from-cockpit-card dark:to-cockpit-card-dark shadow-warm-sm dark:shadow-xl dark:shadow-black/30 transition-all duration-300";

// Feinschliff Teil E: staerkerer Hover im Light Mode (dunklerer Rahmen,
// deutlicherer Schatten mit leichtem Farbstich) - im Dark Mode unveraendert.
export const importPanelHoverClass =
  "hover:-translate-y-1 hover:border-ink-400 dark:hover:border-cockpit-accent-light/40 hover:shadow-xl hover:shadow-ink-500/10 dark:hover:shadow-2xl dark:hover:shadow-cockpit-accent/20";

// Feinschliff Teil C: sand-600 statt sand-500 fuer besseren Kontrast im Light
// Mode (Dark Mode unveraendert) - weiterhin bewusst kein Schwarz, nur klarer
// lesbar statt zu blass.
export const importSecondaryTextClass = "text-sand-600 dark:text-cockpit-text-secondary";

export const importIconGlowClass =
  "bg-gradient-to-br from-ink-500 to-ink-700 dark:from-cockpit-accent-light dark:to-cockpit-accent-dark text-white shadow-[0_0_22px_-5px_rgba(8,122,120,0.55)] dark:shadow-[0_0_26px_-5px_rgba(30,151,148,0.65)]";

export const importIconBadgeClass =
  "bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/30";

// Gemeinsame KebabMenu-Overrides (siehe components/kebab-menu.tsx) fuer die
// Datenimporte-Liste UND -Detailseite - beide sind hier bewusst gleich
// gestaltet, weil es dieselbe "Weitere Aktionen"-Interaktion ist (inkl.
// Loeschen). Als eigene, neu hinzugefuegte Exporte kein Risiko fuer andere
// KebabMenu-Aufrufer (z.B. Kunden), die diese Props nicht setzen und daher
// unveraendert die KebabMenu-Standardoptik erhalten.
export const importKebabPanelClass =
  "absolute right-0 top-[calc(100%+8px)] z-30 w-[185px] overflow-hidden rounded-xl border border-import-border bg-[#102339] shadow-[0_18px_42px_rgba(0,0,0,0.34)]";

export const importKebabTriggerClass =
  "flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#1c4964] bg-[#07182b] text-[#d8e6f1] transition-colors hover:border-import-accent";

// Nur fuer die Datenimporte-Liste (import-history-table.tsx): das
// "Importhistorie"-Panel selbst und sein Kopfzeilen-Icon. Werte 1:1 aus der
// vom Nutzer gelieferten HTML/CSS-Designreferenz uebernommen, bewusst NICHT
// in importPanelClass/importIconBadgeClass eingebaut (siehe Kommentar oben -
// das wuerde wieder Kunden/Auftraege/Admin mitveraendern).
export const importHistoryPanelClass =
  "relative rounded-2xl border border-import-border bg-card dark:border-import-border dark:bg-[linear-gradient(180deg,rgba(10,27,47,0.97),rgba(8,24,42,0.97))] shadow-warm-sm dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]";

export const importHistoryIconClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-600 text-white dark:bg-[linear-gradient(145deg,#0b5d62,#0f2f47)] dark:text-import-accent dark:shadow-[inset_0_0_0_1px_rgba(23,200,195,0.06)]";
