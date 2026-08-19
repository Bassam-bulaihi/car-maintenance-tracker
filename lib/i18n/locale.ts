import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, dictionaries, locales, type Locale } from "@/lib/i18n/dictionaries";

const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

export { LOCALE_COOKIE };
