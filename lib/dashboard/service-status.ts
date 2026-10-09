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

export type NextDue = {
  /** km until the mileage threshold (negative = overdue), or null if mileage isn't tracked. */
  kmRemaining: number | null;
  /** date the time threshold is reached, or null if time isn't tracked. */
  dueDate: Date | null;
  /** 0..1 — how far through its interval the item is, whichever limit is closer. */
  progress: number;
};

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Where an item stands within its current interval, for the vehicle page. */
export function computeNextDue(item: ServiceItem, currentOdometerKm: number, today: Date = new Date()): NextDue {
  let kmRemaining: number | null = null;
  let dueDate: Date | null = null;
  let progress = 0;

  if (item.interval_km !== null && item.last_service_odometer !== null) {
    const driven = currentOdometerKm - item.last_service_odometer;
    kmRemaining = item.interval_km - driven;
    progress = Math.max(progress, driven / item.interval_km);
  }
  if (item.interval_months !== null && item.last_service_date !== null) {
    const start = new Date(item.last_service_date);
    dueDate = addMonths(start, item.interval_months);
    const span = dueDate.getTime() - start.getTime();
    if (span > 0) progress = Math.max(progress, (today.getTime() - start.getTime()) / span);
  }

  return { kmRemaining, dueDate, progress: Math.min(1, Math.max(0, progress)) };
}
