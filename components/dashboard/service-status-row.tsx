import { CheckCircle2 } from "lucide-react";
import { confirmServiceDone } from "@/lib/dashboard/actions";
import { computeServiceStatus, type ServiceItem } from "@/lib/dashboard/service-status";
import { serviceTypeLabel, type ServiceType } from "@/lib/admin/service-types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

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
  const status = computeServiceStatus(item, currentOdometer);
  const isDue = status === "due";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-hairline py-4 last:border-b-0">
      <span className="text-on-dark break-words">
        {serviceTypeLabel(item.service_type, locale)}
      </span>
      <span
        className={`font-mono text-xs uppercase tracking-[0.05em] ${isDue ? "text-m-red" : "text-success"}`}
      >
        [ {isDue ? t.dashboard.statusDue : t.dashboard.statusOk} ]
      </span>
      {isDue ? (
        <form action={confirmServiceDone.bind(null, vehicleId, item.id, item.service_type as ServiceType)}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            locale={locale}
            icon={<CheckCircle2 className="h-4 w-4" />}
          >
            {t.dashboard.confirmDone}
          </Button>
        </form>
      ) : (
        <span />
      )}
    </div>
  );
}
