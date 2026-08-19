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
