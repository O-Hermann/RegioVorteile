import Link from "next/link";
import { UploadIcon, CheckIcon } from "@/components/icons";

// "Datenstatus"-Hero der linken Spalte, optisch 1:1 die ".status"-Karte aus
// der V12-Referenz (teal-tuerkiser Farbverlauf, Eyebrow, grosse Ueberschrift,
// Check-Kreis, Pill-Button). Der Inhalt bleibt dabei die bestehende ECHTE
// Drei-Zustands-Logik aus der Dashboard-Seite (kein Import / Import ohne
// Zuordnung / verarbeitet) - nur Zustand 3 deckt sich mit dem exakten V12-
// Demotext ("Analyse abgeschlossen"), Zustand 1/2 uebernehmen denselben
// visuellen Rahmen mit ihrem eigenen, bereits bestehenden echten Text.
export function StatusHero({
  dataImportCount,
  processedMonthCount,
  currentPeriodLabel,
}: {
  dataImportCount: number;
  processedMonthCount: number;
  currentPeriodLabel: string;
}) {
  const state =
    processedMonthCount > 0 ? ("processed" as const) : dataImportCount === 0 ? ("empty" as const) : ("pending" as const);

  return (
    <div
      className={`relative mb-2.5 min-h-[150px] overflow-hidden rounded-[14px] border border-white/10 bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 p-[17px_16px_14px] text-center text-white shadow-warm-lg ring-1 ring-inset ring-white/10 dark:border-[rgba(114,239,230,0.34)] dark:bg-[radial-gradient(260px_150px_at_94%_0%,rgba(128,255,245,0.13),transparent_64%),radial-gradient(260px_170px_at_5%_100%,rgba(62,221,211,0.09),transparent_70%),linear-gradient(135deg,#279fa1_0%,#16888e_43%,#0f707b_72%,#0a5b68_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.13),inset_0_-18px_34px_rgba(0,0,0,0.08),0_16px_32px_rgba(3,57,62,0.19),0_0_0_1px_rgba(83,239,228,0.045)] ${
        // V12s ".status:after" (dezentes Punktmuster unten rechts) und
        // ".status:before" (geschwungene, leicht rotierte Linie) - beides
        // rein dekorativ, nur im Dark Mode (Light Mode behaelt seine
        // eigenen, bereits bestehenden Blur-Orbs weiter unten).
        "dark:after:absolute dark:after:content-[''] dark:after:left-[5%] dark:after:right-[-10%] dark:after:bottom-[-31%] dark:after:top-auto dark:after:h-[94px] dark:after:opacity-55 dark:after:[transform:skewY(-9deg)] dark:after:bg-[radial-gradient(circle_at_10px_10px,rgba(182,255,249,0.72)_1.2px,transparent_1.4px)] dark:after:bg-[length:18px_18px] " +
        "dark:before:absolute dark:before:content-[''] dark:before:left-[-10%] dark:before:right-[-10%] dark:before:bottom-[23px] dark:before:h-[80px] dark:before:rounded-[999px] dark:before:border-t-2 dark:before:border-t-[rgba(191,255,251,0.26)] dark:before:[transform:rotate(-8deg)]"
      }`}
    >
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cockpit-accent-light/25 blur-3xl dark:hidden" />
      <div aria-hidden className="pointer-events-none absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-cockpit-accent/25 blur-3xl dark:hidden" />

      <div className="relative z-[1] flex flex-col items-center gap-0.5">
        <span className="inline-flex items-center justify-center gap-[7px] text-[10px] font-extrabold tracking-[0.19em] text-white/85 dark:text-[#ddfffc]">
          <i className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/70 shadow-[0_0_9px_rgba(255,255,255,0.5)] dark:bg-[#8dfff6] dark:shadow-[0_0_9px_rgba(141,255,246,0.68)]" />
          LETZTER DATENSTATUS
        </span>

        {state === "processed" ? (
          <>
            <h2 className="mt-1.5 text-[19.5px] font-bold leading-tight tracking-tight [text-shadow:0_1px_0_rgba(0,0,0,0.08)]">
              Analyse abgeschlossen
            </h2>
            <p className="text-[13.5px] text-white dark:text-[#f2ffff]">
              {processedMonthCount} {processedMonthCount === 1 ? "Monat" : "Monate"} verarbeitet
            </p>
            <p className="mt-0.5 text-[11.5px] text-white/75 dark:text-[#d0efed]">
              Letzte Analyse: {currentPeriodLabel}
            </p>
            <Link
              href="/arbeitgeber/dashboard/datenimporte"
              className="mt-[11px] inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/15 px-[15px] py-2 text-[11.5px] font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition-[transform,border-color,background] duration-150 hover:-translate-y-px hover:bg-white/25 dark:border-[rgba(222,255,252,0.15)] dark:bg-[linear-gradient(180deg,rgba(7,80,87,0.48),rgba(5,59,67,0.48))] dark:hover:border-[rgba(219,255,252,0.28)] dark:hover:bg-[linear-gradient(180deg,rgba(9,93,97,0.57),rgba(5,65,72,0.55))]"
            >
              Analysebericht ansehen <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
            </Link>
          </>
        ) : state === "empty" ? (
          <>
            <h2 className="mt-1.5 text-[19.5px] font-bold leading-tight tracking-tight [text-shadow:0_1px_0_rgba(0,0,0,0.08)]">
              Noch keine Daten
            </h2>
            <p className="text-[13.5px] text-white dark:text-[#f2ffff]">Es wurde noch kein Monatsimport verarbeitet.</p>
            <Link
              href="/arbeitgeber/dashboard/datenimporte/neu"
              className="mt-[11px] inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/15 px-[15px] py-2 text-[11.5px] font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition-[transform,border-color,background] duration-150 hover:-translate-y-px hover:bg-white/25 dark:border-[rgba(222,255,252,0.15)] dark:bg-[linear-gradient(180deg,rgba(7,80,87,0.48),rgba(5,59,67,0.48))] dark:hover:border-[rgba(219,255,252,0.28)] dark:hover:bg-[linear-gradient(180deg,rgba(9,93,97,0.57),rgba(5,65,72,0.55))]"
            >
              Ersten Datenimport starten →
            </Link>
          </>
        ) : (
          <>
            <h2 className="mt-1.5 text-[19.5px] font-bold leading-tight tracking-tight [text-shadow:0_1px_0_rgba(0,0,0,0.08)]">
              {dataImportCount} {dataImportCount === 1 ? "Datei" : "Dateien"} hochgeladen
            </h2>
            <p className="text-[13.5px] text-white dark:text-[#f2ffff]">Spaltenzuordnung steht noch aus.</p>
            <Link
              href="/arbeitgeber/dashboard/datenimporte"
              className="mt-[11px] inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/15 px-[15px] py-2 text-[11.5px] font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition-[transform,border-color,background] duration-150 hover:-translate-y-px hover:bg-white/25 dark:border-[rgba(222,255,252,0.15)] dark:bg-[linear-gradient(180deg,rgba(7,80,87,0.48),rgba(5,59,67,0.48))] dark:hover:border-[rgba(219,255,252,0.28)] dark:hover:bg-[linear-gradient(180deg,rgba(9,93,97,0.57),rgba(5,65,72,0.55))]"
            >
              Datenimport ansehen →
            </Link>
          </>
        )}
      </div>

      <span className="absolute right-3.5 top-3 z-[1] flex h-[39px] w-[39px] items-center justify-center rounded-full border border-white/25 bg-white/10 dark:border-[rgba(255,255,255,0.23)] dark:bg-[rgba(4,91,91,0.20)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        {state === "processed" ? <CheckIcon className="h-4 w-4 text-white" /> : <UploadIcon className="h-4 w-4 text-white/85" />}
      </span>
    </div>
  );
}
