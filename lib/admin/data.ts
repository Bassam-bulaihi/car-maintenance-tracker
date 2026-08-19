import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Secure (DB-backed) admin check for reads in Server Components. Proxy only
// does an optimistic JWT-claims check; this re-verifies against the Auth
// server, per docs/PRD.md rule 0.5 — see also lib/admin/actions.ts for the
// matching check on writes.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect(user ? "/dashboard" : "/login");
  }

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
