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

/** User messages sent through the bot's /support command. */
export async function listSupportMessages(status: "open" | "resolved") {
  await requireAdmin();
  const { data, error } = await createServiceClient()
    .from("support_messages")
    .select("id, body, status, created_at, resolved_at, users!inner(name, email, language)")
    .eq("status", status)
    .order("created_at", { ascending: status === "open" })
    .limit(200);
  if (error) throw error;
  return data;
}

export async function countSupportMessages() {
  await requireAdmin();
  const db = createServiceClient();
  const [open, resolved] = await Promise.all([
    db.from("support_messages").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("support_messages").select("id", { count: "exact", head: true }).eq("status", "resolved"),
  ]);
  return { open: open.count ?? 0, resolved: resolved.count ?? 0 };
}
