import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ODOMETER_MAX_JUMP_KM } from "@/lib/config";

type ServiceClient = SupabaseClient<Database>;
type OdometerSource = Database["public"]["Enums"]["odometer_source"];

export type OdometerError = "invalid" | "tooLow" | "implausible";

/**
 * The one validation rule for a new reading, shared by the web form and the
 * Telegram reply path (PRD §5.3: a web-entered reading runs the same
 * validation as a messaged one): an integer, not below the last recorded
 * reading, and not an implausible jump above it.
 */
export function validateOdometerReading(currentKm: number, reading: number | null): OdometerError | null {
  if (reading === null || !Number.isSafeInteger(reading) || reading < 0) return "invalid";
  if (reading < currentKm) return "tooLow";
  if (reading - currentKm > ODOMETER_MAX_JUMP_KM) return "implausible";
  return null;
}

/**
 * Stores an already-validated reading: history row, the vehicle's current
 * odometer, and closes any odometer request still waiting on that vehicle —
 * a reading from either channel answers it, which is what resets the
 * request clock (PRD §5.3). Runs with the service role; callers must have
 * verified ownership (web) or the chat link (Telegram) first.
 */
export async function recordOdometerReading(
  supabase: ServiceClient,
  vehicleId: string,
  reading: number,
  source: OdometerSource,
) {
  const now = new Date().toISOString();

  const { error: insertError } = await supabase
    .from("odometer_readings")
    .insert({ vehicle_id: vehicleId, reading_km: reading, source });
  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({ current_odometer: reading, odometer_updated_at: now })
    .eq("id", vehicleId);
  if (updateError) throw updateError;

  const { error: closeError } = await supabase
    .from("notifications")
    .update({ response_text: String(reading), responded_at: now })
    .eq("vehicle_id", vehicleId)
    .eq("message_type", "odometer_request")
    .is("responded_at", null);
  if (closeError) throw closeError;
}
