import { prisma } from "@/lib/prisma";
import { LEGAL_DEFAULTS } from "@/lib/legal";
import { LegalPageView } from "@/components/legal-page-view";

export default async function ImpressumPage() {
  const page = await prisma.legalPage.findUnique({ where: { slug: "IMPRESSUM" } });

  return (
    <LegalPageView
      title={page?.title ?? LEGAL_DEFAULTS.IMPRESSUM.title}
      content={page?.content ?? null}
    />
  );
}
