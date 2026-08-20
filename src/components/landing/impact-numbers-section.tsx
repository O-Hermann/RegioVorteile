"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type Particle = {
  rx: number;
  ry: number;
  sx: number;
  sy: number;
  fx: number;
  fy: number;
  cx: number;
  cy: number;
  delay: number;
  size: number;
  tint: number;
};

// Deterministischer Pseudo-Zufall (kein Math.random) - liefert bei jedem
// Render/SSR-Durchlauf exakt dieselben Partikel-Parameter, damit es zu
// keinem Hydration-Mismatch zwischen Server- und Client-Rendering kommt.
//
// Die Ausgangspunkte (rx/ry) sind bewusst NICHT gleichmaessig ueber eine
// breite Flaeche verteilt, sondern in fuenf engen Clustern - je einer pro
// Ziffer von "38.421". Dadurch wirkt es, als wuerden die Partikel aus der
// tatsaechlichen Form der Zahl heraus entstehen, statt als loser Partikel-
// Nebel neben dem Text zu erscheinen.
const DIGIT_SLOTS = [-120, -60, 0, 60, 120];

function generateParticles(count: number): Particle[] {
  let seed = 2941;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const slot = DIGIT_SLOTS[i % DIGIT_SLOTS.length];
    const rx = slot + (rand() - 0.5) * 36;
    const ry = (rand() - 0.5) * 90;
    const angle = rand() * Math.PI * 2;
    const burstDistance = 180 + rand() * 320;
    const sx = Math.cos(angle) * burstDistance;
    const sy = Math.sin(angle) * burstDistance * 0.6;
    const returnAngle = rand() * Math.PI * 2;
    const returnDistance = 360 + rand() * 460;
    const fx = Math.cos(returnAngle) * returnDistance;
    const fy = Math.sin(returnAngle) * returnDistance * 0.64;
    const cx = (rand() - 0.5) * 60;
    const cy = (rand() - 0.5) * 22;
    particles.push({ rx, ry, sx, sy, fx, fy, cx, cy, delay: rand() * 0.18, size: 0.55 + rand() * 1.25, tint: rand() });
  }
  return particles;
}

// So wenig Partikel wie moeglich, so viele wie noetig fuer den Effekt -
// deutlich weniger als eine typische Partikel-Demo, um auf normalen
// Business-Laptops sauber zu bleiben. Etwas dichter als im ersten Entwurf,
// damit die Ziffern-Cluster im Aufbruchsmoment als Silhouette erkennbar sind.
const PARTICLES = generateParticles(80);

type NumberScene = { label: string; value: string; caption: string; final?: boolean };

const NUMBER_SCENES: NumberScene[] = [
  { label: "Die Ausgangslage", value: "38.421", caption: "Buchungen analysiert" },
  { label: "Effivo filtert", value: "47", caption: "Auffälligkeiten erkannt" },
  { label: "Der Mensch prüft", value: "32", caption: "nach Prüfung bestätigt" },
  { label: "Das Ergebnis", value: "18.740 €", caption: "identifiziertes Potenzial", final: true },
];

