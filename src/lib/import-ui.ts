// Gemeinsame, hochwertige Panel-Bausteine ausschliesslich fuer die
// Datenimport-Feature-Flaeche (Uebersicht, Wizard, Detailseiten). Bewusst
// eigenstaendig statt aus dem Dashboard importiert, damit Dashboard/Admin-
// Dashboard unangetastet bleiben - siehe deren eigene, lokal duplizierte
// panelClass-Konstanten. Farben/Rundungen/Schatten sind bewusst identisch
// zur Effivo-Uebersicht gewaehlt, damit die Datenimport-Seiten wie von
// Anfang an Teil desselben Produkts wirken.
export const importPanelClass =
  "rounded-2xl border border-card-border/70 dark:border-white/10 bg-card dark:bg-gradient-to-b dark:from-cockpit-card dark:to-cockpit-card-dark shadow-sm dark:shadow-xl dark:shadow-black/30 transition-all duration-300";

export const importPanelHoverClass =
  "hover:-translate-y-0.5 hover:border-ink-300 dark:hover:border-cockpit-accent-light/40 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-cockpit-accent/20";

export const importSecondaryTextClass = "text-sand-500 dark:text-cockpit-text-secondary";

export const importIconGlowClass =
  "bg-gradient-to-br from-ink-500 to-ink-700 dark:from-cockpit-accent-light dark:to-cockpit-accent-dark text-white shadow-[0_0_22px_-5px_rgba(8,122,120,0.55)] dark:shadow-[0_0_26px_-5px_rgba(30,151,148,0.65)]";

export const importIconBadgeClass =
  "bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/30";
