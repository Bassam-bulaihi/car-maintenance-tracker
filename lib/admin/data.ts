import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { computeServiceStatus } from "@/lib/dashboard/service-status";
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

/** Headline numbers for the admin overview. */
export async function getAdminOverview() {
  await requireAdmin();
  const db = createServiceClient();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const count = async (query: PromiseLike<{ count: number | null }>) => (await query).count ?? 0;

  const [users, linked, vehicles, presets, sentThisWeek, failedThisWeek, followUps, items] = await Promise.all([
    count(db.from("users").select("id", { count: "exact", head: true })),
    count(db.from("users").select("id", { count: "exact", head: true }).not("telegram_chat_id", "is", null)),
    count(db.from("vehicles").select("id", { count: "exact", head: true })),
    count(db.from("vehicle_presets").select("id", { count: "exact", head: true }).eq("is_active", true)),
    count(db.from("notifications").select("id", { count: "exact", head: true }).gte("sent_at", weekAgo)),
    count(
      db.from("notifications").select("id", { count: "exact", head: true }).eq("delivery_status", "failed").gte("created_at", weekAgo),
    ),
    count(
      db.from("notifications").select("id", { count: "exact", head: true }).eq("needs_follow_up", true).is("responded_at", null),
    ),
    db
      .from("vehicle_service_items")
      .select("interval_km, interval_months, last_service_odometer, last_service_date, vehicles!inner(current_odometer)"),
  ]);

  const dueItems = (items.data ?? []).filter(
    (item) => computeServiceStatus(item, item.vehicles.current_odometer) === "due",
  ).length;

  return { users, linked, vehicles, presets, sentThisWeek, failedThisWeek, followUps, dueItems };
}
