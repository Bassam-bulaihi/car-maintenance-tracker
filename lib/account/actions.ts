"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { dictionaries } from "@/lib/i18n/dictionaries";

export type AccountFormState = { error: string } | { success: true } | undefined;

// Same E.164 shape enforced at signup (lib/auth/actions.ts) — phone number
// is the WhatsApp channel identity, so it can't be relaxed here.
const E164_PHONE = /^\+[1-9]\d{7,14}$/;

export async function updateAccount(
  _prevState: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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
