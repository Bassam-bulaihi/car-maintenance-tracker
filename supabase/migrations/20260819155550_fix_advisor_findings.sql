-- Fixes flagged by `supabase db advisors` after the initial schema push.

-- 1. handle_new_user is SECURITY DEFINER and trigger-only, but Postgres
--    still grants EXECUTE to PUBLIC by default, which exposes it at
--    /rest/v1/rpc/handle_new_user. Revoke it explicitly (trigger.md:
--    "SECURITY DEFINER functions in public are callable by all roles").
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 2. auth.jwt() must be wrapped as `(select auth.jwt())` on its own so
--    Postgres can hoist it into an InitPlan instead of the jsonb `->`/`->>`
--    chain around it (which defeated the optimization even though the
--    whole expression was inside a `select`).
drop policy "presets admin write" on public.vehicle_presets;
drop policy "preset_service_items admin write" on public.preset_service_items;

-- 3. Split the combined `for all` admin policy into insert/update/delete
--    only, so it no longer doubles up with "... select all" on SELECT
--    (multiple_permissive_policies).
create policy "presets admin insert" on public.vehicle_presets
  for insert to authenticated
  with check (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "presets admin update" on public.vehicle_presets
  for update to authenticated
  using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin')
  with check (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "presets admin delete" on public.vehicle_presets
  for delete to authenticated
  using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "preset_service_items admin insert" on public.preset_service_items
  for insert to authenticated
  with check (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "preset_service_items admin update" on public.preset_service_items
  for update to authenticated
  using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin')
  with check (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "preset_service_items admin delete" on public.preset_service_items
  for delete to authenticated
  using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin');

-- Same JWT initplan fix for protect_users_role (not flagged since it's
-- inside a function body rather than a policy, but keep it consistent).
create or replace function public.protect_users_role()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') != 'admin' then
    new.role = old.role;
  end if;
  return new;
end;
$$;