// [Einblenden-Start, voll sichtbar ab, voll sichtbar bis, Ausblenden-Ende] -
// jede Zahl bekommt eine lange Haltephase, damit der Besucher wirklich Zeit
// zum Lesen hat, bevor die naechste Zahl uebernimmt. Die Luecken zwischen
// den Zahlen (wo optisch nichts passiert) sind bewusst knapper gehalten als
// im ersten Entwurf, damit der Ablauf durchinszeniert statt leer wirkt -
// die dadurch gewonnene Scrollstrecke geht direkt in laengere Haltephasen.
// Alle Werte muessen im Bereich [0,1] bleiben: sobald der Browser scroll-
// gebundene Animationen nativ unterstuetzt, kompiliert Framer Motion
// useTransform-Bereiche in Element.animate()-Keyframes, deren Offsets
// zwingend in [0,1] liegen muessen - ein Wert wie 1.001 wirft dort eine
// Laufzeit-Exception und reisst die ganze Seite ab. Die letzte Zahl bekommt
// deshalb bewusst KEIN Ausblenden-Ende (nur 3 statt 4 Punkte): sie bleibt
// bis zum Scroll-Ende (p=1) vollstaendig sichtbar - passend zur
// geforderten absoluten Ruhe am Schluss.
// Der Einblenden-Start der ERSTEN Zahl (0 -> 0.02) war unnoetig traege:
// scrollYProgress bleibt exakt bei 0 haengen, bis die Track-Oberkante die
// Viewport-Oberkante erreicht - aber die Sticky-Flaeche selbst wird schon
// bis zu 88px VORHER sichtbar gepinnt (CSS-Sticky-Eigenschaft, kein Bug).
// In diesem kurzen Fenster stand die Flaeche also bereits im Bild, aber
// "38.421" war noch komplett unsichtbar (Opacity exakt 0) - zusammen mit
// zusaetzlichem Padding wirkte das wie eine fast leere Bildschirmhoehe vor
// der ersten Zahl. Nur dieser ERSTE Einblenden-Wert wurde verkuerzt
// (0.02 -> 0.008); alle anderen Werte (Haltephasen, Ausblenden, restliche
// drei Zahlen) sind unveraendert - die Choreografie selbst bleibt gleich,
// nur ihr Start reagiert jetzt schneller.
const HOLD_RANGES: number[][] = [
  [0, 0.008, 0.21, 0.24],
  [0.28, 0.31, 0.5, 0.53],
  [0.55, 0.58, 0.72, 0.75],
  [0.78, 0.81, 1],
];
const HOLD_OUTPUTS: number[][] = [
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 1],
];

const STICKY_TOP_PX = 88;
const STAGE_VH = 500;

// PRE_ENTRY_VH ist ein eigener, zusaetzlicher Streckenabschnitt VOR der
// bestehenden Choreografie (die weiterhin exakt STAGE_VH=500vh einnimmt und
// intern unveraendert bleibt). Grund: mit dem bisherigen einzelnen
// useScroll-Fortschritt blieb dieser Fortschritt bei 0 haengen, bis die
// Track-Oberkante exakt die Viewport-Oberkante erreichte - obwohl die
// Sticky-Flaeche selbst (CSS-Sticky-Eigenschaft) schon ca. 88px VORHER
// sichtbar gepinnt wird. In diesem Fenster stand die Flaeche zwar im Bild,
// aber "38.421" blieb komplett unsichtbar (Opacity exakt 0, siehe
// HOLD_RANGES) - das erzeugte den gemeldeten grossen leeren Navy-Bereich.
// Reines Verkuerzen des ersten HOLD_RANGES-Wertes (vorherige Version)
// aenderte daran nichts Grundsaetzliches, weil das strukturelle Problem
// nicht die Rampen-BREITE war, sondern dass ueberhaupt erst ab Fortschritt
// 0 etwas passiert.
//
// Deshalb bekommt "38.421" jetzt einen EIGENEN, von der bestehenden
// Choreografie UNABHAENGIGEN Voreinblend-Fortschritt (siehe preEntryOpacity
// unten), der direkt ab Fortschritt 0 des GESAMTEN (jetzt laengeren) Tracks
// startet - die Zahl kann dadurch sichtbar werden, WAEHREND die bestehende
// Choreografie (decayProgress) noch bei 0 haengt. decayProgress selbst
// startet weiterhin bei EXAKT der alten "start start"-Schwelle, nur jetzt
// um PRE_ENTRY_VH nach hinten verschoben - alle bestehenden Zahlen-/
// Partikel-Schwellenwerte (0.15 Explosion, 0.21 Ausblenden usw.) wirken
// dadurch bit-fuer-bit identisch wie vorher, nur der ganze Ablauf beginnt
// jetzt insgesamt spaeter innerhalb des laengeren Tracks.
const PRE_ENTRY_VH = 70;
const PRE_ENTRY_FRACTION = PRE_ENTRY_VH / (STAGE_VH + PRE_ENTRY_VH);

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

