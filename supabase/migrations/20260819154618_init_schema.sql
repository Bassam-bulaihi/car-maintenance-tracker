-- Car Maintenance Tracker — initial schema
-- Tables, enums, RLS policies per docs/PRD.md section 6-7.

-- ============================================================
-- Enums
-- ============================================================

create type public.app_language as enum ('ar', 'en');
create type public.user_role as enum ('owner', 'admin');
create type public.odometer_source as enum ('whatsapp', 'web');
create type public.service_type as enum (
  'engine_oil',
  'transmission_fluid',
  'brake_fluid',
  'brake_pads',
  'air_filter',
  'oil_filter',
  'tires'
);
create type public.service_status as enum ('ok', 'due', 'overdue');
create type public.notification_message_type as enum (
  'odometer_request',
  'service_due',
  're_reminder'
);
create type public.notification_delivery_status as enum (
  'pending',
  'sent',
  'delivered',
  'read',
  'failed'
);
create type public.notification_response as enum ('done', 'not_done', 'invalid');

-- ============================================================
-- Tables
-- ============================================================

-- Mirrors auth.users with the app-specific profile fields the PRD requires
-- (phone_number is the WhatsApp channel identity). Populated by the
-- handle_new_user trigger below, never written to directly by clients.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone_number text not null unique,
  language public.app_language not null default 'ar',
  role public.user_role not null default 'owner',
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  make text not null,
  model text not null,
  year integer not null,
  plate_no text,
  current_odometer integer not null default 0,
  odometer_updated_at timestamptz,
  created_at timestamptz not null default now()
);

create index vehicles_user_id_idx on public.vehicles (user_id);

-- Admin-managed presets. Editing a preset only affects newly registered
-- vehicles (PRD 5.7) — existing vehicles keep their own vehicle_service_items row.
create table public.vehicle_presets (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  year integer not null,
  recommended_oil text,
  recommended_parts text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (make, model, year)
);

create table public.preset_service_items (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.vehicle_presets (id) on delete cascade,
  service_type public.service_type not null,
  interval_km integer,
  interval_months integer,
  created_at timestamptz not null default now(),
  constraint preset_service_items_interval_present check (
    interval_km is not null or interval_months is not null
  ),
  unique (preset_id, service_type)
);

create index preset_service_items_preset_id_idx on public.preset_service_items (preset_id);

-- Per-vehicle baselines, seeded from preset_service_items at registration
-- time then tracked independently (PRD 5.4/5.5 — each service item has its
-- own due state and reminder clock).
create table public.vehicle_service_items (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  service_type public.service_type not null,
  interval_km integer,
  interval_months integer,
  last_service_odometer integer,
  last_service_date date,
  status public.service_status not null default 'ok',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicle_service_items_interval_present check (
    interval_km is not null or interval_months is not null
  ),
  unique (vehicle_id, service_type)
);

create index vehicle_service_items_vehicle_id_idx on public.vehicle_service_items (vehicle_id);

create table public.odometer_readings (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  reading_km integer not null,
  source public.odometer_source not null,
  recorded_at timestamptz not null default now()
);

create index odometer_readings_vehicle_id_idx on public.odometer_readings (vehicle_id);

-- One row per outbound WhatsApp notification. outbound_wamid/delivery_status
-- track Meta's `statuses` webhook events (PRD 7.3); response/response_text
-- capture the inbound reply that resolved it.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  service_item_id uuid references public.vehicle_service_items (id) on delete set null,
  message_type public.notification_message_type not null,
  outbound_wamid text unique,
  delivery_status public.notification_delivery_status not null default 'pending',
  sent_at timestamptz,
  response public.notification_response,
  response_text text,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_vehicle_id_idx on public.notifications (vehicle_id);
create index notifications_service_item_id_idx on public.notifications (service_item_id);

create table public.service_history (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  service_type public.service_type not null,
  odometer_at_service integer not null,
  confirmed_at timestamptz not null default now()
);

create index service_history_vehicle_id_idx on public.service_history (vehicle_id);

