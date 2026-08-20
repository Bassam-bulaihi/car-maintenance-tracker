// Single-source config values the PRD calls out as "must be stored as
// configuration, not hardcoded across the codebase" (docs/PRD.md §5.3, §5.5).

// A web-entered (or WhatsApp-entered, once that exists) reading further than
// this past the last recorded reading is rejected as an implausible jump
// rather than silently accepted (docs/PRD.md §5.3/§7.5).
export const ODOMETER_MAX_JUMP_KM = 5000;

// How often the system asks for an odometer reading, and how much more
// aggressively it re-chases an unresolved "due" notification. Not consumed
// yet (no scheduler exists until the WhatsApp layer is built) — defined now
// so that layer reads from here instead of a new hardcoded value.
export const ODOMETER_REQUEST_INTERVAL_DAYS = 14;
export const SERVICE_DUE_REMINDER_INTERVAL_DAYS = 3;

// Public origin used to build the deep links carried inside outbound
// WhatsApp messages. WhatsApp is send-only in the current build (see
// docs/unresolved.md) — every notification points the user at the web app
// to do the actual data entry, so this must be the real deployed origin,
// not a localhost default that would ship dead links to real phones.
export const APP_BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://car-auto-app.vercel.app"
).replace(/\/+$/, "");

/** Deep link straight to one vehicle's page — odometer box + due services. */
export function vehicleDeepLink(vehicleId: string) {
  return `${APP_BASE_URL}/dashboard/vehicles/${vehicleId}`;
}

/** Fallback link when we can't tell which vehicle the user means. */
export function dashboardDeepLink() {
  return `${APP_BASE_URL}/dashboard`;
}
