import { FileTextIcon } from "@/components/icons";

export function DisclaimerSection() {
  return (
    <section className="border-y border-petrol-100 dark:border-cockpit-border bg-white dark:bg-cockpit-section py-8">
      <div className="mx-auto flex max-w-3xl items-start gap-3 px-4 text-center sm:px-6">
        <FileTextIcon className="mx-auto mt-0.5 hidden h-4 w-4 shrink-0 text-slate-400 dark:text-cockpit-text-weak sm:block" />
        <p className="mx-auto text-sm text-slate-500 dark:text-cockpit-text-weak">
          UnternehmensCockpit stellt vorhandene Unternehmensdaten verständlich dar. Die
          Anwendung ersetzt keine Steuer-, Finanz- oder Unternehmensberatung.
        </p>
      </div>
    </section>
  );
}
