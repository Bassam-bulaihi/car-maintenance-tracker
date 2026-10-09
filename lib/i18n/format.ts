import type { Locale } from "@/lib/i18n/dictionaries";
import { APP_TIME_ZONE } from "@/lib/config";

// One place for number/date presentation so every screen (and the bot)
// renders km and dates the same way: Arabic-Indic digits and Arabic month
// names under "ar", Western digits and day-month-year under "en".
const intlLocale = (locale: Locale) => (locale === "ar" ? "ar-SA" : "en-GB");

export function formatNumber(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(value);
}

export function formatDate(locale: Locale, value: string | Date) {
  // Rendered on UTC servers — pin the zone so a reading at 01:00 in Riyadh
  // isn't shown as the previous day.
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium", timeZone: APP_TIME_ZONE }).format(new Date(value));
}
