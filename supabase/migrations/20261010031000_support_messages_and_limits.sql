-- User → admin messages sent through the Telegram bot (/support), shown in
-- the admin inbox. Server-only: RLS on, no policies.
create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users (id) on delete cascade,
  chat_id bigint not null,
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index support_messages_status_created_idx on public.support_messages (status, created_at desc);
create index support_messages_user_created_idx on public.support_messages (user_id, created_at desc);

alter table public.support_messages enable row level security;

-- After /support with no text, the user's next plain message is their
-- support message (within a short window).
alter table public.users add column awaiting_support_since timestamptz;

-- Per-chat rate limiting counts recent inbound updates per chat.
alter table public.inbound_message_events add column chat_id bigint;
create index inbound_message_events_chat_received_idx
  on public.inbound_message_events (chat_id, received_at desc);
