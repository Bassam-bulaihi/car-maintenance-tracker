import { createServiceClient } from "@/lib/supabase/service";
import { fromWhatsAppAddress } from "@/lib/messaging/twilio-client";
import { parseInboundReply } from "@/lib/messaging/reply-parser";
import { markServiceDone } from "@/lib/dashboard/service-confirmation";
import { evaluateDueServicesForVehicle } from "@/lib/dashboard/due-service-check";
import { ODOMETER_MAX_JUMP_KM } from "@/lib/config";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";
import type { ServiceType } from "@/lib/admin/service-types";

export type InboundWebhookFields = {
  MessageSid: string;
  From: string;
  Body?: string;
  ButtonText?: string;
  ButtonPayload?: string;
};

/** `null` means "say nothing" (dedupe, or a resolved confirmation). */
export type InboundResult = { reply: string | null };

/**
 * Handles one verified inbound WhatsApp message end to end: dedupe, match it
 * to the open notification it's replying to, apply the effect (odometer
 * reading or service confirmation), and decide what — if anything — to
 * reply. Called only after the webhook route has verified the Twilio
 * signature; this function trusts its input.
 */
export async function handleInboundMessage(fields: InboundWebhookFields): Promise<InboundResult> {
  const supabase = createServiceClient();

  // PRD §7.3: payloads aren't guaranteed unique — a duplicate delivery of an
  // already-seen MessageSid is processed only once, silently.
  const { error: dedupeError } = await supabase
    .from("inbound_message_events")
    .insert({ message_sid: fields.MessageSid });
  if (dedupeError) {
    // Unique violation = we've already handled this MessageSid.
    return { reply: null };
  }

  const fromNumber = fromWhatsAppAddress(fields.From);
  const { data: user } = await supabase
    .from("users")
    .select("id, language, phone_number")
    .eq("phone_number", fromNumber)
    .maybeSingle();

  const t = dictionaries[(user?.language ?? "ar") as Locale].whatsappBot;

  if (!user) {
    return { reply: t.help };
  }

  const { data: vehicleRows } = await supabase.from("vehicles").select("id").eq("user_id", user.id);
  const vehicleIds = (vehicleRows ?? []).map((v) => v.id);
  if (vehicleIds.length === 0) {
    return { reply: t.help };
  }

  const parsed = parseInboundReply(fields);

  if (parsed.kind === "unparseable") {
    return { reply: t.clarification };
  }

  if (parsed.kind === "odometer") {
    return handleOdometerReply(supabase, vehicleIds, parsed.value, user.language as Locale, t);
  }

  return handleConfirmationReply(supabase, vehicleIds, parsed.value, t);
}

async function findOpenNotification(
  supabase: ReturnType<typeof createServiceClient>,
  vehicleIds: string[],
  messageTypes: ("odometer_request" | "service_due" | "re_reminder")[],
) {
  const { data } = await supabase
    .from("notifications")
    .select("id, vehicle_id, service_item_id, message_type")
    .in("vehicle_id", vehicleIds)
    .in("message_type", messageTypes)
    .is("response", null)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

async function handleOdometerReply(
  supabase: ReturnType<typeof createServiceClient>,
  vehicleIds: string[],
  reading: number,
  locale: Locale,
  t: (typeof dictionaries)[Locale]["whatsappBot"],
) {
  const notification = await findOpenNotification(supabase, vehicleIds, ["odometer_request"]);
  // PRD §5.3: a WhatsApp odometer reading is only accepted as a reply to a
  // notification we sent — never as a spontaneous message.
  if (!notification) {
    return { reply: t.help };
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, current_odometer")
    .eq("id", notification.vehicle_id)
    .single();
  if (!vehicle) {
    return { reply: t.help };
  }

  const dashboardErrors = dictionaries[locale].dashboard.errors;
  if (reading < vehicle.current_odometer) {
    return { reply: dashboardErrors.odometerTooLow };
  }
  if (reading - vehicle.current_odometer > ODOMETER_MAX_JUMP_KM) {
    return { reply: dashboardErrors.odometerImplausible };
  }

  const { error: insertError } = await supabase.from("odometer_readings").insert({
    vehicle_id: vehicle.id,
    reading_km: reading,
    source: "whatsapp",
  });
  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({ current_odometer: reading, odometer_updated_at: new Date().toISOString() })
    .eq("id", vehicle.id);
  if (updateError) throw updateError;

  // The response enum only has done/not_done/invalid — an odometer reply
  // isn't really either, but "done" (= "request answered") is the closer of
  // the two and keeps the enum from growing a one-off case for this.
  await supabase
    .from("notifications")
    .update({ response: "done", response_text: String(reading), responded_at: new Date().toISOString() })
    .eq("id", notification.id);

  await evaluateDueServicesForVehicle(supabase, vehicle.id);

  return { reply: null };
}

async function handleConfirmationReply(
  supabase: ReturnType<typeof createServiceClient>,
  vehicleIds: string[],
  value: "done" | "not_done",
  t: (typeof dictionaries)[Locale]["whatsappBot"],
) {
  const notification = await findOpenNotification(supabase, vehicleIds, ["service_due", "re_reminder"]);
  if (!notification || !notification.service_item_id) {
    return { reply: t.help };
  }

  if (value === "done") {
    const { data: serviceItem } = await supabase
      .from("vehicle_service_items")
      .select("service_type")
      .eq("id", notification.service_item_id)
      .single();
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("current_odometer")
      .eq("id", notification.vehicle_id)
      .single();

    if (!serviceItem || !vehicle) {
      return { reply: t.help };
    }

    await markServiceDone(
      supabase,
      notification.vehicle_id,
      notification.service_item_id,
      serviceItem.service_type as ServiceType,
      vehicle.current_odometer,
    );
  }
  // "not_done": leave the service item due — PRD §5.5 re-reminders chase it
  // independently on the next scheduler pass.

  await supabase
    .from("notifications")
    .update({ response: value, response_text: value, responded_at: new Date().toISOString() })
    .eq("id", notification.id);

  return { reply: null };
}
