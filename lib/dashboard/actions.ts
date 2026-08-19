"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { ODOMETER_MAX_JUMP_KM } from "@/lib/config";
import type { ServiceType } from "@/lib/admin/service-types";

export type DashboardFormState = { error: string } | undefined;

async function requireUserAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

export async function registerVehicle(
  _prevState: DashboardFormState,
  formData: FormData,
): Promise<DashboardFormState> {
  const { supabase, user } = await requireUserAction();
  const locale = await getLocale();
  const t = dictionaries[locale].dashboard;

  const presetId = String(formData.get("preset_id") ?? "");
  const plateNo = String(formData.get("plate_no") ?? "").trim() || null;
  const odometerRaw = String(formData.get("current_odometer") ?? "").trim();
  const currentOdometer = Number(odometerRaw);

  if (!Number.isInteger(currentOdometer) || currentOdometer < 0) {
    return { error: t.errors.invalidOdometer };
  }

  const { data: preset, error: presetError } = await supabase
    .from("vehicle_presets")
    .select("*, preset_service_items(*)")
    .eq("id", presetId)
    .single();

  if (presetError || !preset) {
    return { error: t.errors.presetRequired };
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .insert({
      user_id: user.id,
      make: preset.make,
      model: preset.model,
      year: preset.year,
      plate_no: plateNo,
      current_odometer: currentOdometer,
      odometer_updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (vehicleError || !vehicle) {
    return { error: vehicleError?.message ?? t.errors.generic };
  }

  if (preset.preset_service_items.length > 0) {
    const { error: itemsError } = await supabase.from("vehicle_service_items").insert(
      preset.preset_service_items.map((item) => ({
        vehicle_id: vehicle.id,
        service_type: item.service_type,
        interval_km: item.interval_km,
        interval_months: item.interval_months,
        last_service_odometer: currentOdometer,
        last_service_date: today,
        status: "ok" as const,
      })),
    );
    if (itemsError) return { error: itemsError.message };
  }

  const { error: readingError } = await supabase.from("odometer_readings").insert({
    vehicle_id: vehicle.id,
    reading_km: currentOdometer,
    source: "web",
  });
  if (readingError) return { error: readingError.message };

  revalidatePath("/dashboard");
  redirect(`/dashboard/vehicles/${vehicle.id}`);
}

export async function submitOdometerReading(
  vehicleId: string,
  _prevState: DashboardFormState,
  formData: FormData,
): Promise<DashboardFormState> {
  const { supabase, user } = await requireUserAction();
  const locale = await getLocale();
  const t = dictionaries[locale].dashboard;

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, current_odometer")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) {
    return { error: t.errors.generic };
  }

  const readingRaw = String(formData.get("reading_km") ?? "").trim();
  const reading = Number(readingRaw);

  if (!Number.isInteger(reading)) {
    return { error: t.errors.invalidOdometer };
  }
  if (reading < vehicle.current_odometer) {
    return { error: t.errors.odometerTooLow };
  }
  if (reading - vehicle.current_odometer > ODOMETER_MAX_JUMP_KM) {
    return { error: t.errors.odometerImplausible };
  }

  const { error: insertError } = await supabase.from("odometer_readings").insert({
    vehicle_id: vehicleId,
    reading_km: reading,
    source: "web",
  });
  if (insertError) return { error: insertError.message };

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({ current_odometer: reading, odometer_updated_at: new Date().toISOString() })
    .eq("id", vehicleId);
  if (updateError) return { error: updateError.message };

  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
  revalidatePath("/dashboard");
  return undefined;
}

export async function confirmServiceDone(
  vehicleId: string,
  itemId: string,
  serviceType: ServiceType,
  _formData: FormData,
) {
  const { supabase, user } = await requireUserAction();

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, current_odometer")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) throw vehicleError ?? new Error("vehicle not found");

  const today = new Date().toISOString().slice(0, 10);

  const { error: updateError } = await supabase
    .from("vehicle_service_items")
    .update({
      last_service_odometer: vehicle.current_odometer,
      last_service_date: today,
      status: "ok",
    })
    .eq("id", itemId);
  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from("service_history").insert({
    vehicle_id: vehicleId,
    service_type: serviceType,
    odometer_at_service: vehicle.current_odometer,
  });
  if (historyError) throw historyError;

  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
}
