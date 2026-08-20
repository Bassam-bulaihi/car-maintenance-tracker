import Twilio from "twilio";

// Lazy singleton so a missing env var only breaks messaging code paths (cron,
// webhook) at the moment they run, not at cold-start/import time for every
// route that happens to import from lib/messaging.
let client: ReturnType<typeof Twilio> | undefined;

export function getTwilioClient() {
  if (!client) {
    client = Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  }
  return client;
}

// Twilio's WhatsApp channel addresses use a "whatsapp:" scheme prefix on top
// of the E.164 number (docs/PRD.md's phone_number is already E.164 — see the
// signup validation in lib/auth/actions.ts).
export function toWhatsAppAddress(e164PhoneNumber: string) {
  return `whatsapp:${e164PhoneNumber}`;
}

// Inverse of toWhatsAppAddress — inbound webhook "From"/"To" fields arrive
// as "whatsapp:+9665...".
export function fromWhatsAppAddress(address: string) {
  return address.replace(/^whatsapp:/, "");
}
