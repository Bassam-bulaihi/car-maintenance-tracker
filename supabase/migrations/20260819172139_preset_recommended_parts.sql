-- Recommended parts becomes a proper list (one row per part) instead of a
-- single delimited string, matching the preset_service_items pattern.

create table public.preset_recommended_parts (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.vehicle_presets (id) on delete cascade,
  part_name text not null,
  created_at timestamptz not null default now()
);

create index preset_recommended_parts_preset_id_idx on public.preset_recommended_parts (preset_id);

-- Backfill existing comma-separated values before dropping the column.
insert into public.preset_recommended_parts (preset_id, part_name)
select id, trim(part)
from public.vehicle_presets, unnest(string_to_array(recommended_parts, ',')) as part
where recommended_parts is not null and trim(part) != '';

alter table public.vehicle_presets drop column recommended_parts;

alter table public.preset_recommended_parts enable row level security;

create policy "preset_recommended_parts select all" on public.preset_recommended_parts
  for select to authenticated
  using (true);

create policy "preset_recommended_parts admin insert" on public.preset_recommended_parts
  for insert to authenticated
  with check (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin');

create policy "preset_recommended_parts admin delete" on public.preset_recommended_parts
  for delete to authenticated
  using (coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role'), '') = 'admin');

grant select, insert, delete on public.preset_recommended_parts to authenticated;
