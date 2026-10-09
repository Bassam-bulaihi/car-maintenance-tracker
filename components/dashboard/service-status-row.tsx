import { CheckCircle2, Wrench } from "lucide-react";
import { confirmServiceDone } from "@/lib/dashboard/actions";
import { computeNextDue, computeServiceStatus, type ServiceItem } from "@/lib/dashboard/service-status";
import { serviceTypeLabel, type ServiceType } from "@/lib/admin/service-types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/i18n/format";

// One tracked service: what it is and its interval, how far through that
// interval the car is (distance and/or date, whichever applies), and a
// button to log it — prominent when due, available early too (an oil change
// done ahead of schedule still resets the baseline).
export function ServiceStatusRow({
  vehicleId,
  currentOdometer,
  item,
  locale,
  t,
}: {
  vehicleId: string;
  currentOdometer: number;
  item: ServiceItem & { id: string; service_type: string };
  locale: Locale;
  t: Dictionary;
}) {
  const d = t.dashboard;
  const isDue = computeServiceStatus(item, currentOdometer) === "due";
  const next = computeNextDue(item, currentOdometer);
  const nf = { format: (n: number) => formatNumber(locale, n) };
  const df = { format: (date: Date) => formatDate(locale, date) };
  const today = new Date();

  const interval = [
    item.interval_km !== null ? d.everyKm.replace("{km}", nf.format(item.interval_km)) : null,
    item.interval_months !== null ? d.everyMonths.replace("{months}", nf.format(item.interval_months)) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const remaining = [
    next.kmRemaining !== null
      ? next.kmRemaining >= 0
        ? d.kmLeft.replace("{km}", nf.format(next.kmRemaining))
        : d.kmOverdue.replace("{km}", nf.format(-next.kmRemaining))
      : null,
    next.dueDate !== null
      ? (next.dueDate > today ? d.dueBy : d.dueSince).replace("{date}", df.format(next.dueDate))
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const lastDone =
    item.last_service_date !== null && item.last_service_odometer !== null
      ? d.lastDone
          .replace("{date}", df.format(new Date(item.last_service_date)))
          .replace("{km}", nf.format(item.last_service_odometer))
      : null;

  const barColor = isDue ? "bg-m-red" : next.progress >= 0.8 ? "bg-warning" : "bg-success";

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-hairline py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="break-words font-bold text-on-dark">{serviceTypeLabel(item.service_type, locale)}</span>
          <span className={`font-mono text-xs ltr:uppercase ltr:tracking-[0.05em] ${isDue ? "text-m-red" : "text-success"}`}>
            [ {isDue ? d.statusDue : d.statusOk} ]
          </span>
          {interval && <span className="font-mono text-xs text-muted">{interval}</span>}
        </div>
        <div
          className="h-1 w-full max-w-md bg-hairline"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(next.progress * 100)}
          aria-label={serviceTypeLabel(item.service_type, locale)}
        >
          <div className={`h-full ${barColor} transition-[width] duration-500`} style={{ width: `${Math.max(2, next.progress * 100)}%` }} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {remaining && <span className={isDue ? "text-m-red" : "text-body"}>{remaining}</span>}
          {lastDone && <span className="text-muted">{lastDone}</span>}
        </div>
      </div>
      <form
        action={confirmServiceDone.bind(null, vehicleId, item.id, item.service_type as ServiceType)}
        className="sm:justify-self-end"
      >
        <Button
          type="submit"
          variant={isDue ? "primary" : "outline"}
          size="sm"
          locale={locale}
          icon={isDue ? <CheckCircle2 className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
        >
          {isDue ? d.confirmDone : d.logService}
        </Button>
      </form>
    </div>
  );
}
