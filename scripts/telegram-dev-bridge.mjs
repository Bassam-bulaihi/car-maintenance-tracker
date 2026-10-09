// Local development only: Telegram can't reach localhost, so this removes
// the webhook, long-polls getUpdates, and forwards each update to the local
// webhook route with the secret header — the exact request Telegram would
// make in production.
//
//   NO_PROXY=localhost,127.0.0.1 NODE_USE_ENV_PROXY=1 node scripts/telegram-dev-bridge.mjs [http://localhost:3000]
//
// Run scripts/telegram-set-webhook.mjs again afterwards to restore the
// production webhook.
import { loadEnvLocal, requireEnv } from "./env.mjs";

const target = `${(process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "")}/api/telegram/webhook`;
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

await bot("deleteWebhook", {});
console.log(`Polling Telegram, forwarding to ${target}`);

let offset = 0;
for (;;) {
  let updates = [];
  try {
    updates = await bot("getUpdates", { offset, timeout: 30, allowed_updates: ["message", "callback_query"] });
  } catch (error) {
    console.error(String(error));
    await new Promise((resolve) => setTimeout(resolve, 3000));
    continue;
  }
  for (const update of updates) {
    offset = update.update_id + 1;
    const kind = update.callback_query ? `button ${update.callback_query.data}` : `text "${update.message?.text ?? ""}"`;
    const response = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Telegram-Bot-Api-Secret-Token": env.TELEGRAM_WEBHOOK_SECRET },
      body: JSON.stringify(update),
    }).catch((error) => ({ status: String(error) }));
    console.log(`update ${update.update_id} (${kind}) → ${response.status}`);
  }
}
