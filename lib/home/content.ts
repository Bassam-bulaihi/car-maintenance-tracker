import type { Locale } from "@/lib/i18n/dictionaries";

// Static marketing content for the public home page. Intentionally not
// database-backed: these are illustrative catalogue entries, while the real
// preset data lives in vehicle_presets and is only reachable once signed in.

export type Brand = { slug: string; name: string; modelCount: number };

export const BRANDS: Brand[] = [
  { slug: "toyota", name: "Toyota", modelCount: 18 },
  { slug: "hyundai", name: "Hyundai", modelCount: 14 },
  { slug: "nissan", name: "Nissan", modelCount: 12 },
  { slug: "kia", name: "Kia", modelCount: 11 },
  { slug: "honda", name: "Honda", modelCount: 9 },
  { slug: "ford", name: "Ford", modelCount: 9 },
  { slug: "chevrolet", name: "Chevrolet", modelCount: 8 },
  { slug: "mazda", name: "Mazda", modelCount: 7 },
  { slug: "mitsubishi", name: "Mitsubishi", modelCount: 6 },
  { slug: "lexus", name: "Lexus", modelCount: 6 },
  { slug: "gmc", name: "GMC", modelCount: 5 },
  { slug: "isuzu", name: "Isuzu", modelCount: 4 },
];

export type BodyType = {
  slug: string;
  label: Record<Locale, string>;
  modelCount: number;
};

export const BODY_TYPES: BodyType[] = [
  { slug: "sedan", label: { ar: "سيدان", en: "Sedan" }, modelCount: 32 },
  { slug: "suv", label: { ar: "دفع رباعي", en: "SUV" }, modelCount: 27 },
  { slug: "hatchback", label: { ar: "هاتشباك", en: "Hatchback" }, modelCount: 14 },
  { slug: "pickup", label: { ar: "بيك أب", en: "Pickup" }, modelCount: 12 },
  { slug: "crossover", label: { ar: "كروس أوفر", en: "Crossover" }, modelCount: 11 },
  { slug: "coupe", label: { ar: "كوبيه", en: "Coupe" }, modelCount: 8 },
  { slug: "minivan", label: { ar: "ميني فان", en: "Minivan" }, modelCount: 7 },
  { slug: "wagon", label: { ar: "ستيشن", en: "Wagon" }, modelCount: 5 },
  { slug: "convertible", label: { ar: "مكشوفة", en: "Convertible" }, modelCount: 4 },
  { slug: "sports", label: { ar: "رياضية", en: "Sports" }, modelCount: 4 },
  { slug: "van", label: { ar: "فان", en: "Van" }, modelCount: 3 },
  { slug: "offroad", label: { ar: "طرق وعرة", en: "Off-road" }, modelCount: 3 },
];

export type PresetCategory = "sedan" | "suv" | "hatchback" | "pickup";

export type ShowcasePreset = {
  slug: string;
  make: string;
  model: string;
  year: number;
  category: PresetCategory;
  popular: boolean;
  oilIntervalKm: number;
  oilType: string;
  intervalMonths: number;
  serviceItems: number;
};

export const SHOWCASE_PRESETS: ShowcasePreset[] = [
  {
    slug: "hyundai-accent-2025",
    make: "Hyundai",
    model: "Accent",
    year: 2025,
    category: "sedan",
    popular: true,
    oilIntervalKm: 5000,
    oilType: "5W-30",
    intervalMonths: 6,
    serviceItems: 7,
  },
  {
    slug: "toyota-land-cruiser-2024",
    make: "Toyota",
    model: "Land Cruiser",
    year: 2024,
    category: "suv",
    popular: true,
    oilIntervalKm: 10000,
    oilType: "0W-20",
    intervalMonths: 12,
    serviceItems: 7,
  },
  {
    slug: "nissan-patrol-2023",
    make: "Nissan",
    model: "Patrol",
    year: 2023,
    category: "suv",
    popular: true,
    oilIntervalKm: 8000,
    oilType: "5W-40",
    intervalMonths: 9,
    serviceItems: 6,
  },
  {
    slug: "kia-rio-2024",
    make: "Kia",
    model: "Rio",
    year: 2024,
    category: "hatchback",
    popular: false,
    oilIntervalKm: 7500,
    oilType: "5W-20",
    intervalMonths: 6,
    serviceItems: 6,
  },
  {
    slug: "toyota-hilux-2025",
    make: "Toyota",
    model: "Hilux",
    year: 2025,
    category: "pickup",
    popular: true,
    oilIntervalKm: 10000,
    oilType: "15W-40",
    intervalMonths: 12,
    serviceItems: 7,
  },
  {
    slug: "honda-civic-2023",
    make: "Honda",
    model: "Civic",
    year: 2023,
    category: "sedan",
    popular: false,
    oilIntervalKm: 6000,
    oilType: "0W-20",
    intervalMonths: 6,
    serviceItems: 6,
  },
];

// Years offered by the quick-check lookup widget.
export const LOOKUP_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