-- Inbound WhatsApp message ids (wamid), for webhook dedup (PRD 7.3 — payloads
-- are not guaranteed unique).
create table public.whatsapp_inbound_events (
  wamid text primary key,
  received_at timestamptz not null default now()
);

-- ============================================================
-- updated_at trigger
-- ============================================================

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vehicle_service_items_set_updated_at
  before update on public.vehicle_service_items
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- New-user provisioning
-- ============================================================

-- Populates public.users from auth.users on signup. name/phone_number are
-- passed in via supabase.auth.signUp({ options: { data } }) and land in
-- raw_user_meta_data. SECURITY DEFINER is required here since it must write
-- to public.users on behalf of a row that doesn't exist yet at RLS-check
-- time; it is a trigger-only function (Postgres refuses to invoke trigger
-- functions outside a trigger context) so it is not callable as a public RPC.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, name, email, phone_number, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone_number',
    coalesce((new.raw_user_meta_data ->> 'language')::public.app_language, 'ar')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Prevents a user from escalating their own privileges through the
-- self-service update policy below — role changes must come from an admin
-- (checked via app_metadata, never the user-editable public.users row).
create function public.protect_users_role()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') != 'admin' then
    new.role = old.role;
  end if;
  return new;
end;
$$;

create trigger users_protect_role
  before update on public.users
  for each row
  execute function public.protect_users_role();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.users enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_presets enable row level security;
alter table public.preset_service_items enable row level security;
alter table public.vehicle_service_items enable row level security;
alter table public.odometer_readings enable row level security;
alter table public.notifications enable row level security;
alter table public.service_history enable row level security;
alter table public.whatsapp_inbound_events enable row level security;

-- users: a person can read/update only their own profile row.
create policy "users select own" on public.users
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "users update own" on public.users
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- vehicles: full CRUD scoped to the owning user.
create policy "vehicles select own" on public.vehicles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "vehicles insert own" on public.vehicles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "vehicles update own" on public.vehicles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "vehicles delete own" on public.vehicles
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- vehicle_presets / preset_service_items: readable by any signed-in owner
-- (needed at vehicle-registration time), writable only by admins.
create policy "presets select all" on public.vehicle_presets
  for select to authenticated
  using (true);

create policy "presets admin write" on public.vehicle_presets
  for all to authenticated
  using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
  with check (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "preset_service_items select all" on public.preset_service_items
  for select to authenticated
  using (true);

create policy "preset_service_items admin write" on public.preset_service_items
  for all to authenticated
  using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
  with check (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- vehicle_service_items / odometer_readings / notifications / service_history:
-- scoped to the owning user via their vehicle. Rows are written by trusted
-- server code (cron, webhook) using the service role, which bypasses RLS, so
-- these policies only need to cover the read path for the web dashboard.
create policy "vehicle_service_items select own" on public.vehicle_service_items
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_service_items.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

create policy "odometer_readings select own" on public.odometer_readings
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = odometer_readings.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

-- A web-entered reading runs through the same validation/evaluation as a
-- WhatsApp one (PRD 5.3), so the owner is allowed to insert directly.
create policy "odometer_readings insert own" on public.odometer_readings
  for insert to authenticated
  with check (
    source = 'web'
    and exists (
      select 1 from public.vehicles v
      where v.id = odometer_readings.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

create policy "notifications select own" on public.notifications
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = notifications.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

create policy "service_history select own" on public.service_history
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = service_history.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

-- whatsapp_inbound_events is server-only bookkeeping (service role writes and
-- reads it directly); no policies are added, so RLS denies all client access.

-- ============================================================
-- Grants (Data API access — new tables are not auto-exposed by default)
-- ============================================================

grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.vehicles to authenticated;
grant select, insert, update, delete on public.vehicle_presets to authenticated;
grant select, insert, update, delete on public.preset_service_items to authenticated;
grant select on public.vehicle_service_items to authenticated;
grant select, insert on public.odometer_readings to authenticated;
grant select on public.notifications to authenticated;
grant select on public.service_history to authenticated;
