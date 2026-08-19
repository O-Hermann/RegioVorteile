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
function generateParticles(count: number): Particle[] {
  let seed = 2941;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const rx = (rand() - 0.5) * 340;
    const ry = (rand() - 0.5) * 100;
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
// Business-Laptops sauber zu bleiben.
const PARTICLES = generateParticles(64);

type NumberScene = { label: string; value: string; caption: string; final?: boolean };

const NUMBER_SCENES: NumberScene[] = [
  { label: "Die Ausgangslage", value: "38.421", caption: "Buchungen analysiert" },
  { label: "Effivo filtert", value: "47", caption: "Auffälligkeiten erkannt" },
  { label: "Der Mensch prüft", value: "32", caption: "nach Prüfung bestätigt" },
  { label: "Das Ergebnis", value: "18.740 €", caption: "identifiziertes Potenzial", final: true },
];

// [Einblenden-Start, voll sichtbar ab, voll sichtbar bis, Ausblenden-Ende] -
// jede Zahl bekommt eine lange Haltephase, damit der Besucher wirklich Zeit
// zum Lesen hat, bevor die naechste Zahl uebernimmt. Alle Werte muessen im
// Bereich [0,1] bleiben: sobald der Browser scroll-gebundene Animationen
// nativ unterstuetzt, kompiliert Framer Motion useTransform-Bereiche in
// Element.animate()-Keyframes, deren Offsets zwingend in [0,1] liegen
// muessen - ein Wert wie 1.001 wirft dort eine Laufzeit-Exception und reisst
// die ganze Seite ab. Die letzte Zahl bekommt deshalb bewusst KEIN
// Ausblenden-Ende (nur 3 statt 4 Punkte): sie bleibt bis zum Scroll-Ende
// (p=1) vollstaendig sichtbar - passend zur geforderten absoluten Ruhe am
// Schluss.
const HOLD_RANGES: number[][] = [
  [0, 0.018, 0.205, 0.255],
  [0.33, 0.365, 0.495, 0.545],
  [0.56, 0.595, 0.72, 0.765],
  [0.835, 0.875, 1],
];
const HOLD_OUTPUTS: number[][] = [
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 1],
];

const STICKY_TOP_PX = 88;
const STAGE_VH = 500;

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

  if (p >= 0.165 && p < 0.39) {
    const breakOpen = smoothstep((p - 0.185) / 0.055);
    const explode = smoothstep((p - 0.225) / 0.09);
    const vanish = smoothstep((p - 0.305) / 0.075);
    const crack = clamp01(breakOpen - delay * 0.55);
    const e = clamp01(explode - delay);
    const preX = rx + (sx - rx) * 0.08 * crack;
    const preY = ry + (sy - ry) * 0.08 * crack;
    x = preX + (sx - preX) * e + sx * 0.3 * vanish;
    y = preY + (sy - preY) * e + sy * 0.3 * vanish;
    opacity = (0.28 + 0.72 * crack) * (1 - 0.96 * vanish);
    scale = size * (0.72 + 0.58 * e);
  } else if (p >= 0.39 && p < 0.735) {
    opacity = 0;
    x = sx * 1.32;
    y = sy * 1.32;
  } else if (p >= 0.735) {
    const returnStart = smoothstep((p - 0.76) / 0.105);
    const collapse = smoothstep((p - 0.835) / 0.07);
    const r = clamp01(returnStart - delay * 0.65);
    const midX = fx * (1 - r) + cx * r;
    const midY = fy * (1 - r) + cy * r;
    x = midX * (1 - collapse);
    y = midY * (1 - collapse);
    const arrival = smoothstep((r - 0.08) / 0.75);
    const hardFade = 1 - smoothstep((p - 0.885) / 0.055);
    opacity = (0.08 + 0.84 * arrival) * (1 - 0.92 * collapse) * hardFade;
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
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  return (
    <section className="relative bg-landing-bg-alt">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 text-center sm:px-6 sm:pt-28">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">Vom Datenmeer zur Entscheidung</span>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
          Aus tausenden Buchungen werden wenige Entscheidungen.
        </h2>
        <p className="mt-4 text-landing-text-secondary">
          Aus Datenmasse wird Klarheit – und aus bestätigten Funden ein messbarer finanzieller Effekt.
        </p>
      </div>

      {prefersReducedMotion ? (
        <div className="pb-24">
          <StaticImpactNumbers />
        </div>
      ) : (
        <>
          <div ref={sectionRef} className="relative hidden lg:block" style={{ height: `${STAGE_VH}vh` }}>
            <div className="sticky overflow-hidden" style={{ top: STICKY_TOP_PX, height: `calc(100vh - ${STICKY_TOP_PX}px)` }}>
              <StageGlow scrollYProgress={scrollYProgress} />
              <ImpactRing scrollYProgress={scrollYProgress} />
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {PARTICLES.map((particle, i) => (
                  <ParticleDot key={i} particle={particle} scrollYProgress={scrollYProgress} />
                ))}
              </div>
              {NUMBER_SCENES.map((scene, i) => (
                <NumberSceneBlock
                  key={scene.value}
                  scene={scene}
                  range={HOLD_RANGES[i]}
                  output={HOLD_OUTPUTS[i]}
                  scrollYProgress={scrollYProgress}
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
}: {
  scene: NumberScene;
  range: number[];
  output: number[];
  scrollYProgress: MotionValue<number>;
}) {
  const opacity = useTransform(scrollYProgress, range, output);
  const y = useTransform(opacity, (o) => `calc(-50% + ${(1 - o) * 12}px)`);
  const scale = useTransform(opacity, (o) => 0.985 + 0.035 * o);
  const blurPx = useTransform(opacity, (o) => (1 - o) * 1.7);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-full max-w-2xl px-4 text-center"
      style={{ x: "-50%", y, scale, filter, opacity }}
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
  const lineWidth = useTransform(scrollYProgress, [0.902, 0.952], [0, 230]);
  const subOpacity = useTransform(scrollYProgress, [0.915, 0.97], [0, 1]);
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

function ImpactRing({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const t = useTransform(scrollYProgress, [0.205, 0.3], [0, 1]);
  const opacity = useTransform(t, (v) => 0.5 * (1 - v));
  const scale = useTransform(t, (v) => 0.65 + 7 * v);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 rounded-full border border-landing-accent-light/30"
      style={{ x: "-50%", y: "-50%", opacity, scale }}
    />
  );
}

function StageGlow({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const finalLand = useTransform(scrollYProgress, [0.855, 0.915], [0, 1]);
  const opacity = useTransform(finalLand, (v) => 0.7 * v);
  const scale = useTransform(finalLand, (v) => 0.72 + 0.34 * v);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[34rem] rounded-full bg-landing-accent-light/20 blur-3xl"
      style={{ x: "-50%", y: "-50%", opacity, scale }}
    />
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
