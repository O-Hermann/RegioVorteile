import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { cardClass } from "@/lib/ui";

export function LegalPageView({
  title,
  content,
}: {
  title: string;
  content: string | null;
}) {
  return (
    <>
      <LandingHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-16 w-full">
        <h1 className="font-display text-3xl font-semibold text-sand-900">{title}</h1>
        <div className={`${cardClass} mt-6`}>
          {content ? (
            <div className="whitespace-pre-line text-sm leading-relaxed text-sand-800">
              {content}
            </div>
          ) : (
            <p className="text-sm text-sand-500">Inhalt noch nicht hinterlegt.</p>
          )}
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
