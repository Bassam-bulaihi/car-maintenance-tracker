import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ODOMETER_ABSOLUTE_MAX_KM, ODOMETER_MAX_KM_PER_DAY, ODOMETER_MIN_ALLOWANCE_KM } from "@/lib/config";

type ServiceClient = SupabaseClient<Database>;
type OdometerSource = Database["public"]["Enums"]["odometer_source"];

const DAY_MS = 24 * 60 * 60 * 1000;

export type OdometerCheck =
  | { status: "ok" }
  | { status: "invalid" }
  | { status: "tooLow" }
  /** Plausible enough to accept, but only after the user confirms it. */
  | { status: "needsConfirmation"; jumpKm: number; allowanceKm: number };

/** How far the odometer can reasonably have moved since `lastUpdatedAt`. */
export function plausibleAllowanceKm(lastUpdatedAt: string | null, now: Date = new Date()) {
  const days = lastUpdatedAt ? Math.max(0, (now.getTime() - new Date(lastUpdatedAt).getTime()) / DAY_MS) : 0;
  return Math.max(ODOMETER_MIN_ALLOWANCE_KM, Math.ceil(days * ODOMETER_MAX_KM_PER_DAY));
}

/**
 * The one validation rule for a new reading, shared by the web form and the
 * Telegram reply path (PRD §5.3: a web-entered reading runs the same
 * validation as a messaged one). `confirmed` is the user having already said
 * "yes, that big jump is correct".
 */
export function checkOdometerReading(
  vehicle: { current_odometer: number; odometer_updated_at: string | null },
  reading: number | null,
  { confirmed = false, now = new Date() }: { confirmed?: boolean; now?: Date } = {},
): OdometerCheck {
  if (reading === null || !Number.isSafeInteger(reading) || reading < 0 || reading > ODOMETER_ABSOLUTE_MAX_KM) {
    return { status: "invalid" };
  }
  if (reading < vehicle.current_odometer) return { status: "tooLow" };

  const jumpKm = reading - vehicle.current_odometer;
  const allowanceKm = plausibleAllowanceKm(vehicle.odometer_updated_at, now);
  if (jumpKm > allowanceKm && !confirmed) return { status: "needsConfirmation", jumpKm, allowanceKm };

  return { status: "ok" };
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
    .update({ response_text: String(reading), responded_at: now, pending_reading_km: null })
    .eq("vehicle_id", vehicleId)
    .eq("message_type", "odometer_request")
    .is("responded_at", null);
  if (closeError) throw closeError;
}
