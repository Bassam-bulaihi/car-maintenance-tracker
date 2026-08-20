import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { ServiceType } from "@/lib/admin/service-types";
import { computeServiceStatus } from "@/lib/dashboard/service-status";
import { sendServiceDueNotification } from "@/lib/messaging/send";

type ServiceClient = SupabaseClient<Database>;

/**
 * Runs the mileage-OR-time due check (docs/PRD.md §5.4) against every
 * not-yet-due service item on a vehicle, and fires the first "is <service>
 * due?" WhatsApp push (§5.5) for anything newly due. This is the bridge
 * flagged as missing in docs/unresolved.md: it's called from both
 * odometer-entry paths — web `submitOdometerReading` and WhatsApp
 * `handleOdometerReply` — since §5.3 requires a web-entered reading to
 * "trigger the same due-service evaluation as a WhatsApp one" — and from
 * the `due-service-check` cron, which re-runs it daily so time-based items
 * become due even without a new odometer reading.
 *
 * Requires a service-role client: it writes `notifications`, which has no
 * RLS insert policy for signed-in users (only server/cron code writes it).
 * The `.eq("status", "ok")` on the update guards against a race where two
 * callers (e.g. the cron and a concurrent web submission) see the same item
 * as still-ok and would otherwise both send a notification for it.
 */
export async function evaluateAndNotifyDueServices(
  supabase: ServiceClient,
  vehicleId: string,
) {
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, make, model, current_odometer, users(phone_number, language)")
    .eq("id", vehicleId)
    .single();
  if (!vehicle || !vehicle.users) return 0;
  const user = vehicle.users;

  const { data: items } = await supabase
    .from("vehicle_service_items")
    .select(
      "id, service_type, interval_km, interval_months, last_service_odometer, last_service_date",
    )
    .eq("vehicle_id", vehicleId)
    .eq("status", "ok");

  let sent = 0;
  for (const item of items ?? []) {
    if (computeServiceStatus(item, vehicle.current_odometer) !== "due") continue;

    const { error: updateError, data: updated } = await supabase
      .from("vehicle_service_items")
      .update({ status: "due" })
      .eq("id", item.id)
      .eq("status", "ok")
      .select("id");
    if (updateError || !updated || updated.length === 0) continue;

    try {
      await sendServiceDueNotification(
        supabase,
        { id: vehicle.id, make: vehicle.make, model: vehicle.model },
        { phone_number: user.phone_number, language: user.language as Locale },
        { id: item.id, service_type: item.service_type as ServiceType },
        "service_due",
      );
      sent++;
    } catch (err) {
      console.error(`due-service check: failed to notify for item ${item.id}`, err);
    }
  }

  return sent;
}
