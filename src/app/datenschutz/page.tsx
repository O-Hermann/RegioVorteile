import { prisma } from "@/lib/prisma";
import { LEGAL_DEFAULTS } from "@/lib/legal";
import { LegalPageView } from "@/components/legal-page-view";

export default async function DatenschutzPage() {
  const page = await prisma.legalPage.findUnique({ where: { slug: "DATENSCHUTZ" } });

  return (
    <LegalPageView
      title={page?.title ?? LEGAL_DEFAULTS.DATENSCHUTZ.title}
      content={page?.content ?? null}
    />
  );
}
