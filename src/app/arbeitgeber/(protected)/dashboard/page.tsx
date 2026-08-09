import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCompanyMember } from "@/lib/auth";
import { relativeTimeDe } from "@/lib/time";
import { COMPANY_ROLE_LABELS } from "@/lib/company";
import { periodLabel, DATA_IMPORT_CATEGORY_LABELS } from "@/lib/data-import";
import {
  getCompanyMetrics,
  formatEuroCompact,
  formatEuroDetailed,
  formatChange,
  changeTone,
  type MonthPeriod,
  type MetricChange,
} from "@/lib/company-metrics";
import type { Prisma } from "@/generated/prisma/client";
import { getCustomerCounts } from "@/lib/customers";
import { QuickActionButton } from "@/components/quick-action-button";
import {
  TrendingUpIcon,
  TagIcon,
  ActivityIcon,
  FileTextIcon,
  BriefcaseIcon,
  UsersIcon,
  UploadIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@/components/icons";

// Gleiche hochwertige Karten-Basis wie im Admin-Dashboard, hier bewusst
// lokal dupliziert statt importiert, damit das Admin-Dashboard unveraendert
// bleibt (siehe dortiger Kommentar zum selben Muster).
const panelClass =
  "rounded-2xl border border-card-border/70 dark:border-white/10 bg-card dark:bg-gradient-to-b dark:from-cockpit-card dark:to-cockpit-card-dark shadow-sm dark:shadow-xl dark:shadow-black/30 transition-all duration-300";

const panelHoverClass =
  "hover:-translate-y-0.5 hover:border-ink-300 dark:hover:border-cockpit-accent-light/40 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-cockpit-accent/20";

const secondaryTextClass = "text-sand-500 dark:text-cockpit-text-secondary";

const ACCENT_CLASSES: Record<string, string> = {
  sky: "bg-gradient-to-br from-sky-400/30 to-sky-500/10 text-sky-600 dark:text-sky-200 border border-sky-400/30 dark:border-sky-300/25 ring-1 ring-inset ring-white/10 shadow-md shadow-sky-500/10 dark:shadow-sky-400/20",
  emerald:
    "bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 text-emerald-600 dark:text-emerald-200 border border-emerald-400/30 dark:border-emerald-300/25 ring-1 ring-inset ring-white/10 shadow-md shadow-emerald-500/10 dark:shadow-emerald-400/20",
  violet:
    "bg-gradient-to-br from-violet-400/30 to-violet-500/10 text-violet-600 dark:text-violet-200 border border-violet-400/30 dark:border-violet-300/25 ring-1 ring-inset ring-white/10 shadow-md shadow-violet-500/10 dark:shadow-violet-400/20",
  amber:
    "bg-gradient-to-br from-amber-400/35 to-amber-500/10 text-amber-600 dark:text-amber-200 border border-amber-400/35 dark:border-amber-300/30 ring-1 ring-inset ring-white/10 shadow-md shadow-amber-500/15 dark:shadow-amber-400/25",
  rose: "bg-gradient-to-br from-rose-400/35 to-rose-500/10 text-rose-600 dark:text-rose-200 border border-rose-400/35 dark:border-rose-300/30 ring-1 ring-inset ring-white/10 shadow-md shadow-rose-500/15 dark:shadow-rose-400/25",
  slate:
    "bg-gradient-to-br from-slate-400/30 to-slate-500/10 text-slate-600 dark:text-slate-200 border border-slate-400/30 dark:border-slate-300/25 ring-1 ring-inset ring-white/10 shadow-md shadow-slate-500/10 dark:shadow-slate-400/15",
  ink: "bg-gradient-to-br from-ink-400/30 to-ink-500/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/30 ring-1 ring-inset ring-white/10 shadow-md shadow-ink-500/10 dark:shadow-cockpit-accent/25",
};

// Rein dekorative Linie fuer die Datenstatus-Karte - keine echten oder
// erfundenen Werte, ausschliesslich optische Auflockerung. Bewusst lokal
// dupliziert statt importiert, siehe Kommentar oben zu panelClass.
function DecorativeTrendGraph() {
  const points: [number, number][] = [
    [0, 46],
    [28, 40],
    [56, 42],
    [84, 28],
    [112, 31],
    [140, 16],
    [168, 19],
    [196, 6],
  ];
  const polylinePoints = points.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg
      aria-hidden
      viewBox="0 0 196 52"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full opacity-50"
    >
      <defs>
        <linearGradient id="companyTrendLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="url(#companyTrendLine)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#99f6e4" fillOpacity="0.85" />
      ))}
    </svg>
  );
}

