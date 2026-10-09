import { timingSafeEqual } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { handleTelegramUpdate } from "@/lib/messaging/inbound";
import type { TelegramUpdate } from "@/lib/messaging/telegram-client";

// Telegram's single webhook (registered with setWebhook — see
// scripts/telegram-set-webhook.mjs). Telegram sends the secret_token given
// at registration in X-Telegram-Bot-Api-Secret-Token on every request;
// anything without the exact secret is rejected (PRD §7.3's signed-webhook
// requirement, Telegram's mechanism).
//
// The update is acknowledged with 200 straight away and processed in
// after(), so a slow database or Bot API call never makes Telegram time out
// and redeliver (PRD §7.3). Redeliveries that do happen are dropped by the
// update_id dedupe in handleTelegramUpdate.
export async function POST(request: NextRequest) {
  if (!hasValidSecret(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }
  if (typeof update?.update_id !== "number") {
    return new NextResponse("Bad request", { status: 400 });
  }

  after(async () => {
    try {
      await handleTelegramUpdate(update);
    } catch (error) {
      console.error("telegram webhook: failed to process update", update.update_id, error);
    }
  });

  return new NextResponse(null, { status: 200 });
}

function hasValidSecret(received: string | null) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
