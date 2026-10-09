import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import {
  sendMessage,
  telegram,
  type TelegramCallbackQuery,
  type TelegramMessage,
  type TelegramUpdate,
} from "@/lib/messaging/telegram-client";
import { botText, CALLBACK_DONE, CALLBACK_NOT_DONE } from "@/lib/messaging/templates";
import { parseConfirmation, parseOdometer, parseReply } from "@/lib/messaging/reply-parser";
import { consumeLinkToken } from "@/lib/messaging/linking";
import { notifyDueServices } from "@/lib/messaging/due-services";
import { vehicleLabel } from "@/lib/messaging/send";
import { recordOdometerReading, validateOdometerReading, type OdometerError } from "@/lib/dashboard/odometer";
import { closeServiceReminders, markServiceDone } from "@/lib/dashboard/service-confirmation";
import { computeServiceStatus } from "@/lib/dashboard/service-status";
import { serviceTypeLabel, type ServiceType } from "@/lib/admin/service-types";
import {
  appBaseUrl,
  MAX_REPLY_ATTEMPTS,
  ODOMETER_MAX_JUMP_KM,
  SERVICE_DUE_REMINDER_INTERVAL_DAYS,
  vehiclePageUrl,
} from "@/lib/config";
import type { Database } from "@/lib/supabase/database.types";
import type { Locale } from "@/lib/i18n/dictionaries";

type ServiceClient = ReturnType<typeof createServiceClient>;
type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type LinkedUser = { id: string; name: string; language: Locale; telegram_chat_id: number };

const SERVICE_TYPES_SENT = ["service_due", "re_reminder"] as const;

/**
 * Processes one verified Telegram update (the webhook has already checked
 * the secret-token header). Covers every inbound path:
 *
 * - /start <token>     link this chat to the account that issued the token
 * - /start, /help      help (linked) or how-to-link (unlinked)
 * - button tap         Done / Not done on a service reminder
 * - reply / free text  an odometer number or a typed "تم / لم يتم"
 *
 * A reply is only ever applied to a notification we sent to this chat:
 * an odometer number with no open request is refused (PRD §5.3), and
 * anything that can't be parsed or fails validation gets a clarification and
 * writes nothing but the thread's attempt counter (PRD §7.5).
 */
export async function handleTelegramUpdate(update: TelegramUpdate) {
  const supabase = createServiceClient();

  // PRD §7.3: deliveries aren't guaranteed unique — process each update_id once.
  const { error: dedupeError } = await supabase
    .from("inbound_message_events")
    .insert({ event_id: String(update.update_id) });
  if (dedupeError) return;

  if (update.callback_query) {
    await handleCallback(supabase, update.callback_query);
  } else if (update.message?.text && update.message.chat.type === "private") {
    await handleMessage(supabase, update.message);
  }
}

// ---------------------------------------------------------------------------
// Text messages
// ---------------------------------------------------------------------------

async function handleMessage(supabase: ServiceClient, message: TelegramMessage) {
  const chatId = message.chat.id;
  const text = message.text!.trim();
  const fallbackLocale: Locale = message.from?.language_code?.startsWith("en") ? "en" : "ar";

  const command = text.match(/^\/(\w+)(?:@\w+)?(?:\s+(.+))?$/);
  if (command?.[1] === "start" && command[2]) {
    const linked = await consumeLinkToken(supabase, command[2].trim(), chatId);
    if (linked) {
      await reply(chatId, botText(linked.language as Locale, "linked", { name: linked.name }));
    } else {
      await reply(chatId, botText(fallbackLocale, "linkInvalid", { link: accountUrl() }));
    }
    return;
  }

  const user = await findLinkedUser(supabase, chatId);
  if (!user) {
    await reply(chatId, botText(fallbackLocale, "notLinked", { link: accountUrl() }));
    return;
  }

  if (command) {
    await reply(chatId, botText(user.language, "help", { link: dashboardUrl() }));
    return;
  }

  // 1. A direct reply to one of our messages answers exactly that one.
  if (message.reply_to_message) {
    const target = await findNotificationByMessage(supabase, chatId, message.reply_to_message.message_id);
    if (target && (await ownsVehicle(supabase, user.id, target.vehicle_id))) {
      if (target.message_type === "odometer_request") {
        await answerOdometerRequest(supabase, user, target, text);
      } else {
        const value = parseConfirmation(text);
        if (value) {
          await answerServiceReminder(supabase, user, target, value);
        } else {
          await reply(chatId, botText(user.language, "confirmationUnclear"));
        }
      }
      return;
    }
  }

  // 2. Otherwise route by what the text looks like, against this user's
  //    open threads.
  const parsed = parseReply(text);
  const openRequests = await openOdometerRequests(supabase, user.id);
  const openReminders = await openServiceReminders(supabase, user.id);

  if (parsed.kind === "confirmation") {
    if (openReminders.length === 1) {
      await answerServiceReminder(supabase, user, openReminders[0], parsed.value);
    } else if (openReminders.length > 1) {
      await reply(chatId, botText(user.language, "confirmationAmbiguous"));
    } else {
      await reply(chatId, botText(user.language, "help", { link: dashboardUrl() }));
    }
    return;
  }

  if (openRequests.length === 1) {
    await answerOdometerRequest(supabase, user, openRequests[0], text);
  } else if (openRequests.length > 1) {
    await reply(chatId, botText(user.language, "odometerAmbiguous"));
  } else if (parsed.kind === "odometer") {
    // PRD §5.3: an unprompted reading is not accepted over the chat.
    await reply(chatId, botText(user.language, "noOpenRequest", { link: dashboardUrl() }));
  } else if (openReminders.length > 0) {
    await reply(chatId, botText(user.language, "confirmationUnclear"));
  } else {
    await reply(chatId, botText(user.language, "help", { link: dashboardUrl() }));
  }
}