// Kompakter Kartenkopf (Icon + Titel) fuer die mittlere Spalte. Bei
// verlinkten Karten erscheint rechts ein dezenter Pfeil, der beim Hover
// der Karte (group-hover) nach rechts wandert - gleiches Affordance-Muster
// wie die "Öffnen"-Module im Admin-Dashboard.
function MiddleCardHeader({
  icon: Icon,
  title,
  color,
  linked,
}: {
  icon: typeof TrendingUpIcon;
  title: string;
  color: string;
  linked?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[color]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="font-display text-sm font-semibold tracking-tight text-sand-900">{title}</h3>
      {linked && (
        <ArrowRightIcon className="ml-auto h-3.5 w-3.5 shrink-0 text-sand-300 dark:text-cockpit-text-weak transition-transform group-hover:translate-x-1 group-hover:text-ink-600 dark:group-hover:text-cockpit-accent-light" />
      )}
    </div>
  );
}

// Zentrierter Leerzustand innerhalb einer Karte der mittleren Spalte -
// wird gezeigt, solange fuer den jeweiligen Bereich noch keine echte
// Datenquelle vorhanden ist (kein Import-/Auftrags-/Kundenmodell).
function EmptyCardBody({ text }: { text: string }) {
  return (
    <div className="flex flex-1 min-h-0 items-center justify-center text-center">
      <p className={`text-[13px] leading-snug ${secondaryTextClass}`}>{text}</p>
    </div>
  );
}

const CHANGE_TONE_CLASSES: Record<"positive" | "negative" | "neutral", string> = {
  positive: "text-emerald-600 dark:text-emerald-300",
  negative: "text-rose-600 dark:text-rose-300",
  neutral: secondaryTextClass,
};

// Eine Vergleichszeile im Monatsvergleich-Modul (Punkt 8/9) - die Farbe der
// Veraenderung haengt von "direction" ab: bei offenen Forderungen ist ein
// Rueckgang positiv, bei Umsatz/Kunden ein Anstieg.
function ComparisonRow({
  label,
  current,
  previous,
  change,
  direction,
}: {
  label: string;
  current: string;
  previous: string;
  change: MetricChange | null;
  direction: "up-good" | "down-good";
}) {
  const tone = changeTone(change, direction);
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={secondaryTextClass}>{label}</span>
      <div className="text-right">
        <span className="font-semibold text-sand-900 dark:text-cockpit-heading">{current}</span>
        <span className={`ml-2 text-xs font-medium ${CHANGE_TONE_CLASSES[tone]}`}>{formatChange(change)}</span>
        <p className={`text-[11px] ${secondaryTextClass}`}>Vormonat: {previous}</p>
      </div>
    </div>
  );
}

// Ruhige, hochwertige Mini-Sparkline fuer die Umsatzentwicklung (Punkt 10) -
// bewusst als einfaches Inline-SVG statt einer externen Chartbibliothek,
// gleiche Farbsprache wie die bestehende DecorativeTrendGraph oben.
function RevenueSparkline({ history }: { history: { period: MonthPeriod; revenue: Prisma.Decimal }[] }) {
  const values = history.map((h) => h.revenue.toNumber());
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 220;
  const height = 56;
  const padY = 8;
  const stepX = history.length > 1 ? width / (history.length - 1) : 0;
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - padY - ((v - min) / range) * (height - padY * 2);
    return [x, y] as [number, number];
  });
  const polylinePoints = points.map(([x, y]) => `${x},${y}`).join(" ");
  const first = history[0];
  const last = history[history.length - 1];

  return (
    <div className="mt-2 flex flex-1 min-h-0 flex-col justify-center gap-3">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-14 w-full overflow-visible">
        <defs>
          <linearGradient id="revenueSparklineLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5eead4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="url(#revenueSparklineLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="#99f6e4" fillOpacity="0.9" />
        ))}
      </svg>
      <div className="flex items-center justify-between text-xs">
        <div>
          <p className={secondaryTextClass}>{periodLabel(first.period.periodMonth, first.period.periodYear)}</p>
          <p className="font-semibold text-sand-900 dark:text-cockpit-heading">{formatEuroCompact(first.revenue)}</p>
        </div>
        <div className="text-right">
          <p className={secondaryTextClass}>{periodLabel(last.period.periodMonth, last.period.periodYear)}</p>
          <p className="font-semibold text-sand-900 dark:text-cockpit-heading">{formatEuroCompact(last.revenue)}</p>
        </div>
      </div>
    </div>
  );
}

