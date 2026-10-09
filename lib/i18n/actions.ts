"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { locales, type Locale } from "@/lib/i18n/dictionaries";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

export async function setLocale(locale: Locale, _formData: FormData) {
  if (!locales.includes(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  // There is no separate messaging-language setting (PRD §7.5): switching
  // the site language also switches the language of the user's Telegram
  // messages, which read users.language.
  const { userId } = await auth();
  if (userId) {
    const supabase = await createClient();
    const { error } = await supabase.from("users").update({ language: locale }).eq("id", userId);
    if (error) console.error("setLocale: failed to save language preference", error);
  }

  revalidatePath("/", "layout");
}