const ODOMETER_ERROR_COPY: Record<OdometerError, "odometerInvalid" | "odometerTooLow" | "odometerImplausible"> = {
  invalid: "odometerInvalid",
  tooLow: "odometerTooLow",
  implausible: "odometerImplausible",
};

async function answerOdometerRequest(
  supabase: ServiceClient,
  user: LinkedUser,
  notification: Notification,
  text: string,
) {
  const chatId = user.telegram_chat_id;
  const nf = numberFormat(user.language);

  if (notification.responded_at) {
    await reply(chatId, botText(user.language, "alreadyAnswered"));
    return;
  }

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, make, model, current_odometer")
    .eq("id", notification.vehicle_id)
    .single();
  if (!vehicle) return;

  const reading = parseOdometer(text);
  const error = validateOdometerReading(vehicle.current_odometer, reading);

  if (error) {
    // Nothing is written except the thread's attempt counter; past the limit
    // the thread stays open but is flagged and the bot stops re-asking.
    const attempts = notification.reply_attempts + 1;
    const flagged = attempts >= MAX_REPLY_ATTEMPTS;
    await supabase
      .from("notifications")
      .update({ reply_attempts: attempts, needs_follow_up: flagged, response_text: text.slice(0, 200) })
      .eq("id", notification.id);

    if (flagged) {
      await reply(chatId, botText(user.language, "tooManyAttempts", { link: vehiclePageUrl(vehicle.id) }));
    } else {
      await reply(
        chatId,
        botText(user.language, ODOMETER_ERROR_COPY[error], {
          current: nf.format(vehicle.current_odometer),
          max: nf.format(ODOMETER_MAX_JUMP_KM),
        }),
      );
    }
    return;
  }

  await recordOdometerReading(supabase, vehicle.id, reading!, "telegram");
  await reply(
    chatId,
    botText(user.language, "odometerSaved", { reading: nf.format(reading!), vehicle: vehicleLabel(vehicle) }),
  );

  // PRD §5.4: a new reading is evaluated immediately, not at the next sweep.
  await notifyDueServices(supabase, { vehicleId: vehicle.id });
}

// ---------------------------------------------------------------------------
// Service reminders (buttons and typed confirmations share this)
// ---------------------------------------------------------------------------

type AnswerOutcome = "done" | "not_done" | "already_answered";

async function answerServiceReminder(
  supabase: ServiceClient,
  user: LinkedUser,
  notification: Notification,
  value: "done" | "not_done",
): Promise<AnswerOutcome> {
  const chatId = user.telegram_chat_id;

  const { data: item } = notification.service_item_id
    ? await supabase
        .from("vehicle_service_items")
        .select(
          "id, service_type, interval_km, interval_months, last_service_odometer, last_service_date, vehicles!inner(id, user_id, make, model, current_odometer)",
        )
        .eq("id", notification.service_item_id)
        .single()
    : { data: null };

  const stillDue = item ? computeServiceStatus(item, item.vehicles.current_odometer) === "due" : false;
  const alreadyAnswered =
    !item ||
    item.vehicles.user_id !== user.id ||
    notification.response === "done" ||
    !stillDue ||
    (value === "not_done" && notification.response === "not_done");

  if (alreadyAnswered) {
    await reply(chatId, botText(user.language, "alreadyAnswered"));
    return "already_answered";
  }

  const service = serviceTypeLabel(item.service_type, user.language);

  if (value === "done") {
    await markServiceDone(
      supabase,
      item.vehicles.id,
      item.id,
      item.service_type as ServiceType,
      item.vehicles.current_odometer,
    );
    await closeServiceReminders(supabase, item.id, "done");
    await reply(
      chatId,
      botText(user.language, "serviceDoneRecorded", {
        service,
        vehicle: vehicleLabel(item.vehicles),
        odometer: numberFormat(user.language).format(item.vehicles.current_odometer),
      }),
    );
    return "done";
  }

  // Not done: the item stays due and the per-item re-reminder clock keeps
  // running (lib/messaging/due-services.ts).
  await supabase
    .from("notifications")
    .update({ response: "not_done", responded_at: new Date().toISOString() })
    .eq("id", notification.id);
  await reply(
    chatId,
    botText(user.language, "serviceNotDoneRecorded", {
      service,
      days: numberFormat(user.language).format(SERVICE_DUE_REMINDER_INTERVAL_DAYS),
    }),
  );
  return "not_done";
}

