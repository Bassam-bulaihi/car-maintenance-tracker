// Pure due-service evaluation — docs/PRD.md §5.4: a service is due when
// EITHER its mileage threshold OR its time threshold is crossed, whichever
// comes first. Either threshold may be null for a given item.

export type ServiceItem = {
  interval_km: number | null;
  interval_months: number | null;
  last_service_odometer: number | null;
  last_service_date: string | null;
};

export type ComputedStatus = "ok" | "due";

function monthsBetween(from: Date, to: Date) {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  );
}

export function computeServiceStatus(
  item: ServiceItem,
  currentOdometerKm: number,
  today: Date = new Date(),
): ComputedStatus {
  const mileageDue =
    item.interval_km !== null &&
    item.last_service_odometer !== null &&
    currentOdometerKm - item.last_service_odometer >= item.interval_km;

  const timeDue =
    item.interval_months !== null &&
    item.last_service_date !== null &&
    monthsBetween(new Date(item.last_service_date), today) >= item.interval_months;

  return mileageDue || timeDue ? "due" : "ok";
}
