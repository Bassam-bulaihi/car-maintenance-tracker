"use server";

import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/session";
import { createProfile } from "@/lib/auth/profile";
import { validateProfileFields } from "@/lib/auth/validation";
import { getLocale } from "@/lib/i18n/locale";
import { dictionaries } from "@/lib/i18n/dictionaries";

export type AuthFormState = { error: string } | undefined;

// Sign-in, sign-up and sign-out run client-side through Clerk
// (components/auth/*). This only covers the server half: creating the
// public.users profile when it couldn't be created automatically.
export async function completeOnboarding(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const user = await requireSessionUser();
  const locale = await getLocale();
  const t = dictionaries[locale].auth.errors;

  const name = String(formData.get("name") ?? "").trim();
  const phoneNumber = String(formData.get("phone_number") ?? "").trim();

  const fieldError = validateProfileFields(name, phoneNumber);
  if (fieldError) return { error: t[fieldError] };

  const { error } = await createProfile(user, { name, phoneNumber, language: locale });
  if (error) {
    // 23505 = unique_violation; phone_number is unique per account.
    return { error: error.code === "23505" ? t.phoneTaken : t.generic };
  }

  redirect("/dashboard");
}
