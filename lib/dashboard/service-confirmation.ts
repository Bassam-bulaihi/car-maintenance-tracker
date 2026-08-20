import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ServiceType } from "@/lib/admin/service-types";

/**
 * Resets a service item's baseline to "just done at the current odometer"
 * and appends a service_history record (docs/PRD.md §5.5: confirming a
 * service resets both last_service_odometer and last_service_date). Shared
 * by the web "تم التغيير" button (lib/dashboard/actions.ts) and the WhatsApp
 * webhook (lib/messaging/inbound.ts) so both paths run one implementation.
 */
export async function markServiceDone(
  supabase: SupabaseClient<Database>,
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
