import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { primaryButtonClass, secondaryButtonClass, cardClass } from "@/lib/ui";
import { relativeTimeDe } from "@/lib/time";
import {
  ArrowRightIcon,
  MapPinIcon,
  StoreIcon,
  BriefcaseIcon,
  InboxIcon,
  ChatIcon,
  FileTextIcon,
  UsersIcon,
  TrendingUpIcon,
  ActivityIcon,
  TagIcon,
  BellIcon,
} from "@/components/icons";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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
};

const BANNER_WRAP_CLASSES: Record<string, string> = {
  emerald: "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40",
  rose: "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40",
  violet: "border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40",
};

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const now = new Date();
  const monthAgo = new Date(now.getTime() - THIRTY_DAYS_MS);

  const [
    admin,
    regionCount,
    partnerCount,
    newPartners,
    employers,
    newEmployerCount,
    totalEmployeeCount,
    activeEmployeeCount,
    newEmployeeCount,
    redemptionCount,
    openFeedbackCount,
    openInquiryCount,
    openContactRequestCount,
    pendingApprovalCount,
    recentPartners,
    recentEmployers,
    recentEmployees,
    recentRedemptions,
    recentInquiries,
    recentContactRequests,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.region.count(),
    prisma.partnerBusiness.count(),
    prisma.partnerBusiness.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.employer.findMany({ where: { subscriptionStatus: "aktiv" }, include: { pricingTier: true } }),
    prisma.employer.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.employee.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.redemption.count(),
    prisma.feedback.count({ where: { status: "OPEN" } }),
    prisma.partnerInquiry.count({ where: { status: "OPEN" } }),
    prisma.contactRequest.count({ where: { status: "OPEN" } }),
    prisma.employer.count({ where: { approved: false } }),
    prisma.partnerBusiness.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.employer.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { employer: true },
    }),
    prisma.redemption.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { partnerBusiness: true, employee: true },
    }),
    prisma.partnerInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const totalEmployerCount = await prisma.employer.count();
  const monthlyRevenueCents = employers.reduce((sum, e) => sum + e.pricingTier.monthlyPriceCents, 0);
  const openTasksCount =
    openFeedbackCount + openInquiryCount + openContactRequestCount + pendingApprovalCount;
  const activationRate =
    totalEmployeeCount > 0 ? Math.round((activeEmployeeCount / totalEmployeeCount) * 100) : 0;

  const adminLabel = admin ? admin.email.split("@")[0] : "Admin";
  const adminDisplayName = adminLabel.charAt(0).toUpperCase() + adminLabel.slice(1);
  const avatarInitial = adminDisplayName.charAt(0).toUpperCase();
  const today = now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  type ActivityItem = {
    id: string;
    label: string;
    detail: string;
    createdAt: Date;
    icon: typeof StoreIcon;
    color: string;
  };
  const activity: ActivityItem[] = [
    ...recentPartners.map((p) => ({
      id: `partner-${p.id}`,
      label: "Neuer Partnerbetrieb hinzugefügt",
      detail: p.name,
      createdAt: p.createdAt,
      icon: StoreIcon,
      color: "emerald",
    })),
    ...recentEmployers.map((e) => ({
      id: `employer-${e.id}`,
      label: "Arbeitgeber registriert",
      detail: e.companyName,
      createdAt: e.createdAt,
      icon: BriefcaseIcon,
      color: "violet",
    })),
    ...recentEmployees.map((e) => ({
      id: `employee-${e.id}`,
      label: "Mitarbeiter eingeladen",
      detail: `${e.name} · ${e.employer.companyName}`,
      createdAt: e.createdAt,
      icon: UsersIcon,
      color: "sky",
    })),
    ...recentRedemptions.map((r) => ({
      id: `redemption-${r.id}`,
      label: "Vorteil eingelöst",
      detail: r.partnerBusiness.name,
      createdAt: r.createdAt,
      icon: TagIcon,
      color: "rose",
    })),
    ...recentInquiries.map((i) => ({
      id: `inquiry-${i.id}`,
      label: "Neue Partneranfrage",
      detail: i.businessName,
      createdAt: i.createdAt,
      icon: InboxIcon,
      color: "amber",
    })),
    ...recentContactRequests.map((c) => ({
      id: `contact-${c.id}`,
      label: "Neue Kontaktanfrage",
      detail: c.companyName,
      createdAt: c.createdAt,
      icon: ChatIcon,
      color: "sky",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const modules = [
    {
      href: "/admin/regionen",
      title: "Regionen",
      description: `${regionCount} ${regionCount === 1 ? "Region" : "Regionen"} - Namen und PLZ-Gebiete pflegen.`,
      icon: MapPinIcon,
      color: "sky",
    },
    {
      href: "/admin/partnerbetriebe",
      title: "Partnerbetriebe",
      description: "Partner anlegen, verwalten und Kooperationen pflegen.",
      icon: StoreIcon,
      color: "emerald",
    },
    {
      href: "/admin/arbeitgeber",
      title: "Arbeitgeber",
      description: "Firmen-Accounts, Abo-Stufen und Freigaben verwalten.",
      icon: BriefcaseIcon,
      color: "violet",
      badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} wartet auf Freigabe` : undefined,
    },
    {
      href: "/admin/partneranfragen",
      title: "Partneranfragen",
      description: "Anfragen von Betrieben prüfen und beantworten.",
      icon: InboxIcon,
      color: "amber",
      badge: openInquiryCount > 0 ? `${openInquiryCount} offen` : undefined,
    },
    {
      href: "/admin/kontaktanfragen",
      title: "Kontaktanfragen",
      description: "Anfragen über \"Jetzt Kontakt aufnehmen\" prüfen und bearbeiten.",
      icon: ChatIcon,
      color: "sky",
      badge: openContactRequestCount > 0 ? `${openContactRequestCount} offen` : undefined,
    },
    {
      href: "/admin/feedback",
      title: "Feedback",
      description: "Verbesserungswünsche und Fehlermeldungen bearbeiten.",
      icon: ChatIcon,
      color: "rose",
      badge: openFeedbackCount > 0 ? `${openFeedbackCount} offen` : undefined,
    },
    {
      href: "/admin/rechtliches",
      title: "Rechtliches",
      description: "Impressum und Datenschutz bearbeiten.",
      icon: FileTextIcon,
      color: "slate",
    },
  ];

  const banner = [
    {
      count: openInquiryCount,
      title: openInquiryCount === 1 ? "Neue Partneranfrage" : "Neue Partneranfragen",
      subtitle: `${openInquiryCount} offene ${openInquiryCount === 1 ? "Anfrage wartet" : "Anfragen warten"} auf Prüfung.`,
      href: "/admin/partneranfragen",
      icon: InboxIcon,
      color: "emerald",
    },
    {
      count: openFeedbackCount,
      title: openFeedbackCount === 1 ? "Neues Feedback" : "Neues Feedback",
      subtitle: `${openFeedbackCount} offene ${openFeedbackCount === 1 ? "Meldung wartet" : "Meldungen warten"} auf Bearbeitung.`,
      href: "/admin/feedback",
      icon: ChatIcon,
      color: "rose",
    },
    {
      count: pendingApprovalCount,
      title: pendingApprovalCount === 1 ? "Arbeitgeber wartet auf Freigabe" : "Arbeitgeber warten auf Freigabe",
      subtitle: `${pendingApprovalCount} neue ${pendingApprovalCount === 1 ? "Registrierung" : "Registrierungen"} zu prüfen.`,
      href: "/admin/arbeitgeber",
      icon: BriefcaseIcon,
      color: "violet",
    },
  ].find((b) => b.count > 0);

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
                <span className="text-xs text-sand-500">Regiovorteile Plattform</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/10 bg-ink-900 dark:bg-ink-800 p-5 text-center text-white shadow-warm-lg">
            <p className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wide text-white/60">
              <UsersIcon className="h-3.5 w-3.5" />
              Mitarbeitende insgesamt
            </p>
            <p className="mt-1.5 font-display text-4xl font-extrabold leading-none">{totalEmployeeCount}</p>
            <p className="mt-2 text-xs text-white/60">
              +{newEmployeeCount} seit letztem Monat · über {totalEmployerCount} Arbeitgeber
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-card-border bg-card p-4 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${ACCENT_CLASSES.violet}`}>
                <BriefcaseIcon className="h-5 w-5" />
              </span>
              <p className="mt-2.5 font-display text-2xl font-semibold leading-tight text-sand-900">{totalEmployerCount}</p>
              <p className="text-sm text-sand-500">Arbeitgeber</p>
              <p className="text-xs text-sand-400">+{newEmployerCount} seit letztem Monat</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${ACCENT_CLASSES.emerald}`}>
                <StoreIcon className="h-5 w-5" />
              </span>
              <p className="mt-2.5 font-display text-2xl font-semibold leading-tight text-sand-900">{partnerCount}</p>
              <p className="text-sm text-sand-500">Partnerbetriebe</p>
              <p className="text-xs text-sand-400">+{newPartners} seit letztem Monat</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${ACCENT_CLASSES.sky}`}>
                <MapPinIcon className="h-5 w-5" />
              </span>
              <p className="mt-2.5 font-display text-2xl font-semibold leading-tight text-sand-900">{regionCount}</p>
              <p className="text-sm text-sand-500">{regionCount === 1 ? "Region" : "Regionen"}</p>
              <p className="text-xs text-sand-400">aktiv</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${ACCENT_CLASSES.amber}`}>
                <TrendingUpIcon className="h-5 w-5" />
              </span>
              <p className="mt-2.5 font-display text-2xl font-semibold leading-tight text-sand-900">
                {formatPrice(monthlyRevenueCents)}
              </p>
              <p className="text-sm text-sand-500">Umsatz / Monat</p>
              <p className="text-xs text-sand-400">{employers.length} aktive Abos</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${ACCENT_CLASSES.rose}`}>
                <TagIcon className="h-5 w-5" />
              </span>
              <p className="mt-2.5 font-display text-2xl font-semibold leading-tight text-sand-900">{redemptionCount}</p>
              <p className="text-sm text-sand-500">Einlösungen</p>
              <p className="text-xs text-sand-400">seit letztem Monat</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${ACCENT_CLASSES.sky}`}>
                <ActivityIcon className="h-5 w-5" />
              </span>
              <p className="mt-2.5 font-display text-2xl font-semibold leading-tight text-sand-900">{activationRate}%</p>
              <p className="text-sm text-sand-500">Aktivierung</p>
              <p className="text-xs text-sand-400">
                {activeEmployeeCount} von {totalEmployeeCount}
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 text-center">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${ACCENT_CLASSES.slate}`}>
                <BellIcon className="h-5 w-5" />
              </span>
              <p className="mt-2.5 font-display text-2xl font-semibold leading-tight text-sand-900">{openTasksCount}</p>
              <p className="text-sm text-sand-500">Offene Vorgänge</p>
              <p className="text-xs text-sand-400">{openTasksCount === 0 ? "sehr gut!" : "zu prüfen"}</p>
            </div>
          </div>

          <div className="mt-auto grid shrink-0 grid-cols-2 gap-3">
            <Link href="/admin/partnerbetriebe/neu" className={secondaryButtonClass}>
              + Partnerbetrieb
            </Link>
            <Link href="/admin/arbeitgeber" className={primaryButtonClass}>
              Arbeitgeber ansehen
            </Link>
          </div>
        </div>

        {/* Mittlere Spalte: Hinweis-Banner + Module */}
        <div className="flex min-h-0 flex-col gap-4 min-[1800px]:w-[692px] min-[1800px]:shrink-0">
          {banner && (
            <Link
              href={banner.href}
              className={`shrink-0 flex items-center justify-between gap-4 rounded-2xl border p-4 transition-colors ${BANNER_WRAP_CLASSES[banner.color]}`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ACCENT_CLASSES[banner.color]}`}
                >
                  <banner.icon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-sand-900">{banner.title}</h3>
                  <p className="truncate text-sm text-sand-600">{banner.subtitle}</p>
                </div>
              </div>
              <div className="shrink-0 rounded-xl border border-card-border bg-card px-4 py-2 text-center">
                <p className="font-display text-2xl font-bold leading-none text-sand-900">{banner.count}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-sand-500">Offen</p>
              </div>
            </Link>
          )}

          <div className="grid min-h-0 flex-1 content-start auto-rows-min gap-4 overflow-y-auto grid-cols-[repeat(auto-fill,minmax(150px,260px))]">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`${cardClass} group flex w-full max-w-[260px] flex-col gap-2.5 !p-5 hover:border-ink-300 transition-colors`}
                >
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
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-sand-900">{m.title}</h3>
                    <p className="mt-1 text-sm text-sand-600">{m.description}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-sand-700 group-hover:text-ink-900">
                    Öffnen
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Rechte Spalte: Letzte Aktivitäten */}
        <div className={`${cardClass} flex min-h-0 flex-col gap-3 overflow-hidden min-[1800px]:w-[440px] min-[1800px]:shrink-0`}>
          <h3 className="shrink-0 font-display text-base font-semibold text-sand-900">Letzte Aktivitäten</h3>
          <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {activity.length === 0 && <p className="text-sm text-sand-500">Noch keine Aktivitäten.</p>}
            {activity.map((a) => {
              const AIcon = a.icon;
              return (
                <li key={a.id} className="flex items-start gap-2.5 text-sm">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${ACCENT_CLASSES[a.color]}`}
                  >
                    <AIcon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sand-900">{a.label}</p>
                      <span className="shrink-0 text-xs text-sand-400">{relativeTimeDe(a.createdAt)}</span>
                    </div>
                    <p className="truncate text-xs text-sand-500">{a.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
