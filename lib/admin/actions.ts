"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SERVICE_TYPES, type ServiceType } from "@/lib/admin/service-types";
import { getLocale } from "@/lib/i18n/locale";
import { dictionaries } from "@/lib/i18n/dictionaries";

export type AdminFormState = { error: string } | undefined;

// Every mutation re-checks the role against a freshly-fetched user (never
// the JWT alone) — Proxy's check is optimistic UX only, not the
// authorization boundary. RLS backs this up at the DB layer regardless.
async function requireAdminAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    redirect(user ? "/dashboard" : "/login");
  }

  return supabase;
}

async function adminMessages() {
  const locale = await getLocale();
  return dictionaries[locale].admin.presets;
}

function parseYear(raw: FormDataEntryValue | null) {
  const year = Number(raw);
  return Number.isInteger(year) && year >= 1990 && year <= 2100 ? year : null;
}

async function presetFieldsFromForm(
  formData: FormData,
): Promise<
  | { ok: false; error: string }
  | {
      ok: true;
      make: string;
      model: string;
      year: number;
      recommended_oil: string | null;
    }
> {
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = parseYear(formData.get("year"));
  const recommendedOil = String(formData.get("recommended_oil") ?? "").trim() || null;

  if (!make || !model || year === null) {
    return { ok: false, error: (await adminMessages()).makeModelRequired };
  }

  return { ok: true, make, model, year, recommended_oil: recommendedOil };
}

export async function createPreset(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const supabase = await requireAdminAction();
  const fields = await presetFieldsFromForm(formData);
  if (!fields.ok) return { error: fields.error };

  const { data, error } = await supabase
    .from("vehicle_presets")
    .insert({
      make: fields.make,
      model: fields.model,
      year: fields.year,
      recommended_oil: fields.recommended_oil,
    })
    .select("id")
    .single();

  if (error) {
    return {
      error: error.code === "23505" ? (await adminMessages()).duplicatePreset : error.message,
    };
  }

  revalidatePath("/admin/presets");
  redirect(`/admin/presets/${data.id}`);
}

export async function updatePreset(
  presetId: string,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const supabase = await requireAdminAction();
  const fields = await presetFieldsFromForm(formData);
  if (!fields.ok) return { error: fields.error };

  const { error } = await supabase
    .from("vehicle_presets")
    .update({
      make: fields.make,
      model: fields.model,
      year: fields.year,
      recommended_oil: fields.recommended_oil,
    })
    .eq("id", presetId);

  if (error) {
    return {
      error: error.code === "23505" ? (await adminMessages()).duplicatePreset : error.message,
    };
  }

  revalidatePath(`/admin/presets/${presetId}`);
  revalidatePath("/admin/presets");
  return undefined;
}

export async function setPresetActive(
  presetId: string,
  isActive: boolean,
  _formData: FormData,
) {
  const supabase = await requireAdminAction();
  const { error } = await supabase
    .from("vehicle_presets")
    .update({ is_active: isActive })
    .eq("id", presetId);

  if (error) throw error;

  revalidatePath(`/admin/presets/${presetId}`);
  revalidatePath("/admin/presets");
}

function intervalFieldsFromForm(
  formData: FormData,
):
  | { ok: false; errorKey: "intervalRequired" | "intervalInvalid" }
  | { ok: true; interval_km: number | null; interval_months: number | null } {
  const kmRaw = String(formData.get("interval_km") ?? "").trim();
  const monthsRaw = String(formData.get("interval_months") ?? "").trim();
  const intervalKm = kmRaw ? Number(kmRaw) : null;
  const intervalMonths = monthsRaw ? Number(monthsRaw) : null;

  if (intervalKm === null && intervalMonths === null) {
    return { ok: false, errorKey: "intervalRequired" };
  }
  if (
    (intervalKm !== null && (!Number.isInteger(intervalKm) || intervalKm <= 0)) ||
    (intervalMonths !== null &&
      (!Number.isInteger(intervalMonths) || intervalMonths <= 0))
  ) {
    return { ok: false, errorKey: "intervalInvalid" };
  }

  return { ok: true, interval_km: intervalKm, interval_months: intervalMonths };
}

const intervalErrorText = {
  ar: {
    intervalRequired: "أدخل فترة بالكيلومترات أو بالأشهر على الأقل.",
    intervalInvalid: "الفترات يجب أن تكون أرقاماً صحيحة موجبة.",
    invalidServiceType: "نوع الخدمة غير صالح.",
    duplicateServiceType: "هذا النوع من الخدمة مضاف بالفعل لهذا النموذج.",
  },
  en: {
    intervalRequired: "Enter a km and/or month interval.",
    intervalInvalid: "Intervals must be positive whole numbers.",
    invalidServiceType: "Invalid service type.",
    duplicateServiceType: "This service type has already been added to this preset.",
  },
} as const;

export async function addServiceItem(
  presetId: string,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const supabase = await requireAdminAction();
  const locale = await getLocale();
  const msg = intervalErrorText[locale];

  const serviceType = String(formData.get("service_type") ?? "") as ServiceType;
  if (!SERVICE_TYPES.some((s) => s.value === serviceType)) {
    return { error: msg.invalidServiceType };
  }

  const interval = intervalFieldsFromForm(formData);
  if (!interval.ok) return { error: msg[interval.errorKey] };

  const { error } = await supabase.from("preset_service_items").insert({
    preset_id: presetId,
    service_type: serviceType,
    interval_km: interval.interval_km,
    interval_months: interval.interval_months,
  });

  if (error) {
    return { error: error.code === "23505" ? msg.duplicateServiceType : error.message };
  }

  revalidatePath(`/admin/presets/${presetId}`);
  return undefined;
}

export async function updateServiceItem(
  itemId: string,
  presetId: string,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const supabase = await requireAdminAction();
  const locale = await getLocale();
  const msg = intervalErrorText[locale];

  const interval = intervalFieldsFromForm(formData);
  if (!interval.ok) return { error: msg[interval.errorKey] };

  const { error } = await supabase
    .from("preset_service_items")
    .update({
      interval_km: interval.interval_km,
      interval_months: interval.interval_months,
    })
    .eq("id", itemId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/presets/${presetId}`);
  return undefined;
}

export async function deleteServiceItem(
  itemId: string,
  presetId: string,
  _formData: FormData,
) {
  const supabase = await requireAdminAction();
  const { error } = await supabase
    .from("preset_service_items")
    .delete()
    .eq("id", itemId);

  if (error) throw error;

  revalidatePath(`/admin/presets/${presetId}`);
}

export async function addRecommendedPart(
  presetId: string,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const supabase = await requireAdminAction();
  const partName = String(formData.get("part_name") ?? "").trim();

  if (!partName) return undefined;

  const { error } = await supabase
    .from("preset_recommended_parts")
    .insert({ preset_id: presetId, part_name: partName });

  if (error) return { error: error.message };

  revalidatePath(`/admin/presets/${presetId}`);
  return undefined;
}

export async function deleteRecommendedPart(
  partId: string,
  presetId: string,
  _formData: FormData,
) {
  const supabase = await requireAdminAction();
  const { error } = await supabase
    .from("preset_recommended_parts")
    .delete()
    .eq("id", partId);

  if (error) throw error;

  revalidatePath(`/admin/presets/${presetId}`);
}
