import { FileTextIcon } from "@/components/icons";
import { SITE_NAME } from "@/lib/site-config";

export function DisclaimerSection() {
  return (
    <section className="border-y border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-section py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex items-start justify-center gap-3 rounded-2xl border border-petrol-100 dark:border-white/10 bg-petrol-50 dark:bg-cockpit-card px-5 py-4 text-center sm:text-left">
          <FileTextIcon className="mt-0.5 hidden h-5 w-5 shrink-0 text-petrol-600 dark:text-cockpit-accent-light sm:block" />
          <p className="text-[15px] leading-relaxed text-slate-600 dark:text-cockpit-text-secondary">
            {SITE_NAME} stellt vorhandene Unternehmensdaten verständlich dar. Die
            Anwendung ersetzt keine Steuer-, Finanz- oder Unternehmensberatung.
          </p>
        </div>
      </div>
    </section>
  );
}
