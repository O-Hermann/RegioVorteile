import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/auth";
import { relativeTimeDe } from "@/lib/time";
import { CATEGORY_LABELS } from "@/lib/feedback";
import {
  TrendingUpIcon,
  TagIcon,
  ActivityIcon,
  FileTextIcon,
  BriefcaseIcon,
  UsersIcon,
  UploadIcon,
  AlertTriangleIcon,
  ChatIcon,
} from "@/components/icons";

// Gleiche hochwertige Karten-Basis wie im Admin-Dashboard, hier bewusst
// lokal dupliziert statt importiert, damit das Admin-Dashboard unveraendert
// bleibt (siehe dortiger Kommentar zum selben Muster).
const panelClass =
  "rounded-2xl border border-card-border/70 dark:border-white/10 bg-card dark:bg-gradient-to-b dark:from-cockpit-card dark:to-cockpit-card-dark shadow-sm dark:shadow-xl dark:shadow-black/30 transition-all duration-300";

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

// Kompakter Kartenkopf (Icon + Titel) fuer die mittlere Spalte.
function MiddleCardHeader({
  icon: Icon,
  title,
  color,
}: {
  icon: typeof TrendingUpIcon;
  title: string;
  color: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[color]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="font-display text-sm font-semibold tracking-tight text-sand-900">{title}</h3>
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

export default async function ArbeitgeberDashboardPage() {
  const { employer } = await requireEmployer();
  const now = new Date();

  const [user, recentEmployees, recentFeedback] = await Promise.all([
    prisma.user.findUnique({ where: { id: employer.userId } }),
    prisma.employee.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.feedback.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const emailLabel = user ? user.email.split("@")[0] : "Kunde";
  const emailDisplayName = emailLabel.charAt(0).toUpperCase() + emailLabel.slice(1);
  const displayName = employer.contactFirstName?.trim() || emailDisplayName;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const today = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Acht Unternehmenskennzahlen aus der Spezifikation. Fuer keine davon
  // existiert aktuell eine echte Datenquelle (kein Datenimport-/Finanz-/
  // Auftrags-/Kundenmodell im Schema) - daher bewusst "—" statt eines
  // erfundenen oder faelschlich echten Nullwerts. Sobald in einer spaeteren
  // Phase echte Werte verfuegbar sind, ersetzt hier jeweils ein echter Wert
  // den Platzhalter.
  const statTiles = [
    { label: "Umsatz", value: "—", icon: TrendingUpIcon, color: "emerald" },
    { label: "Kosten", value: "—", icon: TagIcon, color: "amber" },
    { label: "Ergebnis", value: "—", icon: ActivityIcon, color: "violet" },
    { label: "Offene Forderungen", value: "—", icon: FileTextIcon, color: "rose" },
    { label: "Offene Aufträge", value: "—", icon: BriefcaseIcon, color: "slate" },
    { label: "Aktive Kunden", value: "—", icon: UsersIcon, color: "sky" },
    { label: "Importierte Monate", value: "—", icon: UploadIcon, color: "ink" },
    { label: "Offene Datenfehler", value: "—", icon: AlertTriangleIcon, color: "amber" },
  ];

  // Handlungsbedarf: In dieser Phase existiert noch kein Datenimport-Modell,
  // daher ist "noch kein Import vorhanden" die einzige Aussage, die sich
  // sicher aus dem tatsaechlichen Datenstand ableiten laesst. Kein Link/CTA,
  // da noch keine funktionierende Importseite existiert.
  const actionItems = [
    {
      id: "no-import",
      label: "Noch keine Unternehmensdaten importiert.",
      icon: UploadIcon,
      color: "amber",
    },
  ];

  type ActivityItem = {
    id: string;
    label: string;
    detail: string;
    createdAt: Date;
    icon: typeof UsersIcon;
    color: string;
  };
  const activity: ActivityItem[] = [
    ...recentEmployees.map((e) => ({
      id: `employee-${e.id}`,
      label: "Benutzer eingeladen",
      detail: e.name,
      createdAt: e.createdAt,
      icon: UsersIcon,
      color: "sky",
    })),
    ...recentFeedback.map((f) => ({
      id: `feedback-${f.id}`,
      label: "Feedback eingereicht",
      detail: CATEGORY_LABELS[f.category],
      createdAt: f.createdAt,
      icon: ChatIcon,
      color: "rose",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 4);

  return (
    <div className="flex flex-col min-[1400px]:h-[calc(100dvh-9rem)]">
      <div className="flex items-baseline justify-between gap-3 shrink-0">
        <h1 className="font-display text-[28px] font-bold tracking-tight text-sand-900">Unternehmens-Übersicht</h1>
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
              <h2 className="truncate font-display text-base font-bold text-sand-900">
                Guten Tag, {displayName}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-700">
                  Unternehmensadmin
                </span>
                <span className={`truncate text-xs ${secondaryTextClass}`}>{employer.companyName}</span>
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
              <p className="font-display text-2xl font-extrabold leading-tight">Noch keine Daten</p>
              <p className="text-sm text-white/70">Es wurde noch kein Monatsimport verarbeitet.</p>
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

        {/* Mittlere Spalte: Unternehmensentwicklung */}
        <div className="grid min-w-0 grid-cols-1 grid-rows-[repeat(2,minmax(0,1fr))_auto] gap-3 sm:grid-cols-2 min-[1400px]:min-h-0">
          <div className={`${panelClass} flex flex-col !p-4`}>
            <MiddleCardHeader icon={ActivityIcon} title="Monatsvergleich" color="sky" />
            <EmptyCardBody text="Für einen Monatsvergleich werden mindestens zwei verarbeitete Monatsimporte benötigt." />
          </div>

          <div className={`${panelClass} flex flex-col !p-4`}>
            <MiddleCardHeader icon={TrendingUpIcon} title="Entwicklung" color="emerald" />
            <EmptyCardBody text="Nach dem ersten Datenimport wird hier die Unternehmensentwicklung dargestellt." />
          </div>

          <div className={`${panelClass} flex flex-col !p-4`}>
            <MiddleCardHeader icon={FileTextIcon} title="Finanzübersicht" color="violet" />
            <div className="mt-2 flex flex-1 min-h-0 flex-col justify-center gap-2">
              {[
                ["Umsatz", "—"],
                ["Kosten", "—"],
                ["Ergebnis", "—"],
                ["Offene Forderungen", "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className={secondaryTextClass}>{label}</span>
                  <span className="font-semibold text-sand-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${panelClass} flex flex-col !p-4`}>
            <MiddleCardHeader icon={BriefcaseIcon} title="Aufträge und Kunden" color="slate" />
            <EmptyCardBody text="Für diesen Bereich wurden noch keine Auftrags- oder Kundendaten importiert." />
          </div>

          <div className={`${panelClass} flex flex-col !p-4 sm:col-span-2`}>
            <MiddleCardHeader icon={TrendingUpIcon} title="Veränderungen im Überblick" color="ink" />
            <p className={`mt-1.5 text-[13px] leading-snug ${secondaryTextClass}`}>
              Sobald mindestens zwei Monatsimporte vorliegen, werden hier Veränderungen verständlich zusammengefasst.
            </p>
          </div>
        </div>

        {/* Rechte Spalte: Handlungsbedarf + Letzte Datenaktivitäten, fest 50/50 */}
        <div className="flex min-w-0 flex-col gap-4 min-[1400px]:min-h-0">
          <div className={`${panelClass} flex flex-1 basis-0 flex-col !p-5 min-[1400px]:min-h-0`}>
            <h3 className="shrink-0 font-display text-lg font-semibold tracking-tight text-sand-900">Handlungsbedarf</h3>
            <ul className="mt-2 min-h-0 flex-1 divide-y divide-card-border/60 dark:divide-white/5">
              {actionItems.map((item) => (
                <li key={item.id} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[item.color]}`}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <p className="truncate text-sm text-sand-800 dark:text-cockpit-text">{item.label}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${panelClass} flex flex-1 basis-0 flex-col gap-1 !p-5 min-[1400px]:min-h-0`}>
            <h3 className="shrink-0 font-display text-lg font-semibold tracking-tight text-sand-900">Letzte Datenaktivitäten</h3>
            {activity.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className={`text-sm ${secondaryTextClass}`}>Bisher sind keine Datenaktivitäten vorhanden.</p>
              </div>
            ) : (
              <ul className="mt-1">
                {activity.map((a) => (
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
