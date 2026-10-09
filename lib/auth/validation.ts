// Shared by the client-side auth forms and the server actions, so the same
// rules apply on both sides.

// Phone number stays a required contact field on the profile (PRD 5.1);
// reminders themselves go to the linked Telegram chat.
export const E164_PHONE = /^\+[1-9]\d{7,14}$/;

export const MIN_PASSWORD_LENGTH = 8;

export type ProfileFieldError = "name" | "phone";

export function validateProfileFields(name: string, phoneNumber: string): ProfileFieldError | null {
  if (name.trim().length < 2) return "name";
  if (!E164_PHONE.test(phoneNumber.trim())) return "phone";
  return null;
}

// A Telegram reminder deep-links straight to one vehicle's page; a
// logged-out tap lands on /login?next=/dashboard/vehicles/<id> (set by the
// proxy), and login returns the user to that exact car. Only same-origin
// paths are honoured — "//evil.com" and absolute URLs are rejected so the
// parameter can't be used as an open redirect.
export function safeNextPath(value: string | null | undefined) {
  const next = value ?? "";
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}
