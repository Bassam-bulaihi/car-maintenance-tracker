-- The landing page brand grid shows Suzuki, Jeep and Volkswagen; seed their
-- common Saudi-market models (2020–2025) so none of the advertised makes is
-- a dead end. Same profiles and idempotency as 20261010013000.
with profiles (profile, service_type, interval_km, interval_months) as (
  values
    ('japanese', 'engine_oil', 10000, 12), ('japanese', 'oil_filter', 10000, 12),
    ('japanese', 'air_filter', 20000, 12), ('japanese', 'brake_fluid', null, 24),
    ('japanese', 'brake_pads', 40000, null), ('japanese', 'transmission_fluid', 60000, 48),
    ('japanese', 'tires', 50000, null),
    ('truck', 'engine_oil', 8000, 6), ('truck', 'oil_filter', 8000, 6),
    ('truck', 'air_filter', 15000, 12), ('truck', 'brake_fluid', null, 24),
    ('truck', 'brake_pads', 35000, null), ('truck', 'transmission_fluid', 60000, 36),
    ('truck', 'tires', 45000, null),
    ('american', 'engine_oil', 12000, 12), ('american', 'oil_filter', 12000, 12),
    ('american', 'air_filter', 25000, 12), ('american', 'brake_fluid', null, 36),
    ('american', 'brake_pads', 40000, null), ('american', 'transmission_fluid', 80000, 60),
    ('american', 'tires', 50000, null)
),
models (make, model, recommended_oil, profile) as (
  values
    ('Suzuki', 'Dzire', '0W-20', 'japanese'),
    ('Suzuki', 'Swift', '0W-20', 'japanese'),
    ('Suzuki', 'Ertiga', '0W-20', 'japanese'),
    ('Suzuki', 'Jimny', '5W-30', 'truck'),
    ('Jeep', 'Wrangler', '5W-30', 'american'),
    ('Jeep', 'Grand Cherokee', '0W-20', 'american'),
    ('Jeep', 'Compass', '0W-20', 'american'),
    ('Volkswagen', 'Tiguan', '5W-30', 'japanese'),
    ('Volkswagen', 'Teramont', '5W-30', 'japanese'),
    ('Volkswagen', 'Passat', '5W-30', 'japanese')
),
inserted as (
  insert into public.vehicle_presets (make, model, year, recommended_oil)
  select m.make, m.model, y.year, m.recommended_oil
  from models m cross join generate_series(2020, 2025) as y(year)
  on conflict (make, model, year) do nothing
  returning id, make, model
)
insert into public.preset_service_items (preset_id, service_type, interval_km, interval_months)
select i.id, p.service_type::public.service_type, p.interval_km, p.interval_months
from inserted i
join models m on m.make = i.make and m.model = i.model
join profiles p on p.profile = m.profile;
