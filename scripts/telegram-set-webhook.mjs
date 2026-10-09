// Registers the deployed webhook with Telegram (run once per environment,
// and again whenever the URL or secret changes):
//
//   node scripts/telegram-set-webhook.mjs https://<app>/api/telegram/webhook
//
// Telegram then sends TELEGRAM_WEBHOOK_SECRET in the
// X-Telegram-Bot-Api-Secret-Token header of every update, which the route
// checks. Also publishes the bot's /start and /help commands.
import { loadEnvLocal, requireEnv } from "./env.mjs";

const url = process.argv[2];
if (!url?.startsWith("https://")) {
  console.error("Usage: node scripts/telegram-set-webhook.mjs https://<host>/api/telegram/webhook");
  process.exit(1);
}

const env = loadEnvLocal();
requireEnv(env, "TELEGRAM_BOT_TOKEN", "TELEGRAM_WEBHOOK_SECRET");

async function bot(method, params) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const body = await response.json();
  if (!body.ok) throw new Error(`${method}: ${body.description}`);
  return body.result;
}

await bot("setWebhook", {
  url,
  secret_token: env.TELEGRAM_WEBHOOK_SECRET,
  allowed_updates: ["message", "callback_query"],
});

for (const [language_code, start, help] of [
  [undefined, "Start / link your account", "How to use the bot"],
  ["ar", "ابدأ / اربط حسابك", "طريقة استخدام البوت"],
]) {
  await bot("setMyCommands", {
    commands: [
      { command: "start", description: start },
      { command: "help", description: help },
    ],
    ...(language_code ? { language_code } : {}),
  });
}

const info = await bot("getWebhookInfo", {});
console.log(`Webhook set: ${info.url} (pending updates: ${info.pending_update_count})`);
