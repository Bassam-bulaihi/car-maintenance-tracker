import Link from "next/link";
import { Car, ChevronRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { computeServiceStatus } from "@/lib/dashboard/service-status";

type VehicleCardData = {
  id: string;
  make: string;
  model: string;
  year: number;
  plate_no: string | null;
  current_odometer: number;
  vehicle_service_items: {
    interval_km: number | null;
    interval_months: number | null;
    last_service_odometer: number | null;
    last_service_date: string | null;
  }[];
};

// Adapted from the LUXEDRIVE Figma home page's rental-car card (photo /
// name+year / meta row / action button) — photo slot becomes an icon
// placeholder until vehicle photos exist (deferred feature), meta row
// becomes odometer + due-count instead of price + specs.
export function VehicleCard({
  vehicle,
  locale,
  t,
}: {
  vehicle: VehicleCardData;
  locale: Locale;
  t: Dictionary;
}) {
  const dueCount = vehicle.vehicle_service_items.filter(
    (item) => computeServiceStatus(item, vehicle.current_odometer) === "due",
  ).length;

  return (
    <Link
      href={`/dashboard/vehicles/${vehicle.id}`}
      className="flex flex-col border border-hairline bg-surface-card/70 backdrop-blur-sm hover:bg-surface-elevated/80"
    >
      <div className="flex h-32 items-center justify-center border-b border-hairline bg-surface-soft/50 backdrop-blur-sm">
        <Car className="h-10 w-10 text-muted" aria-hidden="true" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span
              className={`text-lg font-bold text-on-dark ${locale === "en" ? "uppercase tracking-[-0.01em]" : ""}`}
            >
              {vehicle.make} {vehicle.model}
            </span>
            <span className="font-mono text-xs text-muted">
              {vehicle.year}
              {vehicle.plate_no ? ` / ${vehicle.plate_no}` : ""}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted rtl:scale-x-[-1]" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-hairline pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] text-muted ltr:uppercase ltr:tracking-[0.08em]">
              {t.dashboard.currentOdometer}
            </span>
            <span className="font-mono text-xl font-bold text-on-dark">
              {vehicle.current_odometer.toLocaleString(locale === "ar" ? "ar" : "en")}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] text-muted ltr:uppercase ltr:tracking-[0.08em]">
              {dueCount > 0 ? (dueCount === 1 ? t.dashboard.dueCount : t.dashboard.dueCountPlural) : ""}
            </span>
            <span
              className={`font-mono text-xl font-bold ${dueCount > 0 ? "text-m-red" : "text-success"}`}
            >
              {dueCount > 0 ? dueCount : t.dashboard.allOk}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
