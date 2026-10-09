// Single-source config values the PRD calls out as "must be stored as
// configuration, not hardcoded across the codebase" (docs/PRD.md §5.3, §5.5).

// Plausibility check for a new odometer reading (docs/PRD.md §5.3/§7.5).
// The allowance scales with the time since the last reading — 5,000 km in
// one day is suspicious, after two months it's normal:
//   allowance = max(ODOMETER_MIN_ALLOWANCE_KM, days × ODOMETER_MAX_KM_PER_DAY)
// A reading above the allowance isn't rejected; the user is asked to confirm
// it (catches a typo'd extra zero without refusing a genuine reading).
// Anything below the last reading, non-numeric, or above
// ODOMETER_ABSOLUTE_MAX_KM is always rejected.
export const ODOMETER_MAX_KM_PER_DAY = 1000;
export const ODOMETER_MIN_ALLOWANCE_KM = 2000;
export const ODOMETER_ABSOLUTE_MAX_KM = 1_000_000;

// How often the system asks for an odometer reading, and how much more
// aggressively it re-chases a service item that is still due. Consumed by
// the two cron routes under app/api/cron/ — change the cadence here, never
// in the schedulers.
export const ODOMETER_REQUEST_INTERVAL_DAYS = 14;
export const SERVICE_DUE_REMINDER_INTERVAL_DAYS = 3;

// How many unparseable/invalid replies one Telegram thread gets a
// clarification for before it is flagged for follow-up and the bot stops
// asking (PRD §7.5: "after a defined number of failed attempts the thread is
// left open and flagged for follow-up rather than looping indefinitely").
export const MAX_REPLY_ATTEMPTS = 3;

// Lifetime of the one-time t.me/<bot>?start=<token> link issued from the
// account page.
export const TELEGRAM_LINK_TOKEN_TTL_MINUTES = 30;

// Public origin of the deployed app. Telegram messages carry a link back to
// the vehicle's page alongside the in-chat reply path, so the messaging layer
// needs an absolute URL. Vercel injects VERCEL_PROJECT_PRODUCTION_URL on
// deployments; APP_BASE_URL overrides it for local/preview sends.
export function appBaseUrl() {
  const explicit = process.env.APP_BASE_URL ?? process.env.NEXT_PUBLIC_APP_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:3000";
}

/** Deep link to one vehicle's page — attached to every reminder. */
export function vehiclePageUrl(vehicleId: string) {
  return `${appBaseUrl()}/dashboard/vehicles/${vehicleId}`;
}

/**
 * Integration tests (scripts/test-telegram-flows.mjs) run the real cron
 * routes against the shared database; this confines the schedulers to the
 * test's own seeded users so real users' vehicles are never touched. Unset
 * everywhere else.
 */
export function schedulerUserIdPrefix() {
  return process.env.SCHEDULER_TEST_USER_PREFIX || null;
}
