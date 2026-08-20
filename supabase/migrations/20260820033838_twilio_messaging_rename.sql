-- Rename Meta-specific messaging identifiers to provider-neutral ones.
-- The project switched WhatsApp delivery from the Meta Cloud API to
-- Twilio's Programmable Messaging API (see CLAUDE.md rule 4). A "wamid" is
-- a Meta concept; Twilio's equivalent is a MessageSid, so the storage
-- shouldn't keep Meta's name for it. Plain renames only — no RLS policy
-- references either name, so nothing else needs to change.

alter table public.notifications
  rename column outbound_wamid to provider_message_sid;

alter table public.whatsapp_inbound_events
  rename to inbound_message_events;

alter table public.inbound_message_events
  rename column wamid to message_sid;
