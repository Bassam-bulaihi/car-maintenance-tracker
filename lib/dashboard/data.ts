import "server-only";
import { requireProfile } from "@/lib/auth/profile";

export async function requireUser() {
  const { supabase, user } = await requireProfile();
  return { supabase, user };
}

export async function listVehicles() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_service_items(*)")
    .eq("user_id", user.id)
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function getVehicle(vehicleId: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_service_items(*)")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data;
}

export async function listOdometerReadings(vehicleId: string, limit = 10) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("odometer_readings")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function listServiceHistory(vehicleId: string, limit = 10) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("service_history")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("confirmed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function listActivePresets() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("vehicle_presets")
    .select("*, preset_service_items(*)")
    .eq("is_active", true)
    .order("make")
    .order("model")
    .order("year");

  if (error) throw error;
  return data;
}

/** The catalog's recommended oil for a car, or null for custom cars. */
export async function getRecommendedOil(vehicle: { make: string; model: string; year: number }) {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("vehicle_presets")
    .select("recommended_oil")
    .eq("make", vehicle.make)
    .eq("model", vehicle.model)
    .eq("year", vehicle.year)
    .maybeSingle();
  return data?.recommended_oil ?? null;
}
