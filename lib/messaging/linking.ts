import "server-only";
import { randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { TELEGRAM_LINK_TOKEN_TTL_MINUTES } from "@/lib/config";

type ServiceClient = SupabaseClient<Database>;

export function telegramBotUsername() {
  return process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "") || null;
}

/**
 * Issues a one-time token for t.me/<bot>?start=<token>. Telegram start
 * parameters allow [A-Za-z0-9_-] up to 64 chars; base64url of 24 random bytes
 * is 32 chars. Earlier unused tokens for the user are dropped so only the
 * newest link works.
 */
export async function createLinkToken(supabase: ServiceClient, userId: string) {
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + TELEGRAM_LINK_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

  await supabase.from("telegram_link_tokens").delete().eq("user_id", userId).is("used_at", null);
  const { error } = await supabase
    .from("telegram_link_tokens")
    .insert({ token, user_id: userId, expires_at: expiresAt });
  if (error) throw error;

  return token;
}

/**
 * Redeems a /start token for a chat. Returns the linked user, or null when
 * the token is unknown, expired, or already used. A chat can belong to only
 * one account, so linking it here moves it off any account that had it.
 */
export async function consumeLinkToken(supabase: ServiceClient, token: string, chatId: number) {
  const now = new Date().toISOString();

  // Claim the token atomically so two concurrent /start deliveries can't
  // both succeed.
  const { data: claimed } = await supabase
    .from("telegram_link_tokens")
    .update({ used_at: now })
    .eq("token", token)
    .is("used_at", null)
    .gt("expires_at", now)
    .select("user_id")
    .maybeSingle();
  if (!claimed) return null;

  await supabase
    .from("users")
    .update({ telegram_chat_id: null, telegram_linked_at: null })
    .eq("telegram_chat_id", chatId)
    .neq("id", claimed.user_id);

  const { data: user, error } = await supabase
    .from("users")
    .update({ telegram_chat_id: chatId, telegram_linked_at: now })
    .eq("id", claimed.user_id)
    .select("id, name, language")
    .single();
  if (error) throw error;

  return user;
}
