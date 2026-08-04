import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { relativeTimeDe } from "@/lib/time";
import { SITE_NAME } from "@/lib/site-config";
import {
  BriefcaseIcon,
  InboxIcon,
  ChatIcon,
  FileTextIcon,
  UsersIcon,
  TrendingUpIcon,
  ActivityIcon,
  UploadIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/icons";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

// Hochwertigere Karten-Basis nur fuer die Admin-Uebersicht: dezenter
// Farbverlauf + weicher Tiefenschatten im Dunkelmodus, schlichte helle
// Karte im Hellmodus. Bewusst lokal statt der geteilten cardClass, damit
// andere Admin-Seiten (Unternehmen, Kontaktanfragen, ...) unveraendert bleiben.
const panelClass =
  "rounded-2xl border border-card-border/70 dark:border-white/10 bg-card dark:bg-gradient-to-b dark:from-cockpit-card dark:to-cockpit-card-dark shadow-sm dark:shadow-xl dark:shadow-black/30 transition-all duration-300";

const panelHoverClass =
  "hover:-translate-y-0.5 hover:border-ink-300 dark:hover:border-cockpit-accent-light/40 hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-cockpit-accent/20";

const ACCENT_CLASSES: Record<string, string> = {
  sky: "bg-gradient-to-br from-sky-400/25 to-sky-600/5 text-sky-600 dark:text-sky-300 border border-sky-400/30 dark:border-sky-400/20 shadow-lg shadow-sky-500/10 dark:shadow-sky-500/20",
  emerald:
    "bg-gradient-to-br from-emerald-400/25 to-emerald-600/5 text-emerald-600 dark:text-emerald-300 border border-emerald-400/30 dark:border-emerald-400/20 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/20",
  violet:
    "bg-gradient-to-br from-violet-400/25 to-violet-600/5 text-violet-600 dark:text-violet-300 border border-violet-400/30 dark:border-violet-400/20 shadow-lg shadow-violet-500/10 dark:shadow-violet-500/20",
  amber:
    "bg-gradient-to-br from-amber-400/25 to-amber-600/5 text-amber-600 dark:text-amber-300 border border-amber-400/30 dark:border-amber-400/20 shadow-lg shadow-amber-500/10 dark:shadow-amber-500/20",
  rose: "bg-gradient-to-br from-rose-400/25 to-rose-600/5 text-rose-600 dark:text-rose-300 border border-rose-400/30 dark:border-rose-400/20 shadow-lg shadow-rose-500/10 dark:shadow-rose-500/20",
  slate:
    "bg-gradient-to-br from-slate-400/25 to-slate-600/5 text-slate-600 dark:text-slate-300 border border-slate-400/30 dark:border-slate-400/20 shadow-lg shadow-slate-500/10 dark:shadow-slate-500/15",
  ink: "bg-gradient-to-br from-ink-400/25 to-ink-600/10 text-ink-700 dark:text-cockpit-accent-light border border-ink-400/30 dark:border-cockpit-accent-light/25 shadow-lg shadow-ink-500/10 dark:shadow-cockpit-accent/25",
};

// Module-Karten der mittleren Spalte. Karten ohne href verweisen auf noch
// nicht gebaute Funktionen (kein Datenmodell/keine Seite vorhanden) - sie
// werden bewusst nicht verlinkt statt einen fiktiven/toten Link zu zeigen.
type ModuleCard = {
  title: string;
  description: string;
  icon: typeof BriefcaseIcon;
  color: string;
  href?: string;
  badge?: string;
  wide?: boolean;
};

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const now = new Date();

  const [
    admin,
    totalEmployerCount,
    activeEmployerCount,
    pendingApprovalCount,
    employerUserCount,
    activeEmployeeCount,
    openFeedbackCount,
    openContactRequestCount,
    activeEmployersWithTier,
    recentEmployers,
    recentEmployees,
    recentContactRequests,
    recentFeedback,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.employer.count(),
    prisma.employer.count({ where: { approved: true, subscriptionStatus: "aktiv" } }),
    prisma.employer.count({ where: { approved: false } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.feedback.count({ where: { status: "OPEN" } }),
    prisma.contactRequest.count({ where: { status: "OPEN" } }),
    prisma.employer.findMany({
      where: { approved: true, subscriptionStatus: "aktiv" },
      include: { pricingTier: true },
    }),
    prisma.employer.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { employer: true },
    }),
    prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { employer: true, employee: true },
    }),
  ]);

  // "Aktive Benutzer": alle Personen mit funktionierendem Login auf der
  // Plattform - Arbeitgeber-Accounts (User) plus aktivierte Mitarbeiter-Zugaenge
  // (Employee). Es gibt noch kein "zuletzt aktiv"-Tracking, daher zaehlt hier
  // "aktiv" = hat einen nutzbaren Zugang, nicht "kuerzlich eingeloggt".
  const activeUserCount = employerUserCount + activeEmployeeCount;

  const monthlyRevenueCents = activeEmployersWithTier.reduce(
    (sum, e) => sum + e.pricingTier.monthlyPriceCents,
    0
  );

  // Diese vier Kennzahlen haben noch keine echte Datenquelle im Projekt
  // (kein Datenimport-/Analyse-/Importfehler-Modell) - bewusst 0, keine
  // erfundenen Werte. Siehe Abschlussbericht an den Nutzer.
  const monthlyUploadsCount = 0;
  const analysesCreatedCount = 0;
  const importErrorsCount = 0;
  const analysesPendingApprovalCount = 0;

  const adminLabel = admin ? admin.email.split("@")[0] : "Admin";
  const adminDisplayName = adminLabel.charAt(0).toUpperCase() + adminLabel.slice(1);
  const avatarInitial = adminDisplayName.charAt(0).toUpperCase();
  const today = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statTiles = [
    { label: "Unternehmen", value: totalEmployerCount, icon: BriefcaseIcon, color: "violet" },
    { label: "Aktive Benutzer", value: activeUserCount, icon: UsersIcon, color: "sky" },
    { label: "Uploads im Monat", value: monthlyUploadsCount, icon: UploadIcon, color: "slate" },
    { label: "Erstellte Analysen", value: analysesCreatedCount, icon: ActivityIcon, color: "emerald" },
    { label: "Offene Importfehler", value: importErrorsCount, icon: AlertTriangleIcon, color: "amber" },
    { label: "Supportfälle", value: openFeedbackCount, icon: ChatIcon, color: "rose" },
    { label: "MRR", value: formatPrice(monthlyRevenueCents), icon: TrendingUpIcon, color: "emerald" },
    { label: "Zur Freigabe", value: analysesPendingApprovalCount, icon: FileTextIcon, color: "sky" },
  ];

  const modules: ModuleCard[] = [
    {
      href: "/admin/arbeitgeber",
      title: "Unternehmen",
      description: "Kundenunternehmen, Status und Tarife verwalten.",
      icon: BriefcaseIcon,
      color: "violet",
      badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} wartet auf Freigabe` : undefined,
    },
    {
      title: "Datenimporte",
      description: "Hochgeladene Excel-Dateien prüfen und verarbeiten.",
      icon: UploadIcon,
      color: "slate",
    },
    {
      title: "Analysen & Freigaben",
      description: "Auswertungen prüfen, berechnen und freigeben.",
      icon: ActivityIcon,
      color: "emerald",
    },
    {
      title: "Benutzer & Rollen",
      description: "Zugänge und Berechtigungen verwalten.",
      icon: UsersIcon,
      color: "sky",
    },
    {
      href: "/admin/kontaktanfragen",
      title: "Pilotkunden",
      description: "Anfragen über \"Jetzt Kontakt aufnehmen\" prüfen und Pilotstatus pflegen.",
      icon: InboxIcon,
      color: "amber",
      badge: openContactRequestCount > 0 ? `${openContactRequestCount} offen` : undefined,
    },
    {
      href: "/admin/feedback",
      title: "Support & Feedback",
      description: "Verbesserungswünsche, Fehlermeldungen und Fragen bearbeiten.",
      icon: ChatIcon,
      color: "rose",
      badge: openFeedbackCount > 0 ? `${openFeedbackCount} offen` : undefined,
    },
    {
      title: "Datenprüfung",
      description: "Nicht erkannte Konten, doppelte Uploads und Zuordnungen prüfen.",
      icon: CheckCircleIcon,
      color: "slate",
      wide: true,
    },
  ];

  const actionItems = [
    pendingApprovalCount > 0 && {
      id: "approvals",
      label: `${pendingApprovalCount} ${pendingApprovalCount === 1 ? "Unternehmen wartet" : "Unternehmen warten"} auf Freigabe`,
      href: "/admin/arbeitgeber",
      cta: "Prüfen",
      icon: BriefcaseIcon,
      color: "violet",
    },
    openContactRequestCount > 0 && {
      id: "contact",
      label: `${openContactRequestCount} ${openContactRequestCount === 1 ? "neue Pilotanfrage" : "neue Pilotanfragen"}`,
      href: "/admin/kontaktanfragen",
      cta: "Bearbeiten",
      icon: InboxIcon,
      color: "amber",
    },
    openFeedbackCount > 0 && {
      id: "feedback",
      label: `${openFeedbackCount} ${openFeedbackCount === 1 ? "offener Supportfall" : "offene Supportfälle"}`,
      href: "/admin/feedback",
      cta: "Ansehen",
      icon: ChatIcon,
      color: "rose",
    },
  ].filter(Boolean) as { id: string; label: string; href: string; cta: string; icon: typeof BriefcaseIcon; color: string }[];

  type ActivityItem = {
    id: string;
    label: string;
    detail: string;
    createdAt: Date;
    icon: typeof BriefcaseIcon;
    color: string;
  };
  const activity: ActivityItem[] = [
    ...recentEmployers.map((e) => ({
      id: `employer-${e.id}`,
      label: "Unternehmen registriert",
      detail: e.companyName,
      createdAt: e.createdAt,
      icon: BriefcaseIcon,
      color: "violet",
    })),
    ...recentEmployees.map((e) => ({
      id: `employee-${e.id}`,
      label: "Benutzer eingeladen",
      detail: `${e.name} · ${e.employer.companyName}`,
      createdAt: e.createdAt,
      icon: UsersIcon,
      color: "sky",
    })),
    ...recentContactRequests.map((c) => ({
      id: `contact-${c.id}`,
      label: "Neue Kontaktanfrage",
      detail: c.companyName,
      createdAt: c.createdAt,
      icon: InboxIcon,
      color: "amber",
    })),
    ...recentFeedback.map((f) => ({
      id: `feedback-${f.id}`,
      label: "Feedback eingegangen",
      detail: f.employer?.companyName ?? f.employee?.name ?? "Anonym",
      createdAt: f.createdAt,
      icon: ChatIcon,
      color: "rose",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[28px] font-bold tracking-tight text-sand-900">Admin-Übersicht</h1>
        <p className="text-sm text-sand-500">{today}</p>
      </div>

      {/* Kein overflow-y-auto / keine feste Hoehe mehr auf dieser Ebene:
          die Spalten wachsen mit ihrem Inhalt, die ganze Seite scrollt bei
          Bedarf normal statt einzelner Spalten. */}
      <div className="mt-2.5 grid grid-cols-1 gap-6 xl:grid-cols-[29fr_37fr_32fr] xl:items-stretch">
        {/* Linke Spalte: Kennzahlen */}
        <div className={`${panelClass} flex min-w-0 flex-col gap-4 !p-5`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 dark:from-cockpit-accent dark:to-cockpit-accent-dark font-display text-lg font-bold text-white shadow-md shadow-ink-900/20">
              {avatarInitial}
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-sand-900">
                Guten Tag, {adminDisplayName}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-700">
                  Administrator
                </span>
                <span className="text-xs text-sand-500">{SITE_NAME} Plattform</span>
              </div>
            </div>
          </div>

          <div className="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900 dark:from-cockpit-accent-dark dark:via-[#063a41] dark:to-cockpit-header p-4 text-white shadow-warm-lg">
            <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-cockpit-accent-light/25 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-cockpit-accent/20 blur-3xl" />
            <div className="relative">
              <p className="flex items-center justify-between gap-1.5 text-xs uppercase tracking-wide text-white/60">
                Plattformstatus
                <ActivityIcon className="h-3.5 w-3.5" />
              </p>
              <p className="mt-1.5 font-display text-3xl font-extrabold leading-none">{activeEmployerCount}</p>
              <p className="mt-1.5 text-xs text-white/60">Aktive Pilotunternehmen</p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 grid-rows-4 gap-3">
            {statTiles.map((tile) => (
              <div
                key={tile.label}
                className={`${panelClass} ${panelHoverClass} flex flex-col justify-center !p-4`}
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${ACCENT_CLASSES[tile.color]}`}
                >
                  <tile.icon className="h-4 w-4" />
                </span>
                <p className="mt-2 font-display text-lg font-bold leading-none text-sand-900">
                  {tile.value}
                </p>
                <p className="mt-0.5 text-xs text-sand-500">{tile.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/admin/arbeitgeber"
            className="mt-auto inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-ink-600 to-ink-700 dark:from-cockpit-accent dark:to-cockpit-accent-hover px-5 py-3 text-sm font-semibold text-white shadow-warm hover:shadow-warm-lg hover:brightness-110 transition-all"
          >
            Unternehmen ansehen
          </Link>
        </div>

        {/* Mittlere Spalte: Module */}
        <div className="grid min-w-0 auto-rows-min grid-cols-1 content-start gap-3 sm:grid-cols-2">
          {modules.map((m) => {
            const Icon = m.icon;
            const content = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${ACCENT_CLASSES[m.color]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {m.badge && (
                    <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-gold-700">
                      {m.badge}
                    </span>
                  )}
                </div>
                <div className="mt-2.5">
                  <h3 className="font-display text-base font-semibold tracking-tight text-sand-900">{m.title}</h3>
                  <p className="mt-1 text-sm text-sand-600">{m.description}</p>
                </div>
              </>
            );

            const wideClass = m.wide ? "sm:col-span-2" : "";

            if (!m.href) {
              return (
                <div key={m.title} className={`${panelClass} flex flex-col !p-3.5 ${wideClass}`}>
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={m.title}
                href={m.href}
                className={`${panelClass} ${panelHoverClass} group flex flex-col !p-3.5 ${wideClass}`}
              >
                {content}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-600 dark:text-cockpit-accent-light">
                  Öffnen
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Rechte Spalte: Handlungsbedarf + Letzte Aktivitäten */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className={`${panelClass} !p-5`}>
            <h3 className="font-display text-lg font-semibold tracking-tight text-sand-900">Handlungsbedarf</h3>
            {actionItems.length === 0 ? (
              <p className="mt-4 text-sm text-sand-500">Aktuell besteht kein Handlungsbedarf.</p>
            ) : (
              <ul className="mt-2 divide-y divide-card-border/60 dark:divide-white/5">
                {actionItems.map((item) => (
                  <li
                    key={item.id}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-sand-50 dark:hover:bg-white/[0.03]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[item.color]}`}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      <p className="truncate text-sm text-sand-800">{item.label}</p>
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

          <div className={`${panelClass} flex flex-col gap-1 !p-5`}>
            <h3 className="font-display text-lg font-semibold tracking-tight text-sand-900">Letzte Aktivitäten</h3>
            {activity.length === 0 ? (
              <p className="mt-4 text-sm text-sand-500">Bisher sind keine Aktivitäten vorhanden.</p>
            ) : (
              <ul className="mt-1">
                {activity.map((a) => (
                  <li
                    key={a.id}
                    className="-mx-2 flex items-start gap-3 rounded-xl border-b border-card-border/60 px-2 py-3 text-sm transition-colors last:border-0 hover:bg-sand-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[a.color]}`}
                    >
                      <a.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-medium text-sand-900">{a.label}</p>
                        <span className="shrink-0 text-xs text-sand-400">{relativeTimeDe(a.createdAt)}</span>
                      </div>
                      <p className="truncate text-xs text-sand-500">{a.detail}</p>
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
