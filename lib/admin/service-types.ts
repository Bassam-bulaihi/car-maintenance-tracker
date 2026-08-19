// Mirrors the public.service_type enum (docs/PRD.md §6 — "Service types (v1)").
export const SERVICE_TYPES = [
  { value: "engine_oil", label: "زيت المحرك" },
  { value: "transmission_fluid", label: "زيت ناقل الحركة" },
  { value: "brake_fluid", label: "زيت الفرامل" },
  { value: "brake_pads", label: "تيل الفرامل" },
  { value: "air_filter", label: "فلتر الهواء" },
  { value: "oil_filter", label: "فلتر الزيت" },
  { value: "tires", label: "الإطارات" },
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number]["value"];

export function serviceTypeLabel(value: string) {
  return SERVICE_TYPES.find((s) => s.value === value)?.label ?? value;
}
