import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