async function handleCallback(supabase: ServiceClient, query: TelegramCallbackQuery) {
  const [action, notificationId] = (query.data ?? "").split(":");
  const chatId = query.message?.chat.id;
  const value = action === CALLBACK_DONE ? "done" : action === CALLBACK_NOT_DONE ? "not_done" : null;

  const user = chatId ? await findLinkedUser(supabase, chatId) : null;
  const { data: notification } =
    value && notificationId && chatId
      ? await supabase
          .from("notifications")
          .select("*")
          .eq("id", notificationId)
          .eq("chat_id", chatId)
          .in("message_type", SERVICE_TYPES_SENT)
          .maybeSingle()
      : { data: null };

  if (!user || !notification || !value) {
    // Always answer the callback so the client stops its loading spinner.
    await telegram("answerCallbackQuery", { callback_query_id: query.id });
    if (chatId && !user) {
      const locale: Locale = query.from.language_code?.startsWith("en") ? "en" : "ar";
      await reply(chatId, botText(locale, "notLinked", { link: accountUrl() }));
    }
    return;
  }

  const outcome = await answerServiceReminder(supabase, user, notification, value);
  const t = (key: "doneAck" | "notDoneAck" | "alreadyAnswered") => botText(user.language, key);

  await telegram("answerCallbackQuery", {
    callback_query_id: query.id,
    text: outcome === "done" ? t("doneAck") : outcome === "not_done" ? t("notDoneAck") : t("alreadyAnswered"),
  });

  // A resolved reminder loses its buttons; "Not done" keeps them so the user
  // can still tap Done on the same message later.
  if (outcome !== "not_done" && query.message) {
    await telegram("editMessageReplyMarkup", {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      reply_markup: { inline_keyboard: [] },
    }).catch(() => {
      // Telegram refuses edits that change nothing (buttons already gone).
    });
  }
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

async function findLinkedUser(supabase: ServiceClient, chatId: number): Promise<LinkedUser | null> {
  const { data } = await supabase
    .from("users")
    .select("id, name, language, telegram_chat_id")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();
  if (!data || data.telegram_chat_id === null) return null;
  return { ...data, language: data.language as Locale, telegram_chat_id: data.telegram_chat_id };
}

async function findNotificationByMessage(supabase: ServiceClient, chatId: number, messageId: number) {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("chat_id", chatId)
    .eq("provider_message_id", String(messageId))
    .maybeSingle();
  return data;
}

async function ownsVehicle(supabase: ServiceClient, userId: string, vehicleId: string) {
  const { data } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

async function userVehicleIds(supabase: ServiceClient, userId: string) {
  const { data } = await supabase.from("vehicles").select("id").eq("user_id", userId);
  return (data ?? []).map((v) => v.id);
}

/** Unanswered odometer requests, newest first, at most one per vehicle. */
async function openOdometerRequests(supabase: ServiceClient, userId: string) {
  const vehicleIds = await userVehicleIds(supabase, userId);
  if (vehicleIds.length === 0) return [];
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .in("vehicle_id", vehicleIds)
    .eq("message_type", "odometer_request")
    .eq("delivery_status", "sent")
    .is("responded_at", null)
    .order("sent_at", { ascending: false });
  return latestPer(data ?? [], (n) => n.vehicle_id);
}

/**
 * Service reminders still waiting on the user — unanswered, or answered "Not
 * done" (still due) — newest first, at most one per service item.
 */
async function openServiceReminders(supabase: ServiceClient, userId: string) {
  const vehicleIds = await userVehicleIds(supabase, userId);
  if (vehicleIds.length === 0) return [];
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .in("vehicle_id", vehicleIds)
    .in("message_type", SERVICE_TYPES_SENT)
    .eq("delivery_status", "sent")
    .or("responded_at.is.null,response.eq.not_done")
    .order("sent_at", { ascending: false });
  return latestPer(data ?? [], (n) => n.service_item_id ?? n.id);
}

function latestPer<T>(rows: T[], key: (row: T) => string) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const k = key(row);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------------------------------------------------------------------------

async function reply(chatId: number, text: string) {
  await sendMessage(chatId, text);
}

function numberFormat(locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
}

function dashboardUrl() {
  return `${appBaseUrl()}/dashboard`;
}

function accountUrl() {
  return `${appBaseUrl()}/dashboard/account`;
}
