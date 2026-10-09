import Link from "next/link";
import { getAdminOverview } from "@/lib/admin/data";
import { getDictionary } from "@/lib/i18n/locale";
import { formatNumber } from "@/lib/i18n/format";
import { BracketLabel } from "@/components/ui/bracket-label";

// docs/DESIGN.md {component.spec-cell}: value in display-sm over an
// uppercase label, on surface-soft, 4-up → 2-up → 1-up.
export default async function AdminOverviewPage() {
  const [stats, { locale, t }] = await Promise.all([getAdminOverview(), getDictionary()]);
  const o = t.admin.overview;
  const linkedPercent = stats.users ? Math.round((stats.linked / stats.users) * 100) : 0;

  const cells: { label: string; value: number; note?: string; href?: string; alert?: boolean }[] = [
    { label: o.users, value: stats.users },
    { label: o.linked, value: stats.linked, note: o.ofUsers.replace("{percent}", formatNumber(locale, linkedPercent)) },
    { label: o.vehicles, value: stats.vehicles },
    { label: o.presets, value: stats.presets, href: "/admin/presets" },
    { label: o.dueItems, value: stats.dueItems, alert: stats.dueItems > 0 },
    { label: o.sentThisWeek, value: stats.sentThisWeek },
    { label: o.failedThisWeek, value: stats.failedThisWeek, alert: stats.failedThisWeek > 0 },
    { label: o.followUps, value: stats.followUps, href: "/admin/follow-ups", alert: stats.followUps > 0 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <BracketLabel>{o.eyebrow}</BracketLabel>
        <h1
          className={`text-[40px] font-bold leading-[0.95] text-on-dark break-words ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
        >
          {o.title}
        </h1>
      </div>

      <dl className="grid grid-cols-1 gap-px border border-hairline bg-hairline/60 sm:grid-cols-2 lg:grid-cols-4">
        {cells.map((cell) => {
          const body = (
            <>
              <dt className="order-2 font-mono text-xs text-muted ltr:uppercase ltr:tracking-[0.08em]">{cell.label}</dt>
              <dd className={`order-1 font-mono text-[32px] font-bold leading-none ${cell.alert ? "text-m-red" : "text-on-dark"}`}>
                {formatNumber(locale, cell.value)}
              </dd>
              {cell.note && <dd className="order-3 text-xs text-body">{cell.note}</dd>}
            </>
          );
          return cell.href ? (
            <Link
              key={cell.label}
              href={cell.href}
              className="flex flex-col gap-2 bg-surface-soft p-6 transition-colors hover:bg-surface-elevated"
            >
              {body}
            </Link>
          ) : (
            <div key={cell.label} className="flex flex-col gap-2 bg-surface-soft p-6">
              {body}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
