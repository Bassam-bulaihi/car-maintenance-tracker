import { createServiceClient } from "@/lib/supabase/service";
import { fromWhatsAppAddress } from "@/lib/messaging/twilio-client";
import { parseInboundReply } from "@/lib/messaging/reply-parser";
import { dashboardDeepLink, vehicleDeepLink } from "@/lib/config";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";

export type InboundWebhookFields = {
  MessageSid: string;
  From: string;
  Body?: string;
  ButtonText?: string;
  ButtonPayload?: string;
};

/** `null` means "say nothing" (a duplicate delivery we've already seen). */
export type InboundResult = { reply: string | null };

/**
 * Handles one verified inbound WhatsApp message.
 *
 * WhatsApp is **send-only** in the current build: notifications go out, but
 * nothing the user sends back is written to the database. Two-way replies
 * (odometer numbers, تم/لم يتم confirmations) are deferred — see
 * docs/unresolved.md. So this endpoint's whole job is to answer politely
 * and hand the user a deep link to the exact page where they can do the
 * update themselves.
 *
 * It still dedupes on MessageSid (PRD §7.3 — payloads aren't guaranteed
 * unique) so a retried delivery doesn't produce a second reply.
 *
 * Called only after the webhook route has verified the Twilio signature;
 * this function trusts its input.
 */
export async function handleInboundMessage(fields: InboundWebhookFields): Promise<InboundResult> {
  const supabase = createServiceClient();

  const { error: dedupeError } = await supabase
    .from("inbound_message_events")
    .insert({ message_sid: fields.MessageSid });
  if (dedupeError) {
    // Unique violation = we've already answered this MessageSid.
    return { reply: null };
  }

  const fromNumber = fromWhatsAppAddress(fields.From);
  const { data: user } = await supabase
    .from("users")
    .select("id, language")
    .eq("phone_number", fromNumber)
    .maybeSingle();

  const t = dictionaries[(user?.language ?? "ar") as Locale].whatsappBot;

  // Unknown number — no account to link them to anything specific.
  if (!user) {
    return { reply: `${t.help} ${dashboardDeepLink()}` };
  }

  const link = await deepLinkForUser(supabase, user.id);

  // A message that parses as a real reply attempt ("25000", "تم", "Done")
  // means the user is trying to act on a reminder — tell them plainly that
  // updates happen on the site. Anything else gets the generic help line.
  // Both end with the same link; only the wording differs.
  const parsed = parseInboundReply(fields);
  const lead = parsed.kind === "unparseable" ? t.help : t.webOnly;

  return { reply: `${lead} ${link}` };
}

/**
 * Best link we can offer this user: the vehicle from their most recent
 * notification (almost always the one they're replying about), falling back
 * to their single vehicle, then to the dashboard.
 */
async function deepLinkForUser(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
) {
  const { data: vehicleRows } = await supabase.from("vehicles").select("id").eq("user_id", userId);
  const vehicleIds = (vehicleRows ?? []).map((v) => v.id);

  if (vehicleIds.length === 0) return dashboardDeepLink();
  if (vehicleIds.length === 1) return vehicleDeepLink(vehicleIds[0]);

  const { data: latest } = await supabase
    .from("notifications")
    .select("vehicle_id")
    .in("vehicle_id", vehicleIds)
    .not("sent_at", "is", null)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return latest ? vehicleDeepLink(latest.vehicle_id) : dashboardDeepLink();
}
