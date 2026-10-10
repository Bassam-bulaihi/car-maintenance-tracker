-- The phone number was the WhatsApp identity; with Telegram (linked by deep
-- link) it has no purpose, and the owner asked for it to go.
revoke update on public.users from authenticated;
alter table public.users drop column phone_number;
grant update (name, language) on public.users to authenticated;
