"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { dictionaries } from "@/lib/i18n/dictionaries";

export type AuthFormState = { error: string } | undefined;

// Phone number is the WhatsApp channel identity (PRD 5.1) — required at
// signup, not an optional profile field.
const E164_PHONE = /^\+[1-9]\d{7,14}$/;

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = await getLocale();
  const t = dictionaries[locale].auth.errors;

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneNumber = String(formData.get("phone_number") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) {
    return { error: t.name };
  }
  if (!E164_PHONE.test(phoneNumber)) {
    return { error: t.phone };
  }
  if (password.length < 8) {
    return { error: t.password };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone_number: phoneNumber,
        language: locale,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    redirect("/login?confirm=1");
  }

  redirect("/dashboard");
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const locale = await getLocale();
    return { error: dictionaries[locale].auth.errors.invalidCredentials };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
