import type { Locale } from "@/lib/i18n/dictionaries";

// Arabic display names for catalog makes and models. The database keeps the
// canonical (English) names; this is presentation only. Anything not listed
// — e.g. a custom car the user typed — is shown exactly as stored.

const MAKES_AR: Record<string, string> = {
  Toyota: "تويوتا",
  Hyundai: "هيونداي",
  Kia: "كيا",
  Nissan: "نيسان",
  Honda: "هوندا",
  Mazda: "مازدا",
  Mitsubishi: "ميتسوبيشي",
  Lexus: "لكزس",
  Isuzu: "إيسوزو",
  Chevrolet: "شفروليه",
  GMC: "جي إم سي",
  Ford: "فورد",
  MG: "إم جي",
  Changan: "شانجان",
  Geely: "جيلي",
  Suzuki: "سوزوكي",
  Jeep: "جيب",
  Volkswagen: "فولكس فاجن",
};

const MODELS_AR: Record<string, string> = {
  Camry: "كامري",
  Corolla: "كورولا",
  Yaris: "يارس",
  RAV4: "راف فور",
  Fortuner: "فورتشنر",
  "Land Cruiser": "لاندكروزر",
  "Land Cruiser Prado": "برادو",
  Hilux: "هايلكس",
  Accent: "أكسنت",
  Elantra: "إلنترا",
  Sonata: "سوناتا",
  Creta: "كريتا",
  Tucson: "توسان",
  "Santa Fe": "سنتافي",
  Pegas: "بيجاس",
  Rio: "ريو",
  Cerato: "سيراتو",
  K5: "كي 5",
  Sportage: "سبورتاج",
  Sorento: "سورينتو",
  Sunny: "صني",
  Altima: "ألتيما",
  Kicks: "كيكس",
  "X-Trail": "إكس تريل",
  Patrol: "باترول",
  Navara: "نافارا",
  City: "سيتي",
  Civic: "سيفيك",
  Accord: "أكورد",
  "CR-V": "سي آر في",
  "Mazda 3": "مازدا 3",
  "Mazda 6": "مازدا 6",
  "CX-5": "سي إكس 5",
  Attrage: "أتراج",
  Outlander: "أوتلاندر",
  Pajero: "باجيرو",
  L200: "إل 200",
  ES: "إي إس",
  RX: "آر إكس",
  LX: "إل إكس",
  "D-Max": "دي ماكس",
  Malibu: "ماليبو",
  Captiva: "كابتيفا",
  Tahoe: "تاهو",
  Silverado: "سلفرادو",
  Yukon: "يوكن",
  Sierra: "سييرا",
  Taurus: "تورس",
  Explorer: "إكسبلورر",
  Expedition: "إكسبيديشن",
  "F-150": "إف 150",
  MG5: "إم جي 5",
  ZS: "زد إس",
  RX5: "آر إكس 5",
  Alsvin: "ألسفن",
  "CS35 Plus": "سي إس 35 بلس",
  "CS75 Plus": "سي إس 75 بلس",
  Emgrand: "إمجراند",
  Coolray: "كولراي",
  Dzire: "ديزاير",
  Swift: "سويفت",
  Ertiga: "إرتيغا",
  Jimny: "جيمني",
  Wrangler: "رانجلر",
  "Grand Cherokee": "جراند شيروكي",
  Compass: "كومباس",
  Tiguan: "تيجوان",
  Teramont: "تيرامونت",
  Passat: "باسات",
};

export function makeName(make: string, locale: Locale) {
  return locale === "ar" ? (MAKES_AR[make] ?? make) : make;
}

export function modelName(model: string, locale: Locale) {
  return locale === "ar" ? (MODELS_AR[model] ?? model) : model;
}

/** "Toyota Camry" / "تويوتا كامري". */
export function vehicleName(vehicle: { make: string; model: string }, locale: Locale) {
  return `${makeName(vehicle.make, locale)} ${modelName(vehicle.model, locale)}`;
}
