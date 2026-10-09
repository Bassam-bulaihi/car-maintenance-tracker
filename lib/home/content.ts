import type { Locale } from "@/lib/i18n/dictionaries";

// Static marketing content for the public home page: which brand marks the
// grid shows, the body-type tiles, and the six photographed showcase cards.
// Availability and model counts come from the real catalog
// (lib/home/catalog.ts), never from here.

export type Brand = { slug: string; name: string };

// Every make here has a real brand mark available in react-icons/si, so the
// grid renders actual logos rather than letter placeholders.
export const BRANDS: Brand[] = [
  { slug: "toyota", name: "Toyota" },
  { slug: "hyundai", name: "Hyundai" },
  { slug: "nissan", name: "Nissan" },
  { slug: "kia", name: "Kia" },
  { slug: "honda", name: "Honda" },
  { slug: "ford", name: "Ford" },
  { slug: "chevrolet", name: "Chevrolet" },
  { slug: "mazda", name: "Mazda" },
  { slug: "mitsubishi", name: "Mitsubishi" },
  { slug: "suzuki", name: "Suzuki" },
  { slug: "jeep", name: "Jeep" },
  { slug: "volkswagen", name: "Volkswagen" },
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
