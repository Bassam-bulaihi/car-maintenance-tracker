"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/profile";
import { getLocale } from "@/lib/i18n/locale";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { ServiceType } from "@/lib/admin/service-types";
import { closeServiceReminders, markServiceDone } from "@/lib/dashboard/service-confirmation";
import { checkOdometerReading, recordOdometerReading } from "@/lib/dashboard/odometer";
import { notifyDueServices } from "@/lib/messaging/due-services";
import { createServiceClient } from "@/lib/supabase/service";

export type DashboardFormState = { error: string } | undefined;

/** The odometer form can also come back asking the user to confirm a big jump. */
export type OdometerFormState =
  | { error: string }
  | { confirm: { reading: number; message: string } }
  | { saved: number }
  | undefined;

async function requireUserAction() {
  const { supabase, user } = await requireProfile();
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
  _prevState: OdometerFormState,
  formData: FormData,
): Promise<OdometerFormState> {
  const { supabase, user } = await requireUserAction();
  const locale = await getLocale();
  const t = dictionaries[locale].dashboard;

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, current_odometer, odometer_updated_at")
    .eq("id", vehicleId)
    .eq("user_id", user.id)
    .single();

  if (vehicleError || !vehicle) {
    return { error: t.errors.generic };
  }

  const readingRaw = String(formData.get("reading_km") ?? "").trim();
  const reading = /^\d+$/.test(readingRaw) ? Number(readingRaw) : null;
  const confirmed = formData.get("confirmed") === String(reading);

  const check = checkOdometerReading(vehicle, reading, { confirmed });
  if (check.status === "invalid") return { error: t.errors.invalidOdometer };
  if (check.status === "tooLow") return { error: t.errors.odometerTooLow };
  if (check.status === "needsConfirmation") {
    const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
    const date = vehicle.odometer_updated_at
      ? new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", { dateStyle: "medium" }).format(
          new Date(vehicle.odometer_updated_at),
        )
      : "—";
    return {
      confirm: {
        reading: reading!,
        message: t.confirmReadingPrompt
          .replace("{reading}", nf.format(reading!))
          .replace("{jump}", nf.format(check.jumpKm))
          .replace("{current}", nf.format(vehicle.current_odometer))
          .replace("{date}", date),
      },
    };
  }

  // Ownership is verified above with the user's own client; the write runs
  // as the service role because it also closes the vehicle's open Telegram
  // odometer request, and then evaluates due services right away — the same
  // path a Telegram reply takes (PRD §5.3).
  const service = createServiceClient();
  try {
    await recordOdometerReading(service, vehicleId, reading!, "web");
  } catch (error) {
    console.error("submitOdometerReading failed", error);
    return { error: t.errors.generic };
  }
  // Sending reminders must not hold up (or fail) the form response.
  after(() =>
    notifyDueServices(service, { vehicleId }).catch((error) =>
      console.error("submitOdometerReading: due-service evaluation failed", error),
    ),
  );

  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
  revalidatePath("/dashboard");
  return { saved: reading! };
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

  await markServiceDone(supabase, vehicleId, itemId, serviceType, vehicle.current_odometer);
  // Resolve any Telegram reminder still waiting on this item, so its buttons
  // answer "already answered" instead of logging the service twice.
  await closeServiceReminders(createServiceClient(), itemId, "done");

  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
}
