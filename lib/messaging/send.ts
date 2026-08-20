import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { getTwilioClient, toWhatsAppAddress } from "@/lib/messaging/twilio-client";
import { getContentSid, odometerRequestVariables, serviceDueVariables } from "@/lib/messaging/templates";
import { serviceTypeLabel, type ServiceType } from "@/lib/admin/service-types";
import { vehicleDeepLink } from "@/lib/config";

type ServiceClient = SupabaseClient<Database>;

type NotifiableUser = { phone_number: string; language: Locale };
type NotifiableVehicle = { id: string; make: string; model: string };

function vehicleLabel(vehicle: NotifiableVehicle) {
  return `${vehicle.make} ${vehicle.model}`;
}

/**
 * Sends the "what's your odometer now?" template and logs it. A
 * `notifications` row is inserted up front (delivery_status "pending") so
 * there's always a record even if the Twilio call throws, then updated with
 * the provider SID once the send succeeds — this is also what the
 * odometer-request cron reads to avoid re-asking within the same window.
 */
export async function sendOdometerRequest(
  supabase: ServiceClient,
  vehicle: NotifiableVehicle,
  user: NotifiableUser,
) {
  const { data: notification, error: insertError } = await supabase
    .from("notifications")
    .insert({ vehicle_id: vehicle.id, message_type: "odometer_request", delivery_status: "pending" })
    .select("id")
    .single();
  if (insertError || !notification) throw insertError ?? new Error("failed to log notification");

  try {
    const message = await getTwilioClient().messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: toWhatsAppAddress(user.phone_number),
      contentSid: getContentSid("odometer_request", user.language),
      contentVariables: odometerRequestVariables(
        vehicleLabel(vehicle),
        vehicleDeepLink(vehicle.id),
      ),
    });

    await supabase
      .from("notifications")
      .update({ provider_message_sid: message.sid, delivery_status: "sent", sent_at: new Date().toISOString() })
      .eq("id", notification.id);
  } catch (error) {
    await supabase.from("notifications").update({ delivery_status: "failed" }).eq("id", notification.id);
    throw error;
  }

  return notification.id;
}

/**
 * Sends a "<service> is due" notification carrying a deep link to that
 * vehicle's page, and logs it. WhatsApp is send-only in the current build,
 * so this is a one-way push — the user confirms the work on the website,
 * not by replying (see docs/unresolved.md). `messageType` distinguishes the
 * first ask ("service_due") from a later chase on the same item
 * ("re_reminder") — both use the same template/copy, PRD §5.5 only requires
 * the *cadence* to differ, which the caller (cron) controls.
 */
export async function sendServiceDueNotification(
  supabase: ServiceClient,
  vehicle: NotifiableVehicle,
  user: NotifiableUser,
  serviceItem: { id: string; service_type: ServiceType },
  messageType: "service_due" | "re_reminder" = "service_due",
) {
  const { data: notification, error: insertError } = await supabase
    .from("notifications")
    .insert({
      vehicle_id: vehicle.id,
      service_item_id: serviceItem.id,
      message_type: messageType,
      delivery_status: "pending",
    })
    .select("id")
    .single();
  if (insertError || !notification) throw insertError ?? new Error("failed to log notification");

  try {
    const message = await getTwilioClient().messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: toWhatsAppAddress(user.phone_number),
      contentSid: getContentSid("service_due", user.language),
      contentVariables: serviceDueVariables(
        vehicleLabel(vehicle),
        serviceTypeLabel(serviceItem.service_type, user.language),
        vehicleDeepLink(vehicle.id),
      ),
    });

    await supabase
      .from("notifications")
      .update({ provider_message_sid: message.sid, delivery_status: "sent", sent_at: new Date().toISOString() })
      .eq("id", notification.id);
  } catch (error) {
    await supabase.from("notifications").update({ delivery_status: "failed" }).eq("id", notification.id);
    throw error;
  }

  return notification.id;
}
