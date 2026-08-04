import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { cardClass } from "@/lib/ui";
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

const ACCENT_CLASSES: Record<string, string> = {
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  ink: "bg-ink-50 text-ink-700 dark:bg-cockpit-accent-subtle dark:text-cockpit-accent-light",
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
    <div className="flex flex-col min-[1800px]:h-[calc(100vh-7.5rem)]">
      <div className="flex items-baseline justify-between gap-3 shrink-0">
        <h1 className="font-display text-2xl font-semibold text-sand-900">Admin-Übersicht</h1>
        <p className="text-sm text-sand-500">{today}</p>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-5 min-[1800px]:flex-row">
        {/* Linke Spalte: Kennzahlen */}
        <div className={`${cardClass} flex min-h-0 flex-col gap-6 overflow-hidden min-[1800px]:w-[440px] min-[1800px]:shrink-0`}>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink-900 dark:bg-ink-800 font-display text-xl font-bold text-white">
              {avatarInitial}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-sand-900">
                Guten Tag, {adminDisplayName}
              </h2>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-700">
                  Administrator
                </span>
                <span className="text-xs text-sand-500">{SITE_NAME} Plattform</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/10 bg-ink-900 dark:bg-ink-800 p-5 text-white shadow-warm-lg">
            <p className="flex items-center justify-between gap-1.5 text-xs uppercase tracking-wide text-white/60">
              Plattformstatus
              <ActivityIcon className="h-3.5 w-3.5" />
            </p>
            <p className="mt-1.5 font-display text-4xl font-extrabold leading-none">{activeEmployerCount}</p>
            <p className="mt-2 text-xs text-white/60">Aktive Pilotunternehmen</p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3">
            {statTiles.map((tile) => (
              <div key={tile.label} className="rounded-xl border border-card-border bg-card p-4 text-center">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${ACCENT_CLASSES[tile.color]}`}
                >
                  <tile.icon className="h-5 w-5" />
                </span>
                <p className="mt-2.5 font-display text-2xl font-semibold leading-tight text-sand-900">
                  {tile.value}
                </p>
                <p className="text-sm text-sand-500">{tile.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto grid shrink-0 grid-cols-1 gap-3">
            <Link href="/admin/arbeitgeber" className="inline-flex items-center justify-center rounded-full bg-ink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-warm hover:bg-ink-700 hover:shadow-warm-lg transition-all">
              Unternehmen ansehen
            </Link>
          </div>
        </div>

        {/* Mittlere Spalte: Module */}
        <div className="flex min-h-0 flex-col gap-4 min-[1800px]:w-[692px] min-[1800px]:shrink-0">
          <div className="grid min-h-0 flex-1 content-start auto-rows-min gap-4 overflow-y-auto grid-cols-1 sm:grid-cols-2">
            {modules.map((m) => {
              const Icon = m.icon;
              const content = (
                <>
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${ACCENT_CLASSES[m.color]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {m.badge && (
                      <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">
                        {m.badge}
                      </span>
                    )}
                    {!m.href && (
                      <span className="rounded-full bg-sand-100 dark:bg-cockpit-icon-bg px-2 py-0.5 text-xs font-medium text-sand-500 dark:text-cockpit-text-weak">
                        In Vorbereitung
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-sand-900">{m.title}</h3>
                    <p className="mt-1 text-sm text-sand-600">{m.description}</p>
                  </div>
                </>
              );

              if (!m.href) {
                return (
                  <div
                    key={m.title}
                    className={`${cardClass} flex w-full flex-col gap-2.5 !p-5 opacity-70`}
                  >
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={m.title}
                  href={m.href}
                  className={`${cardClass} group flex w-full flex-col gap-2.5 !p-5 hover:border-ink-300 transition-colors`}
                >
                  {content}
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-sand-700 group-hover:text-ink-900">
                    Öffnen
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Rechte Spalte: Handlungsbedarf + Letzte Aktivitäten */}
        <div className="flex min-h-0 flex-col gap-4 min-[1800px]:flex-1">
          <div className={`${cardClass} shrink-0`}>
            <h3 className="font-display text-base font-semibold text-sand-900">Handlungsbedarf</h3>
            {actionItems.length === 0 ? (
              <p className="mt-3 text-sm text-sand-500">Aktuell besteht kein Handlungsbedarf.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {actionItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-card-border px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ACCENT_CLASSES[item.color]}`}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      <p className="truncate text-sm text-sand-800">{item.label}</p>
                    </div>
                    <Link
                      href={item.href}
                      className="shrink-0 rounded-full border border-card-border px-3 py-1.5 text-xs font-semibold text-sand-800 hover:bg-sand-100 transition-colors"
                    >
                      {item.cta}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`${cardClass} flex min-h-0 flex-1 flex-col gap-3 overflow-hidden`}>
            <h3 className="shrink-0 font-display text-base font-semibold text-sand-900">Letzte Aktivitäten</h3>
            <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {activity.length === 0 && (
                <p className="text-sm text-sand-500">Bisher sind keine Aktivitäten vorhanden.</p>
              )}
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 text-sm">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[a.color]}`}
                  >
                    <a.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sand-900">{a.label}</p>
                      <span className="shrink-0 text-xs text-sand-400">{relativeTimeDe(a.createdAt)}</span>
                    </div>
                    <p className="truncate text-xs text-sand-500">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