// Reine Funktion von p (Kapitel-Fortschritt 0..1) -> Partikelzustand. Direkt
// aus der Referenz-Dramaturgie uebernommen: die Zahl bricht auf, Fragmente
// fliegen explosionsartig nach aussen, verschwinden vollstaendig waehrend
// 47/32 im Fokus stehen, kehren dann von ausserhalb zurueck und verdichten
// sich exakt zum finalen Ergebnis.
function particleState(p: number, particle: Particle) {
  const { rx, ry, sx, sy, fx, fy, cx, cy, delay, size, tint } = particle;
  let x = rx;
  let y = ry;
  let opacity = 0;
  let scale = size;

  if (p >= 0.15 && p < 0.39) {
    // entryFade blendet die Partikel weich ein, statt sie am Phasen-Rand
    // schlagartig auf ihre volle Formel-Deckkraft springen zu lassen -
    // ohne diesen Fade gab es hier einen sichtbaren "harten Umschalter".
    const entryFade = smoothstep((p - 0.15) / 0.035);
    const breakOpen = smoothstep((p - 0.185) / 0.055);
    const explode = smoothstep((p - 0.225) / 0.09);
    const vanish = smoothstep((p - 0.305) / 0.075);
    const crack = clamp01(breakOpen - delay * 0.55);
    const e = clamp01(explode - delay);
    const preX = rx + (sx - rx) * 0.08 * crack;
    const preY = ry + (sy - ry) * 0.08 * crack;
    x = preX + (sx - preX) * e + sx * 0.3 * vanish;
    y = preY + (sy - preY) * e + sy * 0.3 * vanish;
    opacity = entryFade * (0.28 + 0.72 * crack) * (1 - 0.96 * vanish);
    scale = size * (0.72 + 0.58 * e);
  } else if (p >= 0.39 && p < 0.735) {
    opacity = 0;
    x = sx * 1.3;
    y = sy * 1.3;
  } else if (p >= 0.735) {
    const entryFade2 = smoothstep((p - 0.735) / 0.02);
    const returnStart = smoothstep((p - 0.76) / 0.105);
    const collapse = smoothstep((p - 0.835) / 0.07);
    const r = clamp01(returnStart - delay * 0.65);
    const midX = fx * (1 - r) + cx * r;
    const midY = fy * (1 - r) + cy * r;
    x = midX * (1 - collapse);
    y = midY * (1 - collapse);
    const arrival = smoothstep((r - 0.08) / 0.75);
    const hardFade = 1 - smoothstep((p - 0.885) / 0.055);
    opacity = entryFade2 * (0.08 + 0.84 * arrival) * (1 - 0.92 * collapse) * hardFade;
    scale = size * (0.62 + 0.52 * arrival - 0.4 * collapse);
  }

  return { x, y, opacity: Math.max(0, opacity), scale: Math.max(0.12, scale), tint };
}

