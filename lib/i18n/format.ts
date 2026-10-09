import type { Locale } from "@/lib/i18n/dictionaries";

// One place for number/date presentation so every screen (and the bot)
// renders km and dates the same way: Arabic-Indic digits and Arabic month
// names under "ar", Western digits and day-month-year under "en".
const intlLocale = (locale: Locale) => (locale === "ar" ? "ar-SA" : "en-GB");

export function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(value);
}

export function formatDate(locale: Locale, value: string | Date) {
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" }).format(new Date(value));
}
