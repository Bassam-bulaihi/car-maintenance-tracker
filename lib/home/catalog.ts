import "server-only";
import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/service";

export type CatalogModel = {
  make: string;
  model: string;
  years: number[];
  oilType: string | null;
  oilIntervalKm: number | null;
  oilIntervalMonths: number | null;
  serviceCount: number;
};

/**
 * The public face of the preset catalog for the landing page (brand grid
 * counts, the quick-check widget). Presets are only readable by signed-in
 * users under RLS, so this reads with the service role and returns nothing
 * but active, non-personal catalog data.
 */
export const getPublicCatalog = cache(async (): Promise<CatalogModel[]> => {
  const { data, error } = await createServiceClient()
    .from("vehicle_presets")
    .select("make, model, year, recommended_oil, preset_service_items(service_type, interval_km, interval_months)")
    .eq("is_active", true)
    .order("make")
    .order("model")
    .order("year", { ascending: false });
  if (error) {
    console.error("getPublicCatalog failed", error);
    return [];
  }

  const byModel = new Map<string, CatalogModel>();
  for (const preset of data ?? []) {
    const key = `${preset.make}\u0000${preset.model}`;
    const oil = preset.preset_service_items.find((item) => item.service_type === "engine_oil");
    const existing = byModel.get(key);
    if (existing) {
      existing.years.push(preset.year);
      continue;
    }
    byModel.set(key, {
      make: preset.make,
      model: preset.model,
      years: [preset.year],
      oilType: preset.recommended_oil,
      oilIntervalKm: oil?.interval_km ?? null,
      oilIntervalMonths: oil?.interval_months ?? null,
      serviceCount: preset.preset_service_items.length,
    });
  }
  return [...byModel.values()];
});
