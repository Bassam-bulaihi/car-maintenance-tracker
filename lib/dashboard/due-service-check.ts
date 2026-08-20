import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { ServiceType } from "@/lib/admin/service-types";
import { computeServiceStatus } from "@/lib/dashboard/service-status";
import { sendServiceDueNotification } from "@/lib/messaging/send";

type ServiceClient = SupabaseClient<Database>;

/**
 * The due-service → notification bridge (docs/PRD.md §5.4/§5.5, previously
 * tracked as deferred in docs/unresolved.md). Evaluates every not-yet-due
 * `vehicle_service_items` row for one vehicle against its current odometer
 * and elapsed time; for each item that just crossed a threshold, flips
 * `status` to "due" and fires the first `service_due` WhatsApp notification
 * for it. Requires a service-role client — writing to `notifications` isn't
 * granted to authenticated users (supabase/migrations/20260819154618_init_schema.sql).
 *
 * Called from two places, per PRD §5.4 ("evaluated on every new odometer
 * reading, and on a recurring time check for date-based items"):
 *  - after every odometer update (web dashboard and WhatsApp reply), so a
 *    mileage-triggered item is flagged immediately rather than waiting for
 *    the next cron pass;
 *  - the daily `due-service-check` cron, which sweeps every vehicle so
 *    time-only items (interval_months, no interval_km) are still caught on
 *    days with no odometer activity at all.
 */
export async function evaluateDueServicesForVehicle(supabase: ServiceClient, vehicleId: string) {
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, make, model, current_odometer, users(phone_number, language)")
    .eq("id", vehicleId)
    .single();

  if (!vehicle || !vehicle.users) return { checked: 0, flagged: 0 };

  const { data: items } = await supabase
    .from("vehicle_service_items")
    .select("id, service_type, interval_km, interval_months, last_service_odometer, last_service_date")
    .eq("vehicle_id", vehicleId)
    .eq("status", "ok");

  let flagged = 0;
  for (const item of items ?? []) {
    if (computeServiceStatus(item, vehicle.current_odometer) !== "due") continue;

    // Guard against flagging twice if this ever runs concurrently (inline
    // call racing the daily cron) — only proceed if we're the one flipping
    // it from "ok".
    const { data: updated } = await supabase
      .from("vehicle_service_items")
      .update({ status: "due" })
      .eq("id", item.id)
      .eq("status", "ok")
      .select("id")
      .maybeSingle();
    if (!updated) continue;

    await sendServiceDueNotification(
      supabase,
      { id: vehicle.id, make: vehicle.make, model: vehicle.model },
      { phone_number: vehicle.users.phone_number, language: vehicle.users.language as Locale },
      { id: item.id, service_type: item.service_type as ServiceType },
      "service_due",
    );
    flagged++;
  }

  return { checked: items?.length ?? 0, flagged };
}
