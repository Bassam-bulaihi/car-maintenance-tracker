-- Move messaging from WhatsApp (Twilio) to a Telegram bot, two-way.
--
-- * A Telegram bot can't open a conversation from a phone number, so each
--   user links their chat explicitly: the account page issues a one-time
--   token, the user opens t.me/<bot>?start=<token>, and the webhook stores
--   the chat id on their profile.
-- * Replies are data again (PRD §5.5/§7.5): a typed odometer number answers
--   an odometer_request, inline Done / Not done buttons answer a service
--   reminder. Each notification tracks its own reply attempts so bad input
--   gets a clarification and, after the configured limit, is flagged for
--   follow-up instead of looping.

-- ------------------------------------------------------------
-- Telegram identity on the profile
-- ------------------------------------------------------------

alter table public.users
  add column telegram_chat_id bigint unique,
  add column telegram_linked_at timestamptz;

-- The self-service update policy covers the whole row; the chat id must only
-- ever be set by the bot after a verified /start, never by the client.
revoke update on public.users from authenticated;
grant update (name, phone_number, language) on public.users to authenticated;

-- One-time deep-link tokens. Server-only bookkeeping: RLS on, no policies,
-- so only the service role (account action + webhook) can touch it.
create table public.telegram_link_tokens (
  token text primary key,
  user_id text not null references public.users (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index telegram_link_tokens_user_id_idx on public.telegram_link_tokens (user_id);

alter table public.telegram_link_tokens enable row level security;

-- ------------------------------------------------------------
-- Provider-neutral naming for the channel
-- ------------------------------------------------------------

alter type public.odometer_source rename value 'whatsapp' to 'telegram';

-- Telegram message ids are only unique within one chat, so the old global
-- unique on the provider id becomes (chat_id, provider_message_id).
alter table public.notifications drop constraint notifications_outbound_wamid_key;
alter table public.notifications rename column provider_message_sid to provider_message_id;

alter table public.notifications
  add column chat_id bigint,
  add column reply_attempts integer not null default 0,
  add column needs_follow_up boolean not null default false,
  add constraint notifications_chat_message_key unique (chat_id, provider_message_id);

-- Open threads (no reply recorded yet) are looked up on every inbound
-- message.
create index notifications_open_idx
  on public.notifications (vehicle_id, message_type)
  where responded_at is null;

-- Webhook dedupe now keys on Telegram's update_id.
alter table public.inbound_message_events rename column message_sid to event_id;
