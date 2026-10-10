import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { vehicleName } from "@/lib/i18n/vehicle-names";
import { sendMessage, TelegramApiError } from "@/lib/messaging/telegram-client";
import { buildOutboundMessage, type OutboundMessageType } from "@/lib/messaging/templates";
import { vehiclePageUrl } from "@/lib/config";
import { serviceTypeLabel, type ServiceType } from "@/lib/admin/service-types";

type ServiceClient = SupabaseClient<Database>;

/** A user the bot can reach: their profile has a linked Telegram chat. */
export type NotifiableUser = { id: string; telegram_chat_id: number; language: Locale };
type NotifiableVehicle = { id: string; make: string; model: string; recommendedOil?: string | null };

/** The car as named in the user's language ("تويوتا كامري" / "Toyota Camry"). */
export function vehicleLabel(vehicle: { make: string; model: string }, locale: Locale) {
  return vehicleName(vehicle, locale);
}

/**
 * One send + its log row. The `notifications` row is inserted first
 * (delivery_status "pending") because its id goes into the message's button
 * payload, and so a record exists even if the send fails. On success it
 * stores the chat + Telegram message id — what an inbound reply is matched
 * against — and sent_at, which the schedulers read to respect cadence.
 *
 * A chat that can no longer be reached (user blocked the bot or deleted the
 * chat) is unlinked from the profile so the schedulers stop trying it.
 */
async function sendNotification(
  supabase: ServiceClient,
  vehicle: NotifiableVehicle,
  user: NotifiableUser,
  messageType: OutboundMessageType,
  serviceItem?: { id: string; service_type: ServiceType },
) {
  const { data: notification, error: insertError } = await supabase
    .from("notifications")
    .insert({
      vehicle_id: vehicle.id,
      service_item_id: serviceItem?.id ?? null,
      message_type: messageType,
      delivery_status: "pending",
      chat_id: user.telegram_chat_id,
    })
    .select("id")
    .single();
  if (insertError || !notification) throw insertError ?? new Error("failed to log notification");

  try {
    const outbound = buildOutboundMessage(messageType, user.language, {
      notificationId: notification.id,
      vehicle: vehicleLabel(vehicle, user.language),
      link: vehiclePageUrl(vehicle.id),
      service: serviceItem ? serviceTypeLabel(serviceItem.service_type, user.language) : undefined,
      oil:
        serviceItem && (serviceItem.service_type === "engine_oil" || serviceItem.service_type === "oil_filter")
          ? vehicle.recommendedOil
          : null,
    });

    const message = await sendMessage(user.telegram_chat_id, outbound.text, outbound.replyMarkup);

    await supabase
      .from("notifications")
      .update({
        provider_message_id: String(message.message_id),
        delivery_status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", notification.id);
  } catch (error) {
    await supabase.from("notifications").update({ delivery_status: "failed" }).eq("id", notification.id);
    if (error instanceof TelegramApiError && error.isUnreachableChat) {
      await supabase
        .from("users")
        .update({ telegram_chat_id: null, telegram_linked_at: null })
        .eq("id", user.id);
    }
    throw error;
  }

  return notification.id;
}

/** "What's your odometer now?" — answered by replying with a number. */
export async function sendOdometerRequest(
  supabase: ServiceClient,
  vehicle: NotifiableVehicle,
  user: NotifiableUser,
) {
  return sendNotification(supabase, vehicle, user, "odometer_request");
}

/**
 * "<service> is due — done?" with Done / Not done buttons. `messageType`
 * distinguishes the first ask ("service_due") from a later chase on the same
 * item ("re_reminder"); the caller controls the cadence (PRD §5.5).
 */
export async function sendServiceDueNotification(
  supabase: ServiceClient,
  vehicle: NotifiableVehicle,
  user: NotifiableUser,
  serviceItem: { id: string; service_type: ServiceType },
  messageType: "service_due" | "re_reminder" = "service_due",
) {
  return sendNotification(supabase, vehicle, user, messageType, serviceItem);
}
