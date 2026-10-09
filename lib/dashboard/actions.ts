"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/profile";
import { getLocale } from "@/lib/i18n/locale";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { SERVICE_TYPES, type ServiceType } from "@/lib/admin/service-types";
import { ODOMETER_ABSOLUTE_MAX_KM } from "@/lib/config";
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

type ScheduleItem = { service_type: ServiceType; interval_km: number | null; interval_months: number | null };

function parseInterval(raw: FormDataEntryValue | null) {
  const value = String(raw ?? "").trim();
  if (value === "") return { ok: true as const, value: null };
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= 1_000_000 ? { ok: true as const, value: n } : { ok: false as const };
}

/**
 * The schedule a custom vehicle starts with: every service the user left
 * ticked, with the km / months they entered (pre-filled from
 * DEFAULT_SERVICE_SCHEDULE). Null when anything is malformed or nothing
 * trackable is left.
 */
function customScheduleFromForm(formData: FormData): ScheduleItem[] | null {
  const items: ScheduleItem[] = [];
  for (const { value: serviceType } of SERVICE_TYPES) {
    if (formData.get(`track_${serviceType}`) !== "on") continue;
    const km = parseInterval(formData.get(`km_${serviceType}`));
    const months = parseInterval(formData.get(`months_${serviceType}`));
    if (!km.ok || !months.ok) return null;
    if (km.value === null && months.value === null) return null;
    items.push({ service_type: serviceType, interval_km: km.value, interval_months: months.value });
  }
  return items.length > 0 ? items : null;
}

/**
 * Registers a vehicle either from a catalog preset (PRD §5.2: make → model →
 * year loads the preset's schedule) or, when the car isn't in the catalog,
 * from a make/model/year the user typed plus a schedule they reviewed.
 */
export async function registerVehicle(
  _prevState: DashboardFormState,
  formData: FormData,
): Promise<DashboardFormState> {
  const { supabase, user } = await requireUserAction();
  const locale = await getLocale();
  const t = dictionaries[locale].dashboard;

  const plateNo = String(formData.get("plate_no") ?? "").trim().slice(0, 20) || null;
  const odometerRaw = String(formData.get("current_odometer") ?? "").trim();
  const currentOdometer = /^\d+$/.test(odometerRaw) ? Number(odometerRaw) : NaN;

  if (!Number.isSafeInteger(currentOdometer) || currentOdometer < 0 || currentOdometer > ODOMETER_ABSOLUTE_MAX_KM) {
    return { error: t.errors.invalidOdometer };
  }

  let identity: { make: string; model: string; year: number };
  let schedule: ScheduleItem[];

  if (formData.get("mode") === "custom") {
    const make = String(formData.get("custom_make") ?? "").trim().replace(/\s+/g, " ");
    const model = String(formData.get("custom_model") ?? "").trim().replace(/\s+/g, " ");
    const year = Number(formData.get("custom_year"));
    const maxYear = new Date().getFullYear() + 1;
    if (!make || !model || make.length > 40 || model.length > 40 || !Number.isInteger(year) || year < 1960 || year > maxYear) {
      return { error: t.errors.customVehicle };
    }
    const custom = customScheduleFromForm(formData);
    if (!custom) return { error: t.errors.customSchedule };
    identity = { make, model, year };
    schedule = custom;
  } else {
    const presetId = String(formData.get("preset_id") ?? "");
    const { data: preset, error: presetError } = presetId
      ? await supabase
          .from("vehicle_presets")
          .select("make, model, year, preset_service_items(service_type, interval_km, interval_months)")
          .eq("id", presetId)
          .eq("is_active", true)
          .single()
      : { data: null, error: null };
    if (presetError || !preset) return { error: t.errors.presetRequired };
    identity = { make: preset.make, model: preset.model, year: preset.year };
    schedule = preset.preset_service_items as ScheduleItem[];
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .insert({
      user_id: user.id,
      ...identity,
      plate_no: plateNo,
      current_odometer: currentOdometer,
      odometer_updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (vehicleError || !vehicle) {
    console.error("registerVehicle: insert failed", vehicleError);
    return { error: t.errors.generic };
  }

  // Baselines start at registration: "last done" = today at the current
  // reading, so nothing shows as overdue on day one (PRD §5.2 step 4's
  // optional "recently done" seeding is covered by confirming on the page).
  if (schedule.length > 0) {
    const { error: itemsError } = await supabase.from("vehicle_service_items").insert(
      schedule.map((item) => ({
        vehicle_id: vehicle.id,
        service_type: item.service_type,
        interval_km: item.interval_km,
        interval_months: item.interval_months,
        last_service_odometer: currentOdometer,
        last_service_date: today,
        status: "ok" as const,
      })),
    );
    if (itemsError) {
      console.error("registerVehicle: service items failed", itemsError);
      return { error: t.errors.generic };
    }
  }

  const { error: readingError } = await supabase.from("odometer_readings").insert({
    vehicle_id: vehicle.id,
    reading_km: currentOdometer,
    source: "web",
  });
  if (readingError) console.error("registerVehicle: initial reading failed", readingError);

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
