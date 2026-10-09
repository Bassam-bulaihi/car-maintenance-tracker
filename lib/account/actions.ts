"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { createLinkToken, telegramBotUsername } from "@/lib/messaging/linking";
import { requireProfile } from "@/lib/auth/profile";
import { E164_PHONE } from "@/lib/auth/validation";
import { getLocale } from "@/lib/i18n/locale";
import { dictionaries } from "@/lib/i18n/dictionaries";

export type AccountFormState = { error: string } | { success: true } | undefined;

export async function updateAccount(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const { supabase, user } = await requireProfile();

  const locale = await getLocale();
  const t = dictionaries[locale].auth.errors;

  const name = String(formData.get("name") ?? "").trim();
  const phoneNumber = String(formData.get("phone_number") ?? "").trim();

  if (name.length < 2) {
    return { error: t.name };
  }
  if (!E164_PHONE.test(phoneNumber)) {
    return { error: t.phone };
  }

  const { error } = await supabase
    .from("users")
    .update({ name, phone_number: phoneNumber })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/account");
  revalidatePath("/dashboard");
  return { success: true };
}

// Telegram can't open a chat from a phone number, so the user links it:
// this issues a one-time token and sends them to t.me/<bot>?start=<token>;
// the bot's /start handler (lib/messaging/inbound.ts) finishes the link.
export async function connectTelegram() {
  const { user } = await requireProfile();
  const username = telegramBotUsername();
  if (!username) redirect("/dashboard/account");

  const token = await createLinkToken(createServiceClient(), user.id);
  redirect(`https://t.me/${username}?start=${token}`);
}

export async function disconnectTelegram() {
  const { user } = await requireProfile();
  await createServiceClient()
    .from("users")
    .update({ telegram_chat_id: null, telegram_linked_at: null })
    .eq("id", user.id);
  revalidatePath("/dashboard/account");
}