export default async function ArbeitgeberDashboardPage() {
  const { user, company, membership } = await requireCompanyMember();
  const now = new Date();

  const [memberships, dataImportCount, pendingMappingCount, recentDataImports, recentProcessedImports, metrics, customerCounts] = await Promise.all([
    prisma.companyMembership.findMany({
      where: { companyId: company.id },
      orderBy: { invitedAt: "desc" },
      take: 10,
      include: { user: true },
    }),
    prisma.dataImport.count({ where: { companyId: company.id } }),
    prisma.dataImport.count({ where: { companyId: company.id, status: "READY_FOR_MAPPING" } }),
    prisma.dataImport.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.dataImport.findMany({
      where: { companyId: company.id, status: "PROCESSED" },
      orderBy: { processedAt: "desc" },
      take: 5,
    }),
    // Phase 5.1: zentrale, company-gescopte Kennzahlenaggregation (Punkt 13) -
    // "Importierte Monate" lebt jetzt hier (unveraendert gegenueber Phase 4).
    getCompanyMetrics(company.id),
    // Phase 6.1: echte Customer-Zahlen fuer die "Aufträge und Kunden"-Karte
    // (Punkt 32) - bewusst eine eigene, von den Finanzkennzahlen komplett
    // getrennte Aggregation (siehe Kommentar an der Karte unten, Punkt 33).
    getCustomerCounts(company.id),
  ]);
  const processedMonthCount = metrics.importedMonthCount;

  const greetingName = user.firstName?.trim();
  const greeting = greetingName ? `Guten Tag, ${greetingName}` : "Guten Tag";
  const avatarInitial = (greetingName ?? user.email).charAt(0).toUpperCase();
  const roleLabel = COMPANY_ROLE_LABELS[membership.role];
  const today = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Phase 5.1: Umsatz, offene Forderungen, Kunden mit Umsatz, importierte
  // Monate und offene Datenfehler kommen jetzt aus der zentralen Aggregation
  // (getCompanyMetrics) und basieren ausschliesslich auf tatsaechlich
  // PROCESSED-Finanzimporten. Kosten/Ergebnis/Offene Auftraege bleiben
  // bewusst "—" - dafuer existiert weiterhin keine verlaessliche Datenquelle
  // (Punkt 6): Ergebnis != Umsatz, offene Rechnungen != offene Auftraege.
  const statTiles = [
    { label: "Umsatz", value: formatEuroCompact(metrics.revenueCurrent), icon: TrendingUpIcon, color: "emerald" },
    { label: "Kosten", value: "—", icon: TagIcon, color: "amber" },
    { label: "Ergebnis", value: "—", icon: ActivityIcon, color: "violet" },
    { label: "Offene Forderungen", value: formatEuroCompact(metrics.openReceivablesCurrent), icon: FileTextIcon, color: "rose" },
    { label: "Offene Aufträge", value: "—", icon: BriefcaseIcon, color: "slate" },
    {
      label: "Kunden mit Umsatz",
      value: metrics.customersWithRevenueCurrent === null ? "—" : String(metrics.customersWithRevenueCurrent),
      icon: UsersIcon,
      color: "sky",
    },
    { label: "Importierte Monate", value: processedMonthCount > 0 ? String(processedMonthCount) : "—", icon: UploadIcon, color: "ink" },
    { label: "Offene Datenfehler", value: String(metrics.openImportErrorCount), icon: AlertTriangleIcon, color: "amber" },
  ];

  // Handlungsbedarf: solange kein Import existiert, auf den Upload
  // hinweisen; sobald mindestens einer wartet, auf die noch ausstehende
  // Spaltenzuordnung (Phase 4) - beides aus echten DataImport-Zahlen
  // abgeleitet, keine erfundenen Werte.
  const actionItems =
    dataImportCount === 0
      ? [
          {
            id: "no-import",
            label: "Noch keine Unternehmensdaten importiert.",
            icon: UploadIcon,
            color: "amber",
            href: "/arbeitgeber/dashboard/datenimporte/neu",
            cta: "Import starten",
          },
        ]
      : pendingMappingCount > 0
        ? [
            {
              id: "pending-mapping",
              label: `${pendingMappingCount} ${pendingMappingCount === 1 ? "Datenimport wartet" : "Datenimporte warten"} auf Zuordnung`,
              icon: UploadIcon,
              color: "amber",
              href: "/arbeitgeber/dashboard/datenimporte",
              cta: "Ansehen",
            },
          ]
        : [];

  type ActivityItem = {
    id: string;
    label: string;
    detail: string;
    createdAt: Date;
    icon: typeof UsersIcon;
    color: string;
  };
  const activity: ActivityItem[] = [];
  for (const m of memberships) {
    const name = [m.user.firstName, m.user.lastName].filter(Boolean).join(" ") || m.user.email;
    activity.push({
      id: `invited-${m.id}`,
      label: "Benutzer eingeladen",
      detail: name,
      createdAt: m.invitedAt,
      icon: UsersIcon,
      color: "sky",
    });
    if (m.activatedAt) {
      activity.push({
        id: `activated-${m.id}`,
        label: "Benutzer aktiviert",
        detail: name,
        createdAt: m.activatedAt,
        icon: UsersIcon,
        color: "emerald",
      });
    }
  }
  for (const i of recentDataImports) {
    activity.push({
      id: `import-${i.id}`,
      label: "Datenimport hochgeladen",
      detail: `${DATA_IMPORT_CATEGORY_LABELS[i.category]} · ${periodLabel(i.periodMonth, i.periodYear)}`,
      createdAt: i.createdAt,
      icon: UploadIcon,
      color: "ink",
    });
  }
  for (const i of recentProcessedImports) {
    if (!i.processedAt) continue;
    activity.push({
      id: `processed-${i.id}`,
      label: "Datenimport verarbeitet",
      detail: `${DATA_IMPORT_CATEGORY_LABELS[i.category]} · ${periodLabel(i.periodMonth, i.periodYear)}`,
      createdAt: i.processedAt,
      icon: CheckCircleIcon,
      color: "emerald",
    });
  }
  const recentActivity = activity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4);

  return (
    <div className="flex flex-col min-[1400px]:h-[calc(100dvh-9rem)]">
      <div className="flex items-baseline justify-between gap-3 shrink-0">
        <h1 className="font-display text-[28px] font-bold tracking-tight text-sand-900">Effivo-Übersicht</h1>
        <p className={`text-sm ${secondaryTextClass}`}>{today}</p>
      </div>

      <div className="mt-1.5 grid grid-cols-1 gap-6 min-[1400px]:min-h-0 min-[1400px]:flex-1 xl:grid-cols-[29fr_37fr_32fr] xl:items-stretch">
        {/* Linke Spalte: Unternehmen und Datenstatus */}
        <div className={`${panelClass} flex min-w-0 flex-col gap-4 !p-5 min-[1400px]:min-h-0`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 dark:from-cockpit-accent dark:to-cockpit-accent-dark font-display text-lg font-bold text-white shadow-md shadow-ink-900/20">
              {avatarInitial}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-bold text-sand-900">{greeting}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-700">
                  {roleLabel}
                </span>
                <span className={`truncate text-xs ${secondaryTextClass}`}>· {company.name}</span>
              </div>
            </div>
          </div>

          {/* Datenstatus - Pendant zur Plattformstatus-Karte im Admin-Dashboard */}
          <div className="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 dark:from-cockpit-accent-light dark:via-cockpit-accent-dark dark:to-cockpit-header p-5 text-white shadow-warm-lg ring-1 ring-inset ring-white/10">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cockpit-accent-light/25 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-cockpit-accent/25 blur-3xl" />
            <DecorativeTrendGraph />
            <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
              <UploadIcon className="h-3.5 w-3.5 text-white/85" />
            </span>
            <div className="relative flex flex-col items-center gap-1.5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Datenstatus</p>
              {processedMonthCount > 0 ? (
                <>
                  <p className="font-display text-2xl font-extrabold leading-tight">
                    {processedMonthCount} {processedMonthCount === 1 ? "Monat" : "Monate"} verarbeitet
                  </p>
                  <p className="text-sm text-white/70">
                    {metrics.currentPeriod ? periodLabel(metrics.currentPeriod.periodMonth, metrics.currentPeriod.periodYear) : ""}
                  </p>
                  <Link
                    href="/arbeitgeber/dashboard/datenimporte"
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink-800 hover:bg-white/90 transition-colors"
                  >
                    Datenimport ansehen
                  </Link>
                  <p className="text-[11px] text-white/60">Weitere Kennzahlen folgen in einem späteren Schritt.</p>
                </>
              ) : dataImportCount === 0 ? (
                <>
                  <p className="font-display text-2xl font-extrabold leading-tight">Noch keine Daten</p>
                  <p className="text-sm text-white/70">Es wurde noch kein Monatsimport verarbeitet.</p>
                  <Link
                    href="/arbeitgeber/dashboard/datenimporte/neu"
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink-800 hover:bg-white/90 transition-colors"
                  >
                    Ersten Datenimport starten
                  </Link>
                  <p className="text-[11px] text-white/60">
                    Excel- oder CSV-Datei für einen Monatszeitraum hochladen.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl font-extrabold leading-tight">
                    {dataImportCount} {dataImportCount === 1 ? "Datei" : "Dateien"} hochgeladen
                  </p>
                  <p className="text-sm text-white/70">Spaltenzuordnung steht noch aus.</p>
                  <Link
                    href="/arbeitgeber/dashboard/datenimporte"
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink-800 hover:bg-white/90 transition-colors"
                  >
                    Datenimport ansehen
                  </Link>
                  <p className="text-[11px] text-white/60">
                    Die Verarbeitung zu Kennzahlen folgt in einem späteren Schritt.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 grid-rows-4 gap-2.5 min-[1400px]:min-h-0">
            {statTiles.map((tile) => (
              <div
                key={tile.label}
                className={`${panelClass} flex flex-col justify-center !p-3.5`}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${ACCENT_CLASSES[tile.color]}`}
                >
                  <tile.icon className="h-3.5 w-3.5" />
                </span>
                <p className="mt-1 font-display text-[26px] font-extrabold leading-none tracking-tight text-sand-900">
                  {tile.value}
                </p>
                <p className={`mt-0.5 text-[13px] leading-tight ${secondaryTextClass}`}>{tile.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mittlere Spalte: Unternehmensentwicklung - alle Karten fuehren zu
            einer eigenen Zielseite mit Leerzustand, sobald noch keine echten
            Daten vorhanden sind (kein Fake-Inhalt, nur die Erklaerung zieht um).
            Kartenhoehe ist bewusst ueber ein explizites min-h auf jeder Karte
            fixiert statt ueber minmax(0,1fr)-Zeilen, die den verfuegbaren
            Spaltenrest fuellen wuerden - dadurch bleibt die Modulgroesse
            stabil und unabhaengig davon, was sonst noch in der Spalte steht.
            Die Schnellaktion sitzt direkt unter dem 2x2-Raster als bewusster
            Spaltenabschluss (kein Grid-Modul, kein viewportweites Floating-
            Element) und wird ueber "flex justify-center" zur mittleren
            Spalte zentriert, nicht zum gesamten Viewport. Freier Raum
            darunter (falls die Spalte durch die anderen Spalten gestreckt
            wird) bleibt bewusst normaler Dashboard-Hintergrund. */}
        <div className="flex min-w-0 flex-col min-[1400px]:min-h-0">
          <div className="grid grid-cols-1 auto-rows-min gap-3 sm:grid-cols-2">
            <Link
              href="/arbeitgeber/dashboard/monatsvergleich"
              className={`${panelClass} ${panelHoverClass} group flex min-h-[300px] flex-col !p-4`}
            >
              <MiddleCardHeader icon={ActivityIcon} title="Monatsvergleich" color="sky" linked />
              {metrics.currentPeriod && metrics.previousPeriod ? (
                <div className="mt-2 flex flex-1 min-h-0 flex-col justify-center gap-3">
                  <p className={`text-[11px] ${secondaryTextClass}`}>
                    {periodLabel(metrics.currentPeriod.periodMonth, metrics.currentPeriod.periodYear)} ggü.{" "}
                    {periodLabel(metrics.previousPeriod.periodMonth, metrics.previousPeriod.periodYear)}
                  </p>
                  <ComparisonRow
                    label="Umsatz"
                    current={formatEuroDetailed(metrics.revenueCurrent)}
                    previous={formatEuroDetailed(metrics.revenuePrevious)}
                    change={metrics.revenueChange}
                    direction="up-good"
                  />
                  <ComparisonRow
                    label="Offene Forderungen"
                    current={formatEuroDetailed(metrics.openReceivablesCurrent)}
                    previous={formatEuroDetailed(metrics.openReceivablesPrevious)}
                    change={metrics.openReceivablesChange}
                    direction="down-good"
                  />
                  <ComparisonRow
                    label="Kunden mit Umsatz"
                    current={String(metrics.customersWithRevenueCurrent ?? "—")}
                    previous={String(metrics.customersWithRevenuePrevious ?? "—")}
                    change={metrics.customersWithRevenueChange}
                    direction="up-good"
                  />
                </div>
              ) : (
                <EmptyCardBody text="Für einen Monatsvergleich werden mindestens zwei verarbeitete Monatsimporte benötigt." />
              )}
            </Link>

            <Link
              href="/arbeitgeber/dashboard/entwicklung"
              className={`${panelClass} ${panelHoverClass} group flex min-h-[300px] flex-col !p-4`}
            >
              <MiddleCardHeader icon={TrendingUpIcon} title="Entwicklung" color="emerald" linked />
              {metrics.revenueHistory.length >= 2 ? (
                <RevenueSparkline history={metrics.revenueHistory} />
              ) : (
                <EmptyCardBody text="Nach dem ersten Datenimport wird hier die Unternehmensentwicklung dargestellt." />
              )}
            </Link>

            <Link
              href="/arbeitgeber/dashboard/finanzuebersicht"
              className={`${panelClass} ${panelHoverClass} group flex min-h-[300px] flex-col !p-4`}
            >
              <MiddleCardHeader icon={FileTextIcon} title="Finanzübersicht" color="violet" linked />
              <div className="mt-2 flex flex-1 min-h-0 flex-col justify-center gap-2">
                {[
                  ["Umsatz", formatEuroCompact(metrics.revenueCurrent)],
                  ["Kosten", "—"],
                  ["Ergebnis", "—"],
                  ["Offene Forderungen", formatEuroCompact(metrics.openReceivablesCurrent)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className={secondaryTextClass}>{label}</span>
                    <span className="font-semibold text-sand-900">{value}</span>
                  </div>
                ))}
              </div>
            </Link>

            {/* Phase 6.1 (Punkt 32/33): der Kunden-Anteil dieser Karte zeigt
                jetzt echte Customer-Zahlen aus dem neuen Kunden-Grundsystem -
                bewusst STRIKT getrennt von der Finanzkennzahl "Kunden mit
                Umsatz" (die aus importierten Rechnungsdaten stammt, siehe
                metrics.customersWithRevenueCurrent weiter oben). Der
                Aufträge-Anteil bleibt unveraendert leer, dafuer existiert
                weiterhin keine Datenquelle. Ziel der Karte ist jetzt /kunden
                statt der allgemeinen Placeholder-Seite, da dort der einzige
                bereits befuellte Teilbereich liegt. */}
            <Link
              href="/arbeitgeber/dashboard/kunden"
              className={`${panelClass} ${panelHoverClass} group flex min-h-[300px] flex-col !p-4`}
            >
              <MiddleCardHeader icon={BriefcaseIcon} title="Aufträge und Kunden" color="slate" linked />
              <div className="mt-2 flex flex-1 min-h-0 flex-col justify-center gap-2">
                {customerCounts.total > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className={secondaryTextClass}>Aktive Kunden</span>
                      <span className="font-semibold text-sand-900 dark:text-cockpit-heading">{customerCounts.active}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={secondaryTextClass}>Gesamt</span>
                      <span className="font-semibold text-sand-900 dark:text-cockpit-heading">{customerCounts.total}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-ink-600 dark:text-cockpit-accent-light">Kunden öffnen →</p>
                  </>
                ) : (
                  <>
                    <p className={`text-[13px] leading-snug ${secondaryTextClass}`}>Noch keine Kunden angelegt.</p>
                    <p className="text-xs font-semibold text-ink-600 dark:text-cockpit-accent-light">Kunden anlegen →</p>
                  </>
                )}
              </div>
            </Link>
          </div>

          <div className="mt-7 flex justify-center">
            <QuickActionButton />
          </div>
        </div>

        {/* Rechte Spalte: Handlungsbedarf + Letzte Aktivitäten, fest 50/50 */}
        <div className="flex min-w-0 flex-col gap-4 min-[1400px]:min-h-0">
          <div className={`${panelClass} flex flex-1 basis-0 flex-col !p-5 min-[1400px]:min-h-0`}>
            <h3 className="shrink-0 font-display text-lg font-semibold tracking-tight text-sand-900">Handlungsbedarf</h3>
            {actionItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2.5 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 text-emerald-600 dark:text-emerald-200 border border-emerald-400/30 dark:border-emerald-300/25 ring-1 ring-inset ring-white/10">
                  <CheckCircleIcon className="h-5 w-5" />
                </span>
                <p className={`text-sm ${secondaryTextClass}`}>Aktuell besteht kein Handlungsbedarf.</p>
              </div>
            ) : (
            <ul className="mt-2 min-h-0 flex-1 divide-y divide-card-border/60 dark:divide-white/5">
              {actionItems.map((item) => (
                <li key={item.id} className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[item.color]}`}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <p className="truncate text-sm text-sand-800 dark:text-cockpit-text">{item.label}</p>
                  </div>
                  <Link
                    href={item.href}
                    className="shrink-0 rounded-full border border-card-border dark:border-white/15 px-4 py-2 text-xs font-semibold text-sand-800 dark:text-cockpit-text hover:border-ink-400 dark:hover:border-cockpit-accent-light/50 hover:text-ink-700 dark:hover:text-cockpit-accent-light hover:bg-ink-50 dark:hover:bg-cockpit-accent-subtle/40 transition-colors"
                  >
                    {item.cta}
                  </Link>
                </li>
              ))}
            </ul>
            )}
          </div>

          <div className={`${panelClass} flex flex-1 basis-0 flex-col gap-1 !p-5 min-[1400px]:min-h-0`}>
            <h3 className="shrink-0 font-display text-lg font-semibold tracking-tight text-sand-900">Letzte Aktivitäten</h3>
            {recentActivity.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className={`text-sm ${secondaryTextClass}`}>Bisher sind keine Aktivitäten vorhanden.</p>
              </div>
            ) : (
              <ul className="mt-1">
                {recentActivity.map((a) => (
                  <li
                    key={a.id}
                    className="-mx-2 flex items-start gap-3 rounded-xl border-b border-card-border/60 px-2 py-2.5 text-sm last:border-0 dark:border-white/5"
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[a.color]}`}
                    >
                      <a.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-medium text-sand-900">{a.label}</p>
                        <span className={`shrink-0 text-xs ${secondaryTextClass}`}>{relativeTimeDe(a.createdAt)}</span>
                      </div>
                      <p className={`truncate text-xs ${secondaryTextClass}`}>{a.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
