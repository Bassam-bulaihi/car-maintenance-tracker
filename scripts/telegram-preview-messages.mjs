// Sends every message the bot can produce to one linked user's Telegram, in
// order and labelled, so the copy can be reviewed on a real phone without
// having to trigger each scenario. Buttons in the preview carry an inert
// payload (the webhook answers and ignores them) — nothing is written.
//
//   NODE_USE_ENV_PROXY=1 node --no-warnings scripts/telegram-preview-messages.mjs you@example.com [ar|en]
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal, requireEnv } from "./env.mjs";
import { dictionaries } from "../lib/i18n/dictionaries.ts";

const [email, localeArg] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node scripts/telegram-preview-messages.mjs <email> [ar|en]");
  process.exit(1);
}

const env = loadEnvLocal();
requireEnv(env, "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY", "TELEGRAM_BOT_TOKEN");
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

const { data: user } = await db.from("users").select("name, language, telegram_chat_id").eq("email", email).maybeSingle();
if (!user?.telegram_chat_id) {
  console.error(`${email} has no linked Telegram chat.`);
  process.exit(1);
}

const locale = localeArg ?? user.language;
const t = dictionaries[locale].telegramBot;
const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
const base = (env.APP_BASE_URL && !env.APP_BASE_URL.includes("localhost") ? env.APP_BASE_URL : "https://car-auto-g.vercel.app").replace(/\/+$/, "");
const sample = {
  vehicle: "Honda Civic",
  service: locale === "ar" ? "زيت المحرك" : "Engine oil",
  link: `${base}/dashboard`,
  reading: nf.format(25500),
  current: nf.format(25000),
  jump: nf.format(18000),
  date: new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", { dateStyle: "medium" }).format(new Date()),
  days: nf.format(3),
  odometer: nf.format(25000),
  name: user.name,
};
const fill = (template) => template.replace(/\{(\w+)\}/g, (m, key) => sample[key] ?? m);
const inert = (label) => ({ text: label, callback_data: "preview" });

// [label, text, reply_markup?] — business-initiated messages first, then replies.
const messages = [
  ["Odometer request (reply box opens automatically)", fill(t.odometerRequest), { force_reply: true, input_field_placeholder: t.odometerPlaceholder }],
  ["Service due", fill(t.serviceDue), { inline_keyboard: [[inert(t.doneButton), inert(t.notDoneButton)]] }],
  ["Service re-reminder", fill(t.serviceDueReminder), { inline_keyboard: [[inert(t.doneButton), inert(t.notDoneButton)]] }],
  ["Reply: reading saved", fill(t.odometerSaved)],
  ["Reply: not a number", fill(t.odometerInvalid)],
  ["Reply: lower than last reading", fill(t.odometerTooLow)],
  ["Reply: big jump — confirm?", fill(t.odometerConfirm), { inline_keyboard: [[inert(t.confirmYesButton), inert(t.confirmNoButton)]] }],
  ["Reply: re-enter requested", fill(t.odometerReenter)],
  ["Reply: 3 bad attempts — flagged", fill(t.tooManyAttempts)],
  ["Reply: service done", fill(t.serviceDoneRecorded)],
  ["Reply: service not done", fill(t.serviceNotDoneRecorded)],
  ["Reply: already answered", fill(t.alreadyAnswered)],
  ["Reply: unclear confirmation", fill(t.confirmationUnclear)],
  ["Reply: which reminder?", fill(t.confirmationAmbiguous)],
  ["Reply: which car?", fill(t.odometerAmbiguous)],
  ["Reply: unprompted reading refused", fill(t.noOpenRequest)],
  ["/help", fill(t.help)],
  ["Unlinked chat", fill(t.notLinked)],
  ["Account linked", fill(t.linked)],
  ["Expired / used link", fill(t.linkInvalid)],
  [
    "Button toasts (shown as a pop-up after a tap)",
    [t.doneAck, t.notDoneAck, t.confirmAck, t.reenterAck].map((x) => `• ${x}`).join("\n"),
  ],
];

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

for (const [i, [label, text, markup]] of messages.entries()) {
  await bot("sendMessage", {
    chat_id: user.telegram_chat_id,
    text: `〔${i + 1}/${messages.length} · ${label}〕\n\n${text}`,
    link_preview_options: { is_disabled: true },
    ...(markup ? { reply_markup: markup } : {}),
  });
  await new Promise((resolve) => setTimeout(resolve, 400));
}
console.log(`Sent ${messages.length} preview messages (${locale}) to ${email}.`);
