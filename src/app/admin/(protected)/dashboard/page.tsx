import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/ui";

export default async function AdminDashboardPage() {
  const [
    regionCount,
    partnerCount,
    employerCount,
    redemptionCount,
    openFeedbackCount,
    openInquiryCount,
  ] = await Promise.all([
    prisma.region.count(),
    prisma.partnerBusiness.count(),
    prisma.employer.count(),
    prisma.redemption.count(),
    prisma.feedback.count({ where: { status: "OPEN" } }),
    prisma.partnerInquiry.count({ where: { status: "OPEN" } }),
  ]);

  const stats = [
    { label: "Regionen", value: regionCount, href: "/admin/regionen" },
    { label: "Partnerbetriebe", value: partnerCount, href: "/admin/partnerbetriebe" },
    { label: "Arbeitgeber", value: employerCount, href: "/admin/arbeitgeber" },
    { label: "Eingelöste Rabatte", value: redemptionCount, href: "/admin/arbeitgeber" },
    { label: "Offene Partneranfragen", value: openInquiryCount, href: "/admin/partneranfragen" },
    { label: "Offenes Feedback", value: openFeedbackCount, href: "/admin/feedback" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-sand-900">Admin-Übersicht</h1>
      <p className="mt-2 text-sand-600">
        Regionen, Partnerbetriebe und Arbeitgeber-Accounts im Blick.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`${cardClass} hover:border-ink-300 transition-colors`}
          >
            <p className="text-sm text-sand-500">{stat.label}</p>
            <p
              className={`mt-1 font-display text-3xl font-semibold ${
                (stat.label === "Offenes Feedback" || stat.label === "Offene Partneranfragen") &&
                stat.value > 0
                  ? "text-gold-700 dark:text-gold-300"
                  : "text-sand-900"
              }`}
            >
              {stat.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
