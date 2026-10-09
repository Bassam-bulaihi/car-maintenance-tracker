import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ServiceType } from "@/lib/admin/service-types";

type Client = SupabaseClient<Database>;

/**
 * Resets a service item's baseline to "just done at the current odometer"
 * and appends a service_history record (docs/PRD.md §5.5: confirming a
 * service resets both last_service_odometer and last_service_date).
 *
 * Called from the web "تم التغيير" button (lib/dashboard/actions.ts, as the
 * signed-in user) and from the Telegram Done button / "تم" reply
 * (lib/messaging/inbound.ts, as the service role).
 */
export async function markServiceDone(
  supabase: Client,
  vehicleId: string,
  serviceItemId: string,
  serviceType: ServiceType,
  odometerAtService: number,
) {
  const today = new Date().toISOString().slice(0, 10);

  const { error: updateError } = await supabase
    .from("vehicle_service_items")
    .update({
      last_service_odometer: odometerAtService,
      last_service_date: today,
      status: "ok",
    })
    .eq("id", serviceItemId);
  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from("service_history").insert({
    vehicle_id: vehicleId,
    service_type: serviceType,
    odometer_at_service: odometerAtService,
  });
  if (historyError) throw historyError;
}

/**
 * Marks every still-open reminder for one service item as answered, so a
 * confirmation from either channel resolves all of them (an old reminder's
 * buttons then answer "already answered" instead of logging a second
 * service). Service role only — users can't write notifications.
 */
export async function closeServiceReminders(
  serviceClient: Client,
  serviceItemId: string,
  response: Database["public"]["Enums"]["notification_response"],
) {
  const { error } = await serviceClient
    .from("notifications")
    .update({ response, responded_at: new Date().toISOString() })
    .eq("service_item_id", serviceItemId)
    .in("message_type", ["service_due", "re_reminder"])
    .or("responded_at.is.null,response.eq.not_done");
  if (error) throw error;
}
