import type { Locale } from "@/lib/i18n/dictionaries";

export type OutboundMessageType = "odometer_request" | "service_due";

// Twilio's WhatsApp channel only accepts pre-approved Content API templates
// for business-initiated sends outside the 24h session window (same
// constraint docs/PRD.md §7.2 documents for Meta's template requirement) —
// one Content SID per (message type, language), configured in the Twilio
// Console and referenced here by env var rather than hardcoded.
const CONTENT_SID_ENV: Record<OutboundMessageType, Record<Locale, string>> = {
  odometer_request: {
    ar: "TWILIO_CONTENT_SID_ODOMETER_REQUEST_AR",
    en: "TWILIO_CONTENT_SID_ODOMETER_REQUEST_EN",
  },
  service_due: {
    ar: "TWILIO_CONTENT_SID_SERVICE_DUE_AR",
    en: "TWILIO_CONTENT_SID_SERVICE_DUE_EN",
  },
};

export function getContentSid(messageType: OutboundMessageType, locale: Locale): string {
  const envVar = CONTENT_SID_ENV[messageType][locale];
  const sid = process.env[envVar];
  if (!sid) {
    throw new Error(`Missing ${envVar} — register the Content API template in Twilio first.`);
  }
  return sid;
}

// Twilio Content API variables are a flat {"1": "...", "2": "..."} object,
// positionally substituted into the approved template body.
//
// WhatsApp is send-only in the current build: we never ask the user to
// reply with a number or tap a confirm button, because inbound replies
// aren't processed (see docs/unresolved.md). Instead the last variable of
// each template is a deep link to the exact page where the user does the
// update themselves — so the approved template copy must end with
// something like "حدّث القراءة من هنا: {{2}}" / "Update it here: {{2}}".
export function odometerRequestVariables(vehicleLabel: string, link: string) {
  return JSON.stringify({ "1": vehicleLabel, "2": link });
}

export function serviceDueVariables(
  vehicleLabel: string,
  serviceLabel: string,
  link: string,
) {
  return JSON.stringify({ "1": vehicleLabel, "2": serviceLabel, "3": link });
}
