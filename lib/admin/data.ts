import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdminUser } from "@/lib/auth/session";

// Secure admin check for reads in Server Components. Proxy only does an
// optimistic session-claims check; this re-verifies against a user freshly
// fetched from Clerk — see also lib/admin/actions.ts for the matching check
// on writes.
export async function requireAdmin() {
  const user = await requireAdminUser();
  const supabase = await createClient();
  return { supabase, user };
}

export async function listPresets() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("vehicle_presets")
    .select("*")
    .order("make")
    .order("model")
    .order("year");

  if (error) throw error;
  return data;
}

export async function getPresetWithItems(presetId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("vehicle_presets")
    .select("*, preset_service_items(*), preset_recommended_parts(*)")
    .eq("id", presetId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Telegram threads flagged after MAX_REPLY_ATTEMPTS invalid replies and not
 * yet resolved (PRD §7.5: "flagged for follow-up rather than looping").
 * Notifications are only readable by their owner under RLS, so the admin
 * view reads them with the service role after the admin check.
 */
export async function listFollowUps() {
  await requireAdmin();
  const { data, error } = await createServiceClient()
    .from("notifications")
    .select(
      "id, message_type, reply_attempts, response_text, sent_at, vehicles!inner(id, make, model, current_odometer, users!inner(name, email, phone_number))",
    )
    .eq("needs_follow_up", true)
    .is("responded_at", null)
    .order("sent_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** How many registered vehicles a preset re-sync would touch. */
export async function countVehiclesForPreset(preset: { make: string; model: string; year: number }) {
  await requireAdmin();
  const { count } = await createServiceClient()
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("make", preset.make)
    .eq("model", preset.model)
    .eq("year", preset.year);
  return count ?? 0;
}