// Der zweite grosse Wow-Moment: 38.421 -> Partikel-Explosion -> 47 -> 32 ->
// Partikel-Rueckkehr -> 18.740 €, danach absolute Ruhe. Wie beim ersten
// Scrollytelling ist scrollYProgress (via useScroll) die einzige Quelle der
// Wahrheit; jede Bewegung ist eine reine Funktion davon.
export function ImpactNumbersSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // decayProgress rekonstruiert exakt den alten [0,1]-Fortschritt der
  // bestehenden Choreografie (Partikel, alle vier Zahlen-HOLD_RANGES,
  // FinalExtras) - nur beginnend ab PRE_ENTRY_FRACTION des jetzt laengeren
  // Tracks statt ab 0. Vor diesem Punkt bleibt er (per useTransform-Default)
  // bei 0 - dort greift stattdessen ausschliesslich preEntryOpacity fuer
  // die erste Zahl.
  const decayProgress = useTransform(rawProgress, [PRE_ENTRY_FRACTION, 1], [0, 1]);

  // "38.421" wird direkt ab Fortschritt 0 des GESAMTEN Tracks langsam
  // sichtbar (PRE-ENTRY), haelt danach lange vollstaendig sichtbar/lesbar
  // (HOLD) und uebergibt erst kurz vor PRE_ENTRY_FRACTION die Kontrolle an
  // die bestehende Choreografie (siehe preEntryBlend). Design/Typografie/
  // Position sind unveraendert - NumberSceneBlock leitet y/scale/blur wie
  // bisher direkt aus der Opacity ab, das ergibt automatisch ein sanftes
  // "in Position gleiten" waehrend des Einblendens, ohne eigene Bewegung.
  const preEntryOpacity = useTransform(rawProgress, [0, 0.008, PRE_ENTRY_FRACTION * 0.92], [0, 1, 1]);
  // Der Uebergabepunkt liegt bewusst NICHT direkt bei PRE_ENTRY_FRACTION
  // (wo decayProgress erst bei 0 steht, HOLD_RANGES[0] dort also noch
  // Opacity 0 liefert), sondern erst NACHDEM decayProgress die eigene,
  // sehr kurze Einblend-Rampe von HOLD_RANGES[0] (0 -> 0.008) bereits
  // durchlaufen hat: rawProgress = PRE_ENTRY_FRACTION + 0.008*(1-PRE_ENTRY_FRACTION)
  // ~ 0.13. Ab dort liefert decayOpacity bereits durchgehend 1 (HOLD-Plateau
  // bis 0.21), wodurch der lineare Uebergang zwischen preEntryOpacity (=1)
  // und decayOpacity (=1) komplett dip-frei ist - beide Seiten sind in
  // diesem Fenster bereits identisch bei voller Sichtbarkeit. Per
  // Nachrechnung verifiziert (siehe Zusammenfassung).
  const preEntryBlend = useTransform(rawProgress, [0.13, 0.14], [0, 1]);

  // Der frueher hier stehende eigene Intro-Textblock ("Vom Datenmeer zur
  // Entscheidung") wiederholte im Kern nur die Aussage des vorangegangenen
  // Scrollytellings und nahm dabei - ausserhalb jeder Scroll-Kopplung, rein
  // durch sein eigenes Padding - fast einen ganzen Viewport ein, bevor die
  // eigentliche Partikel-Szene ueberhaupt begann. Er war NICHT Teil des
  // getrackten sectionRef/scrollYProgress (eigenstaendiger Block direkt
  // davor) und konnte deshalb entfernt werden, ohne die Buehne selbst
  // (STAGE_VH, Sticky, Partikel, Zahlen-Phasen) im Geringsten anzutasten.
  return (
    <section className="relative bg-landing-bg-alt">
      {prefersReducedMotion ? (
        <div className="pb-24">
          <StaticImpactNumbers />
        </div>
      ) : (
        <>
          <div ref={sectionRef} className="relative hidden lg:block" style={{ height: `${STAGE_VH + PRE_ENTRY_VH}vh` }}>
            <div className="sticky overflow-hidden" style={{ top: STICKY_TOP_PX, height: `calc(100vh - ${STICKY_TOP_PX}px)` }}>
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {PARTICLES.map((particle, i) => (
                  <ParticleDot key={i} particle={particle} scrollYProgress={decayProgress} />
                ))}
              </div>
              {NUMBER_SCENES.map((scene, i) => (
                <NumberSceneBlock
                  key={scene.value}
                  scene={scene}
                  range={HOLD_RANGES[i]}
                  output={HOLD_OUTPUTS[i]}
                  scrollYProgress={decayProgress}
                  crack={i === 0}
                  preEntry={i === 0 ? { opacity: preEntryOpacity, blend: preEntryBlend } : undefined}
                />
              ))}
            </div>
          </div>
          <div className="pb-24 lg:hidden">
            <StaticImpactNumbers />
          </div>
        </>
      )}
    </section>
  );
}

function ParticleDot({ particle, scrollYProgress }: { particle: Particle; scrollYProgress: MotionValue<number> }) {
  const x = useTransform(scrollYProgress, (p) => particleState(p, particle).x);
  const y = useTransform(scrollYProgress, (p) => particleState(p, particle).y);
  const opacity = useTransform(scrollYProgress, (p) => particleState(p, particle).opacity);
  const scale = useTransform(scrollYProgress, (p) => particleState(p, particle).scale);
  const color = particle.tint > 0.74 ? "rgba(77,132,255,0.85)" : "rgba(25,198,193,0.85)";
  return (
    <motion.span
      className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full"
      style={{ backgroundColor: color, x, y, scale, opacity }}
    />
  );
}

