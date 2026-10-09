import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireSessionUser, type SessionUser } from "@/lib/auth/session";
import { validateProfileFields } from "@/lib/auth/validation";
import type { Locale } from "@/lib/i18n/dictionaries";

type ProfileInput = { name: string; phoneNumber: string; language: Locale };

// public.users has no client insert policy — the row used to be created by an
// auth.users trigger. With Clerk there is no such trigger, so trusted server
// code creates it with the service role, keyed to the verified Clerk user ID.
export async function createProfile(user: SessionUser, input: ProfileInput) {
  const { error } = await createServiceClient().from("users").insert({
    id: user.id,
    email: user.email,
    name: input.name.trim(),
    phone_number: input.phoneNumber.trim(),
    language: input.language,
  });
  return { error };
}

// Every signed-in page/action that touches user data goes through this: it
// returns the user's profile row, creating it on first sign-in from what the
// signup form stored in Clerk's unsafeMetadata. If that's missing or invalid
// (e.g. the user was created from the Clerk Dashboard), send them to
// /onboarding to supply the required name + phone number.
export const requireProfile = cache(async () => {
  const user = await requireSessionUser();
  const supabase = await createClient();

  const { data: existing } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();
  if (existing) return { supabase, user, profile: existing };

  const { name = "", phone_number = "", language } = user.unsafeMetadata;
  if (validateProfileFields(name, phone_number) === null) {
    const { error } = await createProfile(user, {
      name,
      phoneNumber: phone_number,
      language: language === "en" ? "en" : "ar",
    });
    if (!error) {
      const { data: created } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (created) return { supabase, user, profile: created };
    }
  }

  redirect("/onboarding");
});
