import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type AuthErrorKey = keyof Dictionary["auth"]["errors"];

// Clerk's own messages are English-only; map the codes the custom forms can
// hit onto our translated strings so the Arabic UI never shows raw English.
const CODE_TO_KEY: Record<string, AuthErrorKey> = {
  form_identifier_not_found: "invalidCredentials",
  form_password_incorrect: "invalidCredentials",
  form_identifier_exists: "emailTaken",
  form_password_pwned: "weakPassword",
  form_password_length_too_short: "password",
  form_password_not_strong_enough: "weakPassword",
  form_password_validation_failed: "weakPassword",
  form_code_incorrect: "invalidCode",
  verification_expired: "invalidCode",
  verification_failed: "invalidCode",
};

export function clerkErrorMessage(error: unknown, t: Dictionary, fallback: AuthErrorKey = "generic") {
  if (isClerkAPIResponseError(error)) {
    for (const { code } of error.errors) {
      const key = CODE_TO_KEY[code];
      if (key) return t.auth.errors[key];
    }
  }
  return t.auth.errors[fallback];
}
