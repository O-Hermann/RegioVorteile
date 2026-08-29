import { relativeTimeDe } from "@/lib/time";
import { type DashAccent, dashCardClass, dashModuleHoverClass } from "@/components/dashboard/dash-ui";

export type ActivityTimelineItem = {
  id: string;
  category: string;
  title: string;
  detail: string;
  createdAt: Date;
  icon: (props: { className?: string }) => React.ReactElement;
  accent: DashAccent;
};

// "Letzte Aktivitäten"-Karte, 1:1 aus dem "Goldstandard"-Mockup (siehe
// [[effivo_mvp_roadmap]]): Zebra-Streifen statt Connector-Linie, Icons in
// schlichten runden Boxen statt farbiger Ringe - deutlich ruhiger als die
// vormalige Teal-Version. Zeigt ausschliesslich echte Aktivitaeten aus
// ArbeitgeberDashboardPage (Einladungen/Aktivierungen/Importe).
export function ActivityTimeline({ items }: { items: ActivityTimelineItem[] }) {
  return (
    <div className={`flex flex-col gap-1 p-6 ${dashCardClass} ${dashModuleHoverClass}`}>
      <h3 className="text-[20px] font-semibold leading-[28px] text-dash-text">Letzte Aktivitäten</h3>
      <p className="text-[13px] text-dash-text-muted">Chronologisches Protokoll deiner Aktivitäten.</p>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-6">
          <p className="text-sm text-dash-text-muted">Bisher sind keine Aktivitäten vorhanden.</p>
        </div>
      ) : (
        <div className="mt-2 flex flex-col">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-lg px-2 py-2.75 ${i % 2 === 0 ? "bg-dash-panel-soft" : ""}`}
            >
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-dash-line bg-dash-panel text-dash-text-muted">
                <item.icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 leading-none">
                  <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-dash-text-faint">{item.category}</span>
                  <time className="shrink-0 text-[11px] tabular-nums text-dash-text-faint">{relativeTimeDe(item.createdAt)}</time>
                </div>
                <p className="mt-0.5 truncate text-[14px] font-semibold leading-tight text-dash-text">{item.title}</p>
                <p className="mt-0.5 truncate text-[12px] leading-none text-dash-text-muted">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-dash-line pt-3 text-[13px]">
        <span className="text-dash-text-muted">Vollständiges Aktivitätsprotokoll</span>
        <span className="font-semibold text-dash-gold">Bald verfügbar</span>
      </div>
    </div>
  );
}
