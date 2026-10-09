-- Switch identity from Supabase Auth to Clerk (Supabase third-party auth).
--
-- Clerk session tokens are verified by Supabase directly; the Clerk user ID
-- arrives as the `sub` claim (e.g. "user_2abc..."), which is not a uuid and
-- has no row in auth.users. So:
--   * public.users.id / public.vehicles.user_id become text holding the
--     Clerk user ID, and the FK to auth.users goes away.
--   * The auth.users signup trigger goes away — the profile row is created
--     by the app on first sign-in (lib/auth/profile.ts).
--   * Every `auth.uid()` ownership check becomes `auth.jwt() ->> 'sub'`.
--   * Admin checks are unchanged: the Clerk session token is customised to
--     carry `app_metadata.role` from the user's publicMetadata.
--
-- Pre-launch: Supabase Auth-era profiles (and, via cascade, their vehicles
-- and history) are discarded rather than migrated — they could never match a
-- Clerk user ID and would only block re-signups through the unique
-- phone_number constraint.

-- ------------------------------------------------------------
-- 1. Drop everything that depends on the column types
-- ------------------------------------------------------------

delete from public.users;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop policy "users select own" on public.users;
drop policy "users update own" on public.users;
drop policy "vehicles select own" on public.vehicles;
drop policy "vehicles insert own" on public.vehicles;
drop policy "vehicles update own" on public.vehicles;
drop policy "vehicles delete own" on public.vehicles;
drop policy "vehicle_service_items select own" on public.vehicle_service_items;
drop policy "vehicle_service_items insert own" on public.vehicle_service_items;
drop policy "vehicle_service_items update own" on public.vehicle_service_items;
drop policy "odometer_readings select own" on public.odometer_readings;
drop policy "odometer_readings insert own" on public.odometer_readings;
drop policy "notifications select own" on public.notifications;
drop policy "service_history select own" on public.service_history;
drop policy "service_history insert own" on public.service_history;

alter table public.vehicles drop constraint vehicles_user_id_fkey;
alter table public.users drop constraint users_id_fkey;

-- ------------------------------------------------------------
-- 2. Retype the identity columns
-- ------------------------------------------------------------

alter table public.users alter column id type text using id::text;
alter table public.vehicles alter column user_id type text using user_id::text;

alter table public.vehicles
  add constraint vehicles_user_id_fkey
  foreign key (user_id) references public.users (id) on delete cascade;

-- ------------------------------------------------------------
-- 3. Recreate the ownership policies against the Clerk `sub` claim
-- ------------------------------------------------------------

create policy "users select own" on public.users
  for select to authenticated
  using (((select auth.jwt()) ->> 'sub') = id);

create policy "users update own" on public.users
  for update to authenticated
  using (((select auth.jwt()) ->> 'sub') = id)
  with check (((select auth.jwt()) ->> 'sub') = id);

create policy "vehicles select own" on public.vehicles
  for select to authenticated
  using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "vehicles insert own" on public.vehicles
  for insert to authenticated
  with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "vehicles update own" on public.vehicles
  for update to authenticated
  using (((select auth.jwt()) ->> 'sub') = user_id)
  with check (((select auth.jwt()) ->> 'sub') = user_id);

create policy "vehicles delete own" on public.vehicles
  for delete to authenticated
  using (((select auth.jwt()) ->> 'sub') = user_id);

create policy "vehicle_service_items select own" on public.vehicle_service_items
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_service_items.vehicle_id
        and v.user_id = ((select auth.jwt()) ->> 'sub')
    )
  );

create policy "vehicle_service_items insert own" on public.vehicle_service_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_service_items.vehicle_id
        and v.user_id = ((select auth.jwt()) ->> 'sub')
    )
  );

create policy "vehicle_service_items update own" on public.vehicle_service_items
  for update to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_service_items.vehicle_id
        and v.user_id = ((select auth.jwt()) ->> 'sub')
    )
  )
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_service_items.vehicle_id
        and v.user_id = ((select auth.jwt()) ->> 'sub')
    )
  );

create policy "odometer_readings select own" on public.odometer_readings
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = odometer_readings.vehicle_id
        and v.user_id = ((select auth.jwt()) ->> 'sub')
    )
  );

create policy "odometer_readings insert own" on public.odometer_readings
  for insert to authenticated
  with check (
    source = 'web'
    and exists (
      select 1 from public.vehicles v
      where v.id = odometer_readings.vehicle_id
        and v.user_id = ((select auth.jwt()) ->> 'sub')
    )
  );

create policy "notifications select own" on public.notifications
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = notifications.vehicle_id
        and v.user_id = ((select auth.jwt()) ->> 'sub')
    )
  );

create policy "service_history select own" on public.service_history
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = service_history.vehicle_id
        and v.user_id = ((select auth.jwt()) ->> 'sub')
    )
  );

create policy "service_history insert own" on public.service_history
  for insert to authenticated
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = service_history.vehicle_id
        and v.user_id = ((select auth.jwt()) ->> 'sub')
    )
  );
