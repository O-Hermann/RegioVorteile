// Ein einziger, fixierter Hintergrund-Layer fuer die gesamte Landingpage,
// statt jeder Section ihre eigene flache Fuellfarbe zu geben. Die Sections
// selbst bleiben fast deckend (bg-landing-bg/95 etc.), sodass dieser Layer
// ueberall gleichmaessig durchscheint - das verbindet die sonst hart
// gestapelten Bloecke zu einer durchgehenden Flaeche, ohne einzelne
// Sections farblich zu veraendern.
//
// Bewusst komplett statisch (keine Animation/Transition auf diesem Layer):
// eine bewegte Variante wurde separat als Demo geprueft und verworfen,
// weil sie mit den Scroll-Choreografien (Scrollytelling, Impact Numbers,
// Recovery Report) und den whileInView-Fades der ruhigen Sections
// interferiert haette. "isolate" haelt mix-blend-mode auf diesen Layer
// beschraenkt, damit er nicht mit Inhalten ausserhalb dieses Containers
// verrechnet wird.
//
// Die Basis-Waesche (erste Ebene) ist in Light UND Dark sichtbar und war
// bereits live/freigegeben. Alle zusaetzlichen Ebenen (zweite Waesche mit
// Violett-Akzent, Aurora-Schwade, Korn, Vignette, Lichtsaum) sind bewusst
// nur im Dark Mode aktiv, weil Light Mode laut Feedback schon als zu hell
// empfunden wird und nicht Teil dieser Anpassung sein sollte.
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 isolate overflow-hidden">
      {/* Basis-Waesche - unveraendert, Light + Dark */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 85% -8%, color-mix(in srgb, var(--landing-accent-light) 16%, transparent), transparent 62%), " +
            "radial-gradient(ellipse 55% 45% at 6% 108%, color-mix(in srgb, var(--landing-accent-light) 11%, transparent), transparent 60%)",
        }}
      />

      {/* Zusaetzliche Ebenen - nur Dark Mode */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 70% 46% at 92% -6%, color-mix(in srgb, var(--landing-accent-light) 11%, transparent), transparent 64%), " +
            "radial-gradient(ellipse 58% 42% at 4% 32%, color-mix(in srgb, var(--landing-purple) 9%, transparent), transparent 62%), " +
            "radial-gradient(ellipse 62% 44% at 96% 80%, color-mix(in srgb, var(--landing-accent-light) 10%, transparent), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "conic-gradient(from 200deg at 65% 18%, transparent 0deg, color-mix(in srgb, var(--landing-accent-light) 40%, transparent) 40deg, transparent 100deg, color-mix(in srgb, var(--landing-purple) 32%, transparent) 210deg, transparent 280deg, transparent 360deg)",
          opacity: 0.08,
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute inset-0 opacity-0 dark:opacity-[0.09]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in srgb, var(--landing-accent-light) 70%, transparent) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 78%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          opacity: 0.03,
          mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px 180px",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: "radial-gradient(ellipse 95% 80% at 50% 22%, transparent 58%, rgba(2, 8, 18, 0.3) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, var(--landing-accent-light) 30%, transparent) 0%, color-mix(in srgb, var(--landing-accent-light) 13%, transparent) 45%, color-mix(in srgb, var(--landing-purple) 20%, transparent) 100%)",
          height: 200,
          opacity: 0.4,
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
