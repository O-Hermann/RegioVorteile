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
// Feinschliff Runde 2 (Referenz-Design-Brief): dark:-Werte nutzen jetzt die
// eigenstaendige, kraeftigere --color-import-*-Palette (siehe globals.css)
// statt der gedaempfteren --color-cockpit-*-Werte, damit die Flaeche als
// "hochwertige, klar definierte Karte" statt als flacher Verlauf wirkt.
export const importPanelClass =
  "rounded-2xl border border-card-border dark:border-import-border bg-card dark:bg-gradient-to-b dark:from-import-card dark:to-import-card-header shadow-warm-sm dark:shadow-2xl dark:shadow-black/40 transition-all duration-300";

// Feinschliff Teil E: staerkerer Hover im Light Mode (dunklerer Rahmen,
// deutlicherer Schatten mit leichtem Farbstich) - im Dark Mode unveraendert.
export const importPanelHoverClass =
  "hover:-translate-y-1 hover:border-ink-400 dark:hover:border-import-accent/40 hover:shadow-xl hover:shadow-ink-500/10 dark:hover:shadow-2xl dark:hover:shadow-import-accent/20";

// Feinschliff Teil C: sand-600 statt sand-500 fuer besseren Kontrast im Light
// Mode (Dark Mode unveraendert) - weiterhin bewusst kein Schwarz, nur klarer
// lesbar statt zu blass.
export const importSecondaryTextClass = "text-sand-600 dark:text-import-text-secondary";

export const importIconGlowClass =
  "bg-gradient-to-br from-ink-500 to-ink-700 dark:bg-import-accent dark:from-import-accent dark:to-import-accent text-white shadow-[0_0_22px_-5px_rgba(8,122,120,0.55)] dark:shadow-[0_0_28px_-4px_rgba(30,214,200,0.55)]";

export const importIconBadgeClass =
  "bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-import-accent border border-ink-400/30 dark:border-import-accent/30";

// Gemeinsame KebabMenu-Overrides (siehe components/kebab-menu.tsx) fuer
// diese Feature-Flaeche - genutzt sowohl auf der Listen- als auch der
// Detailseite, damit das "Weitere Aktionen"-Menue an beiden Stellen
// identisch aussieht, ohne die KebabMenu-Defaults fuer andere Seiten
// (Kunden, Auftraege, ...) zu veraendern.
export const importKebabPanelClass =
  "absolute right-0 top-[calc(100%+8px)] z-30 w-56 overflow-hidden rounded-2xl border border-card-border/70 dark:border-import-border bg-card dark:bg-import-card shadow-warm-lg dark:shadow-2xl dark:shadow-black/50";

export const importKebabTriggerClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-card-border dark:border-import-border text-sand-600 dark:text-import-text-secondary hover:bg-sand-100 hover:text-sand-900 dark:hover:bg-import-card-header dark:hover:text-import-text transition-colors";
