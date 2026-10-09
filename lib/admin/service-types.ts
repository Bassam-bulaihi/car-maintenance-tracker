import type { Locale } from "@/lib/i18n/dictionaries";

// Mirrors the public.service_type enum (docs/PRD.md §6 — "Service types (v1)").
export const SERVICE_TYPES = [
  { value: "engine_oil", label: { ar: "زيت المحرك", en: "Engine oil" } },
  { value: "transmission_fluid", label: { ar: "زيت ناقل الحركة", en: "Transmission fluid" } },
  { value: "brake_fluid", label: { ar: "زيت الفرامل", en: "Brake fluid" } },
  { value: "brake_pads", label: { ar: "تيل الفرامل", en: "Brake pads" } },
  { value: "air_filter", label: { ar: "فلتر الهواء", en: "Air filter" } },
  { value: "oil_filter", label: { ar: "فلتر الزيت", en: "Oil filter" } },
  { value: "tires", label: { ar: "الإطارات", en: "Tires" } },
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number]["value"];

export function serviceTypeLabel(value: string, locale: Locale) {
  return SERVICE_TYPES.find((s) => s.value === value)?.label[locale] ?? value;
}

export function serviceTypesFor(locale: Locale) {
  return SERVICE_TYPES.map((s) => ({ value: s.value, label: s.label[locale] }));
}

/**
 * Starting schedule for a custom vehicle (one not in the preset catalog) —
 * the "japanese" profile from the catalog seed, a middle-of-the-road
 * baseline. The user can adjust every interval before registering.
 */
export const DEFAULT_SERVICE_SCHEDULE: Record<ServiceType, { interval_km: number | null; interval_months: number | null }> = {
  engine_oil: { interval_km: 10000, interval_months: 12 },
  oil_filter: { interval_km: 10000, interval_months: 12 },
  air_filter: { interval_km: 20000, interval_months: 12 },
  brake_fluid: { interval_km: null, interval_months: 24 },
  brake_pads: { interval_km: 40000, interval_months: null },
  transmission_fluid: { interval_km: 60000, interval_months: 48 },
  tires: { interval_km: 50000, interval_months: null },
};
