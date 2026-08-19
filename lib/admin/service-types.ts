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
