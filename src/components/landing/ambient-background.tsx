// Ein einziger, fixierter Hintergrund-Layer fuer die gesamte Landingpage,
// statt jeder Section ihre eigene flache Fuellfarbe zu geben. Die Sections
// selbst bleiben fast deckend (bg-landing-bg/95 etc.), sodass dieser Layer
// ueberall gleichmaessig durchscheint - das verbindet die sonst hart
// gestapelten Bloecke zu einer durchgehenden Flaeche, ohne einzelne
// Sections farblich zu veraendern. Bewusst nur EIN dezentes Verlaufspaar
// plus ein feines Punktraster (kein Glow-Feuerwerk, keine Kreise an
// zufaelligen Stellen).
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 85% -8%, color-mix(in srgb, var(--landing-accent-light) 16%, transparent), transparent 62%), " +
            "radial-gradient(ellipse 55% 45% at 6% 108%, color-mix(in srgb, var(--landing-accent-light) 11%, transparent), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-0 dark:opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in srgb, var(--landing-accent-light) 70%, transparent) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
    </div>
  );
}
