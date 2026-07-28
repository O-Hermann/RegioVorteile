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
    pendingApprovalCount,
    recentPartners,
    recentEmployers,
    recentEmployees,
    recentRedemptions,
    recentInquiries,
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
  ]);

  const totalEmployerCount = await prisma.employer.count();
  const monthlyRevenueCents = employers.reduce((sum, e) => sum + e.pricingTier.monthlyPriceCents, 0);
  const openTasksCount = openFeedbackCount + openInquiryCount + pendingApprovalCount;
  const activationRate =
    totalEmployeeCount > 0 ? Math.round((activeEmployeeCount / totalEmployeeCount) * 100) : 0;

  const adminLabel = admin ? admin.email.split("@")[0] : "Admin";
  const adminDisplayName = adminLabel.charAt(0).toUpperCase() + adminLabel.slice(1);
  const avatarInitial = adminDisplayName.charAt(0).toUpperCase();
  const today = now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  type ActivityItem = { id: string; label: string; detail: string; createdAt: Date };
  const activity: ActivityItem[] = [
    ...recentPartners.map((p) => ({
      id: `partner-${p.id}`,
      label: "Neuer Partnerbetrieb hinzugefügt",
      detail: p.name,
      createdAt: p.createdAt,
    })),
    ...recentEmployers.map((e) => ({
      id: `employer-${e.id}`,
      label: "Arbeitgeber registriert",
      detail: e.companyName,
      createdAt: e.createdAt,
    })),
    ...recentEmployees.map((e) => ({
      id: `employee-${e.id}`,
      label: "Mitarbeiter eingeladen",
      detail: `${e.name} · ${e.employer.companyName}`,
      createdAt: e.createdAt,
    })),
    ...recentRedemptions.map((r) => ({
      id: `redemption-${r.id}`,
      label: "Vorteil eingelöst",
      detail: r.partnerBusiness.name,
      createdAt: r.createdAt,
    })),
    ...recentInquiries.map((i) => ({
      id: `inquiry-${i.id}`,
      label: "Neue Partneranfrage",
      detail: i.businessName,
      createdAt: i.createdAt,
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

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-sand-900">Admin-Übersicht</h1>
      <p className="mt-2 text-sand-600">
        Regionen, Partnerbetriebe und Arbeitgeber-Accounts im Blick.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(320px,400px)_1fr]">
        {/* Linke Spalte: Kennzahlen */}
        <div className={`${cardClass} flex flex-col gap-6`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-sand-500">{today}</p>
              <h2 className="mt-1 font-display text-xl font-bold text-sand-900">
                Guten Tag, {adminDisplayName}
              </h2>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-900 dark:bg-ink-800 font-display font-bold text-white">
              {avatarInitial}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900 dark:bg-ink-800 p-5 text-white shadow-warm-lg">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-white/60">
              <UsersIcon className="h-3.5 w-3.5" />
              Mitarbeitende insgesamt
            </p>
            <p className="mt-1 font-display text-4xl font-extrabold">{totalEmployeeCount}</p>
            <p className="mt-1 text-xs text-white/60">
              +{newEmployeeCount} seit letztem Monat · über {totalEmployerCount} Arbeitgeber
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-card-border bg-card p-3">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${ACCENT_CLASSES.violet}`}>
                <BriefcaseIcon className="h-4 w-4" />
              </span>
              <p className="mt-2 font-display text-xl font-semibold text-sand-900">{totalEmployerCount}</p>
              <p className="text-xs text-sand-500">Arbeitgeber</p>
              <p className="text-[11px] text-sand-400">+{newEmployerCount} seit letztem Monat</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-3">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${ACCENT_CLASSES.emerald}`}>
                <StoreIcon className="h-4 w-4" />
              </span>
              <p className="mt-2 font-display text-xl font-semibold text-sand-900">{partnerCount}</p>
              <p className="text-xs text-sand-500">Partnerbetriebe</p>
              <p className="text-[11px] text-sand-400">+{newPartners} seit letztem Monat</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-3">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${ACCENT_CLASSES.amber}`}>
                <TrendingUpIcon className="h-4 w-4" />
              </span>
              <p className="mt-2 font-display text-xl font-semibold text-sand-900">
                {formatPrice(monthlyRevenueCents)}
              </p>
              <p className="text-xs text-sand-500">Umsatz / Monat</p>
              <p className="text-[11px] text-sand-400">{employers.length} aktive Abos</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-3">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${ACCENT_CLASSES.rose}`}>
                <TagIcon className="h-4 w-4" />
              </span>
              <p className="mt-2 font-display text-xl font-semibold text-sand-900">{redemptionCount}</p>
              <p className="text-xs text-sand-500">Einlösungen gesamt</p>
              <p className="text-[11px] text-sand-400">über alle Partnerbetriebe</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-3">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${ACCENT_CLASSES.sky}`}>
                <ActivityIcon className="h-4 w-4" />
              </span>
              <p className="mt-2 font-display text-xl font-semibold text-sand-900">{activationRate}%</p>
              <p className="text-xs text-sand-500">Aktivierungsquote</p>
              <p className="text-[11px] text-sand-400">
                {activeEmployeeCount} von {totalEmployeeCount} Zugängen
              </p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-3">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${ACCENT_CLASSES.slate}`}>
                <BellIcon className="h-4 w-4" />
              </span>
              <p className="mt-2 font-display text-xl font-semibold text-sand-900">{openTasksCount}</p>
              <p className="text-xs text-sand-500">Offene Vorgänge</p>
              <p className="text-[11px] text-sand-400">Feedback, Anfragen & Freigaben</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-sand-900">Letzte Aktivitäten</h3>
            </div>
            <ul className="mt-3 space-y-3">
              {activity.length === 0 && <p className="text-sm text-sand-500">Noch keine Aktivitäten.</p>}
              {activity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="text-sand-900">{a.label}</p>
                    <p className="text-xs text-sand-500">{a.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-sand-400">{relativeTimeDe(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/partnerbetriebe/neu" className={secondaryButtonClass}>
              + Partnerbetrieb
            </Link>
            <Link href="/admin/arbeitgeber" className={primaryButtonClass}>
              Arbeitgeber ansehen
            </Link>
          </div>
        </div>

        {/* Rechte Spalte: Module */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 content-start">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`${cardClass} group flex flex-col gap-3 hover:border-ink-300 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${ACCENT_CLASSES[m.color]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {m.badge && (
                    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-700">
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
    </div>
  );
}
