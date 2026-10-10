import Link from "next/link";
import type { ReactNode } from "react";
import { getAdminDashboard } from "@/lib/admin/dashboard";
import { getDictionary } from "@/lib/i18n/locale";
import { formatNumber } from "@/lib/i18n/format";
import { serviceTypeLabel } from "@/lib/admin/service-types";
import { BracketLabel } from "@/components/ui/bracket-label";
import { ACCENT, AreaChart, BarList, ChartCard, ColumnChart, CONTEXT, Meter } from "@/components/admin/charts";

// Admin dashboard: a KPI row (stat tiles, one meter) over trend charts and
// two ranked breakdowns. Grid collapses 3 → 2 → 1 columns.
export default async function AdminDashboardPage() {
  const [data, { locale, t }] = await Promise.all([getAdminDashboard(), getDictionary()]);
  const o = t.admin.overview;
  const n = (v: number) => formatNumber(locale, v);
  const k = data.kpis;
  const sent7 = k.delivered7 + k.failed7;
  const deliveryPct = sent7 ? Math.round((k.delivered7 / sent7) * 100) : null;
  const linkPct = k.users ? Math.round((k.linked / k.users) * 100) : 0;
  const pct = (v: number) => `${n(v)}${locale === "ar" ? "٪" : "%"}`;

  const readingSeries = [
    { name: o.readingsTelegram, color: ACCENT },
    { name: o.readingsWeb, color: CONTEXT },
  ];
  const dueRows = data.dueByType.map(([type, count]) => ({ label: serviceTypeLabel(type, locale), value: count }));
  const makeRows = data.vehiclesByMake.map(([make, count]) => ({ label: make === "__other__" ? o.other : make, value: count }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <BracketLabel>{o.eyebrow}</BracketLabel>
        <h1
          className={`text-[32px] font-bold leading-[0.95] text-on-dark sm:text-[40px] ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
        >
          {o.title}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-px border border-hairline bg-hairline/60 lg:grid-cols-3">
        <StatTile label={o.users} value={n(k.users)} note={o.thisWeek.replace("{n}", n(k.newUsers7))} />
        <StatTile
          label={o.linkRate}
          value={pct(linkPct)}
          note={o.linkRateNote.replace("{linked}", n(k.linked)).replace("{users}", n(k.users))}
        >
          <Meter value={k.linked} max={k.users} label={o.linkRate} />
        </StatTile>
        <StatTile label={o.vehicles} value={n(k.vehicles)} note={o.thisWeek.replace("{n}", n(k.newVehicles7))} />
        <StatTile label={o.dueNow} value={n(k.dueNow)} note={o.dueNowNote} />
        <StatTile
          label={o.openMessages}
          value={n(k.openMessages)}
          note={o.openMessagesNote}
          href="/admin/messages"
          status={k.openMessages > 0 ? "warning" : undefined}
        />
        <StatTile
          label={o.delivery}
          value={deliveryPct === null ? "—" : pct(deliveryPct)}
          note={deliveryPct === null ? o.deliveryNone : o.deliveryNote.replace("{failed}", n(k.failed7))}
          status={k.failed7 > 0 ? "critical" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title={o.signupsTitle}
          subtitle={o.signupsSub}
          tableLabel={o.viewTable}
          table={{ head: [o.day, o.signupsSeries], rows: data.signups.map((p) => [p.day, n(p.values[0])]) }}
        >
          <AreaChart points={data.signups} series={{ name: o.signupsSeries, color: ACCENT }} locale={locale} ariaLabel={o.signupsTitle} />
        </ChartCard>

        <ChartCard
          title={o.readingsTitle}
          subtitle={o.readingsSub}
          legend={readingSeries}
          tableLabel={o.viewTable}
          table={{
            head: [o.day, o.readingsTelegram, o.readingsWeb],
            rows: data.readings.map((p) => [p.day, n(p.values[0]), n(p.values[1])]),
          }}
        >
          <ColumnChart points={data.readings} series={readingSeries} locale={locale} ariaLabel={o.readingsTitle} />
        </ChartCard>

        <ChartCard
          title={o.messagesTitle}
          subtitle={o.messagesSub}
          tableLabel={o.viewTable}
          table={{ head: [o.day, o.messagesSeries], rows: data.messages.map((p) => [p.day, n(p.values[0])]) }}
        >
          <ColumnChart
            points={data.messages}
            series={[{ name: o.messagesSeries, color: ACCENT }]}
            locale={locale}
            ariaLabel={o.messagesTitle}
          />
        </ChartCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ChartCard
            title={o.dueTitle}
            tableLabel={o.viewTable}
            table={{ head: [o.category, o.count], rows: dueRows.map((r) => [r.label, n(r.value)]) }}
          >
            <BarList rows={dueRows} locale={locale} emptyLabel={o.empty} />
          </ChartCard>
          <ChartCard
            title={o.makesTitle}
            tableLabel={o.viewTable}
            table={{ head: [o.category, o.count], rows: makeRows.map((r) => [r.label, n(r.value)]) }}
          >
            <BarList rows={makeRows} locale={locale} emptyLabel={o.empty} />
          </ChartCard>
        </div>
      </div>

      <p className="font-mono text-xs text-muted">
        {o.presets}: {n(k.presets)}
      </p>
    </div>
  );
}

// Stat tile: label, value, a short note; status tiles carry a labelled dot
// (never colour alone) in the reserved warning/critical tokens.
function StatTile({
  label,
  value,
  note,
  href,
  status,
  children,
}: {
  label: string;
  value: string;
  note?: string;
  href?: string;
  status?: "warning" | "critical";
  children?: ReactNode;
}) {
  const body = (
    <>
      <span className="flex items-center gap-2 font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.08em]">
        {status && (
          <span
            className={`inline-block h-2 w-2 rounded-full ${status === "critical" ? "bg-m-red" : "bg-warning"}`}
            aria-hidden="true"
          />
        )}
        {label}
      </span>
      <span className="text-[28px] font-bold leading-none text-on-dark sm:text-[32px]">{value}</span>
      {children}
      {note && <span className="text-xs text-body">{note}</span>}
    </>
  );
  const className = "flex min-w-0 flex-col gap-2 bg-surface-soft p-4 sm:p-5";
  return href ? (
    <Link href={href} className={`${className} transition-colors hover:bg-surface-elevated`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
