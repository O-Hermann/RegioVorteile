import Link from "next/link";
import { AlertTriangleIcon, CheckCircleIcon } from "@/components/icons";
import type { DashAccent } from "@/components/dashboard/dash-ui";

export type AttentionItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: (props: { className?: string }) => React.ReactElement;
  accent: DashAccent;
  priority?: boolean;
  href: string;
  cta: string;
};

// "Handlungsbedarf"-Band, 1:1 aus dem "Goldstandard"-Mockup (siehe
// [[effivo_mvp_roadmap]]): Gold-Icon statt Teal, einzelne Punkte jetzt als
// Karten mit einheitlichem Gold-Hover (kein pro-Item-Akzent/Icon-Bubble mehr
// wie in der vorherigen Teal-Version - das Mockup zeigt pro Punkt nur noch
// Badge (bei Prioritaet) + Titel + CTA, bewusst schlichter). "icon"/"accent"
// bleiben im Datentyp bestehen (page.tsx liefert sie weiterhin), werden hier
// aber nicht mehr visuell genutzt.
export function AttentionList({ items }: { items: AttentionItem[] }) {
  const hasItems = items.length > 0;
  return (
    <div className="flex flex-col items-stretch gap-4 rounded-xl border border-dash-line bg-dash-panel p-4 shadow-[0_1px_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center gap-3.5">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            hasItems ? "bg-gradient-to-br from-dash-gold-deep to-dash-gold text-dash-panel" : "bg-dash-good/15 text-dash-good"
          }`}
        >
          {hasItems ? <AlertTriangleIcon className="h-[18px] w-[18px]" /> : <CheckCircleIcon className="h-[18px] w-[18px]" />}
        </span>
        <div>
          <strong className="block text-[16px] font-semibold text-dash-text">Handlungsbedarf</strong>
          <span className="text-[13px] text-dash-text-muted">
            {hasItems ? `${items.length} ${items.length === 1 ? "Punkt braucht" : "Punkte brauchen"} heute deine Aufmerksamkeit` : "Alles erledigt"}
          </span>
        </div>
      </div>

      {!hasItems ? (
        <p className="text-[13px] text-dash-text-muted">Aktuell besteht kein Handlungsbedarf.</p>
      ) : (
        <div className="flex min-w-0 flex-1 flex-wrap gap-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex min-w-0 flex-1 basis-[260px] items-center gap-3 rounded-xl border border-dash-line bg-dash-panel-soft px-4 py-2.75 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-dash-gold/45 hover:shadow-[0_8px_20px_rgba(226,188,107,0.14)]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {item.priority && (
                    <span className="shrink-0 rounded-md bg-dash-bad/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-dash-bad">
                      Priorität
                    </span>
                  )}
                  <span className="truncate text-[14px] font-semibold text-dash-text">{item.title}</span>
                </div>
                {item.subtitle && <span className="mt-0.5 block truncate text-[12px] text-dash-text-muted">{item.subtitle}</span>}
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-dash-gold">{item.cta} →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
