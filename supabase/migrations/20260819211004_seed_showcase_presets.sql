-- Seeds the six vehicle presets shown on the marketing home page
-- (lib/home/content.ts) into the real preset tables, so a visitor who
-- signs up can actually register any car advertised on the landing page.
--
-- Idempotent: presets upsert on their (make, model, year) unique key and
-- service items on (preset_id, service_type), so re-running is safe and the
-- Hyundai Accent 2025 row created during earlier testing is updated rather
-- than duplicated.

insert into public.vehicle_presets (make, model, year, recommended_oil)
values
  ('Hyundai', 'Accent', 2025, '5W-30'),
  ('Toyota', 'Land Cruiser', 2024, '0W-20'),
  ('Nissan', 'Patrol', 2023, '5W-40'),
  ('Kia', 'Rio', 2024, '5W-20'),
  ('Toyota', 'Hilux', 2025, '15W-40'),
  ('Honda', 'Civic', 2023, '0W-20')
on conflict (make, model, year)
  do update set recommended_oil = excluded.recommended_oil,
                is_active = true;

insert into public.preset_service_items (preset_id, service_type, interval_km, interval_months)
select p.id, v.service_type::public.service_type, v.interval_km, v.interval_months
from (
  values
    -- make, model, year, service_type, interval_km, interval_months
    ('Hyundai'::text, 'Accent'::text, 2025::int, 'engine_oil'::text, 5000::int, 6::int),
    ('Hyundai', 'Accent', 2025, 'oil_filter', 5000, 6),
    ('Hyundai', 'Accent', 2025, 'air_filter', 15000, 12),
    ('Hyundai', 'Accent', 2025, 'brake_fluid', null, 24),
    ('Hyundai', 'Accent', 2025, 'brake_pads', 30000, null),
    ('Hyundai', 'Accent', 2025, 'transmission_fluid', 60000, 48),
    ('Hyundai', 'Accent', 2025, 'tires', 40000, null),

    ('Toyota', 'Land Cruiser', 2024, 'engine_oil', 10000, 12),
    ('Toyota', 'Land Cruiser', 2024, 'oil_filter', 10000, 12),
    ('Toyota', 'Land Cruiser', 2024, 'air_filter', 20000, 12),
    ('Toyota', 'Land Cruiser', 2024, 'brake_fluid', null, 36),
    ('Toyota', 'Land Cruiser', 2024, 'brake_pads', 40000, null),
    ('Toyota', 'Land Cruiser', 2024, 'transmission_fluid', 80000, 48),
    ('Toyota', 'Land Cruiser', 2024, 'tires', 50000, null),

    ('Nissan', 'Patrol', 2023, 'engine_oil', 8000, 9),
    ('Nissan', 'Patrol', 2023, 'oil_filter', 8000, 9),
    ('Nissan', 'Patrol', 2023, 'air_filter', 16000, 12),
    ('Nissan', 'Patrol', 2023, 'brake_fluid', null, 24),
    ('Nissan', 'Patrol', 2023, 'brake_pads', 35000, null),
    ('Nissan', 'Patrol', 2023, 'tires', 45000, null),

    ('Kia', 'Rio', 2024, 'engine_oil', 7500, 6),
    ('Kia', 'Rio', 2024, 'oil_filter', 7500, 6),
    ('Kia', 'Rio', 2024, 'air_filter', 15000, 12),
    ('Kia', 'Rio', 2024, 'brake_fluid', null, 24),
    ('Kia', 'Rio', 2024, 'brake_pads', 30000, null),
    ('Kia', 'Rio', 2024, 'tires', 40000, null),

    ('Toyota', 'Hilux', 2025, 'engine_oil', 10000, 12),
    ('Toyota', 'Hilux', 2025, 'oil_filter', 10000, 12),
    ('Toyota', 'Hilux', 2025, 'air_filter', 20000, 12),
    ('Toyota', 'Hilux', 2025, 'brake_fluid', null, 24),
    ('Toyota', 'Hilux', 2025, 'brake_pads', 45000, null),
    ('Toyota', 'Hilux', 2025, 'transmission_fluid', 80000, 48),
    ('Toyota', 'Hilux', 2025, 'tires', 60000, null),

    ('Honda', 'Civic', 2023, 'engine_oil', 6000, 6),
    ('Honda', 'Civic', 2023, 'oil_filter', 6000, 6),
    ('Honda', 'Civic', 2023, 'air_filter', 15000, 12),
    ('Honda', 'Civic', 2023, 'brake_fluid', null, 24),
    ('Honda', 'Civic', 2023, 'brake_pads', 30000, null),
    ('Honda', 'Civic', 2023, 'tires', 40000, null)
) as v(make, model, year, service_type, interval_km, interval_months)
join public.vehicle_presets p
  on p.make = v.make and p.model = v.model and p.year = v.year
on conflict (preset_id, service_type)
  do update set interval_km = excluded.interval_km,
                interval_months = excluded.interval_months;

insert into public.preset_recommended_parts (preset_id, part_name)
select p.id, v.part_name
from (
  values
    ('Hyundai'::text, 'Accent'::text, 2025::int, 'Engine air filter'::text),
    ('Hyundai', 'Accent', 2025, 'Cabin A/C filter'),
    ('Hyundai', 'Accent', 2025, 'Oil filter'),

    ('Toyota', 'Land Cruiser', 2024, 'Oil filter'),
    ('Toyota', 'Land Cruiser', 2024, 'Engine air filter'),
    ('Toyota', 'Land Cruiser', 2024, 'Front brake pads'),

    ('Nissan', 'Patrol', 2023, 'Oil filter'),
    ('Nissan', 'Patrol', 2023, 'Engine air filter'),

    ('Kia', 'Rio', 2024, 'Oil filter'),
    ('Kia', 'Rio', 2024, 'Cabin A/C filter'),

    ('Toyota', 'Hilux', 2025, 'Oil filter'),
    ('Toyota', 'Hilux', 2025, 'Fuel filter'),
    ('Toyota', 'Hilux', 2025, 'Engine air filter'),

    ('Honda', 'Civic', 2023, 'Oil filter'),
    ('Honda', 'Civic', 2023, 'Cabin A/C filter')
) as v(make, model, year, part_name)
join public.vehicle_presets p
  on p.make = v.make and p.model = v.model and p.year = v.year
where not exists (
  select 1 from public.preset_recommended_parts rp
  where rp.preset_id = p.id and rp.part_name = v.part_name
);
