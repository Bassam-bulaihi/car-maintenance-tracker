import "server-only";

// Thin Telegram Bot API client (https://core.telegram.org/bots/api). Every
// call is a JSON POST to /bot<token>/<method>; the response is
// { ok, result } or { ok: false, error_code, description, parameters }.
//
// TELEGRAM_API_BASE exists for the integration tests, which point it at a
// local mock Bot API that records calls instead of delivering them.

export class TelegramApiError extends Error {
  constructor(
    readonly method: string,
    readonly errorCode: number,
    readonly description: string,
  ) {
    super(`Telegram ${method} failed (${errorCode}): ${description}`);
    this.name = "TelegramApiError";
  }

  /** The user blocked the bot, deleted their account, or the chat is gone. */
  get isUnreachableChat() {
    return this.errorCode === 403 || (this.errorCode === 400 && /chat not found/i.test(this.description));
  }
}

type TelegramResponse<T> =
  | { ok: true; result: T }
  | { ok: false; error_code: number; description: string; parameters?: { retry_after?: number } };

const MAX_ATTEMPTS = 3;

function apiBase() {
  return (process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org").replace(/\/+$/, "");
}

/**
 * Calls one Bot API method. Rate limits (429, honouring retry_after) and
 * transient 5xx/network failures are retried with backoff; anything else is
 * thrown as a TelegramApiError for the caller to log against the
 * notification (PRD §7.2: failed sends are retried with backoff and logged).
 */
export async function telegram<T = unknown>(method: string, params: Record<string, unknown>): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let body: TelegramResponse<T>;
    try {
      const response = await fetch(`${apiBase()}/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      body = (await response.json()) as TelegramResponse<T>;
    } catch (error) {
      lastError = error;
      await sleep(backoffMs(attempt));
      continue;
    }

    if (body.ok) return body.result;

    lastError = new TelegramApiError(method, body.error_code, body.description);
    const retryable = body.error_code === 429 || body.error_code >= 500;
    if (!retryable || attempt === MAX_ATTEMPTS) break;
    const retryAfterSeconds = body.parameters?.retry_after;
    await sleep(retryAfterSeconds ? retryAfterSeconds * 1000 : backoffMs(attempt));
  }

  throw lastError;
}

function backoffMs(attempt: number) {
  return 250 * 2 ** (attempt - 1);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- The subset of Bot API types this app reads -------------------------

export type TelegramUser = { id: number; is_bot: boolean; first_name: string; language_code?: string };
export type TelegramChat = { id: number; type: string };

export type TelegramMessage = {
  message_id: number;
  chat: TelegramChat;
  from?: TelegramUser;
  date: number;
  text?: string;
  reply_to_message?: { message_id: number };
};

export type TelegramCallbackQuery = {
  id: string;
  from: TelegramUser;
  message?: { message_id: number; chat: TelegramChat };
  data?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

export type InlineKeyboardMarkup = {
  inline_keyboard: { text: string; callback_data?: string; url?: string }[][];
};

export type ForceReplyMarkup = { force_reply: true; input_field_placeholder?: string };

export function sendMessage(
  chatId: number,
  text: string,
  replyMarkup?: InlineKeyboardMarkup | ForceReplyMarkup,
) {
  return telegram<TelegramMessage>("sendMessage", {
    chat_id: chatId,
    text,
    link_preview_options: { is_disabled: true },
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}
