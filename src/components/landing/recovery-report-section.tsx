"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const CHECKLINES = [
  "bestätigte Fälle automatisch zusammenführen",
  "Betrag und Ursache pro Fund dokumentieren",
  "Ergebnis für Geschäftsführung und Buchhaltung aufbereiten",
  "später: zurückgeholte Beträge nachverfolgen",
];

const FRAGMENTS: { label: string; dir: [number, number]; className: string }[] = [
  { label: "Doppelzahlung · 2.480 €", dir: [-96, -54], className: "left-0 top-[6%]" },
  { label: "Offene Gutschrift · 1.240 €", dir: [100, -38], className: "right-0 top-[26%]" },
  { label: "Skonto · 860 €", dir: [-110, 60], className: "left-0 bottom-[18%]" },
  { label: "Überzahlung · 1.120 €", dir: [112, 56], className: "right-0 bottom-[2%]" },
];

const REPORT_STATS = [
  { label: "Buchungen", value: "38.421" },
  { label: "Auffälligkeiten", value: "47" },
  { label: "Bestätigt", value: "32" },
  { label: "Verworfen", value: "15" },
];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

// Der Recovery Report entsteht sichtbar AUS der vorherigen Geschichte:
// waehrend die Kartenh uelle in den Viewport scrollt, sammeln sich vier
// bestaetigte Einzelfunde (Fragmente) zu ihr hin und verschwinden, sobald
// der fertige Report Gestalt annimmt. Keine gepinnte Szene noetig - die
// Kopplung laeuft ueber die normale Scrollposition der Kartenh uelle
// relativ zum Viewport (useScroll mit Offset-Fenstern statt Sticky).
export function RecoveryReportSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start end", "start start"] });

  const gather = useTransform(scrollYProgress, [0, 0.7], [0, 1], { clamp: true });
  const gatherEased = useTransform(gather, smoothstep);
  const reveal = useTransform(scrollYProgress, [0.4, 0.96], [0, 1], { clamp: true });
  const revealEased = useTransform(reveal, smoothstep);

  const labelIn = useTransform(scrollYProgress, [0, 0.2], [0, 1], { clamp: true });
  const labelOut = useTransform(scrollYProgress, [0.27, 0.49], [0, 1], { clamp: true });
  const labelOpacity = useTransform(() => smoothstep(labelIn.get()) * (1 - smoothstep(labelOut.get())));
  const labelY = useTransform(labelOpacity, (o) => 10 * (1 - o));
  const labelScale = useTransform(labelOpacity, (o) => 0.96 + 0.04 * o);

  const reportY = useTransform(revealEased, (r) => 34 * (1 - r));
  const reportScale = useTransform(revealEased, (r) => 0.955 + 0.045 * r);
  const reportOpacity = useTransform(revealEased, (r) => 0.16 + 0.84 * r);

  return (
    <section id="report" className="scroll-mt-20 border-y border-landing-border bg-landing-bg py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-landing-accent-light">Recovery Report</span>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-landing-text-primary sm:text-4xl">
          Aus bestätigten Funden wird ein klares Ergebnis.
        </h2>
        <p className="mt-4 max-w-xl text-landing-text-secondary">
          Kein Analysechaos. Der Kunde bekommt eine verständliche Zusammenfassung und kann jeden Fund nachvollziehen.
        </p>

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <ul className="space-y-4">
            {CHECKLINES.map((line) => (
              <li key={line} className="flex items-start gap-3 text-landing-text-secondary">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-landing-accent-subtle text-xs font-bold text-landing-accent-light">
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>

          <div ref={wrapRef} className="relative mx-8 my-10 sm:mx-16">
            {!prefersReducedMotion && (
              <>
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 hidden flex-col items-center text-center lg:flex"
                  style={{ x: "-50%", y: labelY, scale: labelScale, opacity: labelOpacity }}
                >
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-landing-accent-light">32 bestätigte Funde</span>
                  <b className="mt-2 max-w-[14rem] font-display text-xl font-bold text-landing-text-primary">werden zusammengeführt</b>
                </motion.div>
                <div aria-hidden className="pointer-events-none absolute -inset-8 hidden lg:block">
                  {FRAGMENTS.map((fragment) => (
                    <ReportFragment key={fragment.label} fragment={fragment} gather={gatherEased} />
                  ))}
                </div>
              </>
            )}

            <motion.div
              className="relative rounded-3xl border border-landing-border bg-white p-7 text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-black/40"
              style={prefersReducedMotion ? undefined : { y: reportY, scale: reportScale, opacity: reportOpacity }}
            >
              <p className="font-display text-lg font-extrabold text-slate-900">effivo</p>
              <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-900">Recovery Report</h3>
              <p className="mt-1 text-xs text-slate-500">Analysezeitraum: Juli 2026</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {REPORT_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">{stat.label}</p>
                    <p className="mt-0.5 text-xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-landing-accent-subtle p-4">
                <p className="text-[10px] uppercase tracking-wide text-landing-accent">Bestätigtes Potenzial</p>
                <p className="mt-0.5 font-display text-3xl font-extrabold tracking-tight text-landing-accent">18.740 €</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportFragment({
  fragment,
  gather,
}: {
  fragment: { label: string; dir: [number, number]; className: string };
  gather: MotionValue<number>;
}) {
  const x = useTransform(gather, (g) => fragment.dir[0] * (1 - g));
  const y = useTransform(gather, (g) => fragment.dir[1] * (1 - g));
  const scale = useTransform(gather, (g) => 1 - 0.18 * g);
  const blurPx = useTransform(gather, (g) => 1.5 * g);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);
  const opacity = useTransform(gather, (g) => 0.84 * (1 - smoothstep((g - 0.66) / 0.28)));

  return (
    <motion.div
      className={`absolute w-[9.5rem] rounded-xl border border-landing-border bg-landing-card px-3 py-2.5 text-[11px] text-landing-text-secondary shadow-lg shadow-slate-900/10 ${fragment.className}`}
      style={{ x, y, scale, filter, opacity }}
    >
      <span className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-landing-accent-light">Bestätigt</span>
      {fragment.label}
    </motion.div>
  );
}
