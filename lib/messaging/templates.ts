import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";
import type { ForceReplyMarkup, InlineKeyboardMarkup } from "@/lib/messaging/telegram-client";

export type OutboundMessageType = "odometer_request" | "service_due" | "re_reminder";
export type BotCopyKey = keyof (typeof dictionaries)["en"]["telegramBot"];

// Inline-button payloads (callback_data, max 64 bytes): "<action>:<notification id>".
export const CALLBACK_DONE = "done";
export const CALLBACK_NOT_DONE = "notdone";
// On an odometer confirmation prompt: "yes, that reading is right" / "re-enter".
export const CALLBACK_CONFIRM_READING = "okread";
export const CALLBACK_REENTER_READING = "reread";

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** One line of bot copy in the user's language (lib/i18n/dictionaries.ts → telegramBot). */
export function botText(locale: Locale, key: BotCopyKey, values: Record<string, string | number> = {}) {
  return fill(dictionaries[locale].telegramBot[key], values);
}

export type OutboundMessage = {
  text: string;
  replyMarkup: InlineKeyboardMarkup | ForceReplyMarkup;
};

/**
 * A business-initiated message. Telegram has no template approval step, so
 * the copy lives with the rest of the translations:
 *
 * - odometer_request uses force_reply, so the user's answer arrives as a
 *   reply to this exact message — which is how a number is tied to the right
 *   vehicle when one user owns several.
 * - service_due / re_reminder carry inline Done / Not done buttons (PRD §7.2:
 *   tappable buttons, not a free-text prompt) whose payload names the
 *   notification being answered.
 */
export function buildOutboundMessage(
  messageType: OutboundMessageType,
  locale: Locale,
  values: { notificationId: string; vehicle: string; link: string; service?: string },
): OutboundMessage {
  const t = dictionaries[locale].telegramBot;

  if (messageType === "odometer_request") {
    return {
      text: fill(t.odometerRequest, { vehicle: values.vehicle, link: values.link }),
      replyMarkup: { force_reply: true, input_field_placeholder: t.odometerPlaceholder },
    };
  }

  const copy = messageType === "re_reminder" ? t.serviceDueReminder : t.serviceDue;
  return {
    text: fill(copy, { vehicle: values.vehicle, service: values.service ?? "", link: values.link }),
    replyMarkup: {
      inline_keyboard: [
        [
          { text: t.doneButton, callback_data: `${CALLBACK_DONE}:${values.notificationId}` },
          { text: t.notDoneButton, callback_data: `${CALLBACK_NOT_DONE}:${values.notificationId}` },
        ],
      ],
    },
  };
}

/** "Is this big jump right?" — sent instead of rejecting a reading above the allowance. */
export function buildReadingConfirmation(
  locale: Locale,
  notificationId: string,
  values: { reading: string; jump: string; current: string; date: string },
): OutboundMessage {
  const t = dictionaries[locale].telegramBot;
  return {
    text: fill(t.odometerConfirm, values),
    replyMarkup: {
      inline_keyboard: [
        [
          { text: t.confirmYesButton, callback_data: `${CALLBACK_CONFIRM_READING}:${notificationId}` },
          { text: t.confirmNoButton, callback_data: `${CALLBACK_REENTER_READING}:${notificationId}` },
        ],
      ],
    },
  };
}