function NumberSceneBlock({
  scene,
  range,
  output,
  scrollYProgress,
  crack,
  preEntry,
}: {
  scene: NumberScene;
  range: number[];
  output: number[];
  scrollYProgress: MotionValue<number>;
  crack?: boolean;
  preEntry?: { opacity: MotionValue<number>; blend: MotionValue<number> };
}) {
  const decayOpacity = useTransform(scrollYProgress, range, output);
  // Nur die erste Zahl bekommt ein preEntry-Objekt (siehe ImpactNumbersSection).
  // Vor der Uebergabe (blend=0) zaehlt ausschliesslich preEntry.opacity, ab
  // der Uebergabe (blend=1) ausschliesslich die bestehende decayOpacity -
  // dazwischen ein kurzer linearer Uebergang. Fuer alle anderen drei Zahlen
  // (preEntry undefined) ist dieser Hook-Aufruf identisch vorhanden (Regel
  // "gleiche Hooks in jeder Instanz"), gibt aber unveraendert decayOpacity
  // zurueck.
  const opacity = useTransform(() => {
    if (!preEntry) return decayOpacity.get();
    const b = preEntry.blend.get();
    return preEntry.opacity.get() * (1 - b) + decayOpacity.get() * b;
  });
  const y = useTransform(opacity, (o) => `calc(-50% + ${(1 - o) * 12}px)`);
  const scale = useTransform(opacity, (o) => 0.985 + 0.035 * o);
  // Ein sehr dezentes Zittern kurz bevor "38.421" in Partikel zerfaellt -
  // verstaerkt den Eindruck, dass die Zahl selbst instabil wird und
  // aufbricht, statt einfach auszublenden, waehrend daneben Partikel
  // erscheinen. Fuer alle anderen Zahlen ist crack=false und der Jitter
  // bleibt konstant 0 (kein Effekt, aber derselbe Hook-Aufruf fuer alle
  // Instanzen).
  const jitterX = useTransform(scrollYProgress, (p) => {
    if (!crack || p < 0.14 || p > 0.26) return 0;
    const intensity = smoothstep((p - 0.14) / 0.05) * (1 - smoothstep((p - 0.2) / 0.06));
    return Math.sin(p * 220) * intensity * 2.2;
  });
  const x = useTransform(jitterX, (j) => `calc(-50% + ${j}px)`);
  const blurPx = useTransform(opacity, (o) => (1 - o) * 1.7);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-full max-w-2xl px-4 text-center"
      style={{ x, y, scale, filter, opacity }}
    >
      <div className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">{scene.label}</div>
      <strong
        className={`block font-display font-extrabold leading-[0.9] tracking-tight ${
          scene.final ? "text-landing-accent-light" : "text-landing-text-primary"
        }`}
        style={{ fontSize: "clamp(3.25rem, 9vw, 8.5rem)" }}
      >
        {scene.value}
      </strong>
      <span className="mt-4 block text-lg text-landing-text-secondary">{scene.caption}</span>
      {scene.final && <FinalExtras scrollYProgress={scrollYProgress} />}
    </motion.div>
  );
}

function FinalExtras({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const lineWidth = useTransform(scrollYProgress, [0.83, 0.87], [0, 230]);
  const subOpacity = useTransform(scrollYProgress, [0.85, 0.91], [0, 1]);
  const subY = useTransform(subOpacity, (o) => 8 * (1 - o));
  return (
    <>
      <motion.div
        className="mx-auto mt-5 h-px bg-gradient-to-r from-transparent via-landing-accent-light to-transparent"
        style={{ width: lineWidth }}
      />
      <motion.p className="mt-4 text-sm text-landing-text-secondary" style={{ opacity: subOpacity, y: subY }}>
        Verborgen zwischen 38.421 Buchungen.
      </motion.p>
    </>
  );
}

// Statische Fassung fuer Mobile und "prefers-reduced-motion": keine
// Partikel, keine Scroll-Kopplung, alle vier Zahlen sofort lesbar
// untereinander.
function StaticImpactNumbers() {
  return (
    <div className="mx-auto max-w-md space-y-10 px-4 text-center sm:px-6">
      {NUMBER_SCENES.map((scene) => (
        <div key={scene.value}>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">{scene.label}</div>
          <strong
            className={`mt-2 block font-display text-5xl font-extrabold tracking-tight ${
              scene.final ? "text-landing-accent-light" : "text-landing-text-primary"
            }`}
          >
            {scene.value}
          </strong>
          <span className="mt-2 block text-landing-text-secondary">{scene.caption}</span>
          {scene.final && <p className="mt-3 text-sm text-landing-text-secondary">Verborgen zwischen 38.421 Buchungen.</p>}
        </div>
      ))}
    </div>
  );
}
