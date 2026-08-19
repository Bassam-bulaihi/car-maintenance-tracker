-- The original schema only granted `authenticated` SELECT on
-- vehicle_service_items/service_history, assuming only server/cron code
-- (service role) would write them. The web dashboard's vehicle
-- registration (seeding items from a preset) and "confirm service done"
-- flows run as the signed-in user, not service role, and need to write
-- their own vehicle's rows — matching the existing ownership-scoped
-- pattern already used for odometer_readings.

create policy "vehicle_service_items insert own" on public.vehicle_service_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_service_items.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

create policy "vehicle_service_items update own" on public.vehicle_service_items
  for update to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_service_items.vehicle_id
        and v.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_service_items.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

create policy "service_history insert own" on public.service_history
  for insert to authenticated
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = service_history.vehicle_id
        and v.user_id = (select auth.uid())
    )
  );

grant insert, update on public.vehicle_service_items to authenticated;
grant insert on public.service_history to authenticated;
