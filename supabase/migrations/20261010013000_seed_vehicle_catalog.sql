-- Seeds the preset catalog with the models most common on Saudi roads, for
-- model years 2020–2025, so most users find their car without the custom
-- vehicle path.
--
-- Intervals are general guidance for Gulf driving (heat and dust count as
-- "severe" in most owner's manuals), grouped into a handful of maintenance
-- profiles rather than invented per model. Admins refine any preset from
-- /admin/presets; editing a preset only affects vehicles registered after
-- the edit (PRD §5.7).
--
-- Idempotent: existing (make, model, year) presets and their service items
-- are left exactly as they are.

with profiles (profile, service_type, interval_km, interval_months) as (
  values
    -- Japanese petrol cars and crossovers
    ('japanese', 'engine_oil', 10000, 12),
    ('japanese', 'oil_filter', 10000, 12),
    ('japanese', 'air_filter', 20000, 12),
    ('japanese', 'brake_fluid', null, 24),
    ('japanese', 'brake_pads', 40000, null),
    ('japanese', 'transmission_fluid', 60000, 48),
    ('japanese', 'tires', 50000, null),
    -- Korean petrol cars and crossovers (severe-service schedule)
    ('korean', 'engine_oil', 7500, 6),
    ('korean', 'oil_filter', 7500, 6),
    ('korean', 'air_filter', 15000, 12),
    ('korean', 'brake_fluid', null, 24),
    ('korean', 'brake_pads', 30000, null),
    ('korean', 'transmission_fluid', 60000, 48),
    ('korean', 'tires', 40000, null),
    -- Body-on-frame SUVs and pickups (towing, sand, heat)
    ('truck', 'engine_oil', 8000, 6),
    ('truck', 'oil_filter', 8000, 6),
    ('truck', 'air_filter', 15000, 12),
    ('truck', 'brake_fluid', null, 24),
    ('truck', 'brake_pads', 35000, null),
    ('truck', 'transmission_fluid', 60000, 36),
    ('truck', 'tires', 45000, null),
    -- American V6/V8 (synthetic oil, longer drain intervals)
    ('american', 'engine_oil', 12000, 12),
    ('american', 'oil_filter', 12000, 12),
    ('american', 'air_filter', 25000, 12),
    ('american', 'brake_fluid', null, 36),
    ('american', 'brake_pads', 40000, null),
    ('american', 'transmission_fluid', 80000, 60),
    ('american', 'tires', 50000, null),
    -- Chinese-brand petrol/turbo
    ('chinese', 'engine_oil', 5000, 6),
    ('chinese', 'oil_filter', 5000, 6),
    ('chinese', 'air_filter', 15000, 12),
    ('chinese', 'brake_fluid', null, 24),
    ('chinese', 'brake_pads', 30000, null),
    ('chinese', 'transmission_fluid', 40000, 36),
    ('chinese', 'tires', 40000, null)
),
models (make, model, recommended_oil, profile) as (
  values
    ('Toyota', 'Camry', '0W-20', 'japanese'),
    ('Toyota', 'Corolla', '0W-20', 'japanese'),
    ('Toyota', 'Yaris', '0W-20', 'japanese'),
    ('Toyota', 'RAV4', '0W-20', 'japanese'),
    ('Toyota', 'Fortuner', '5W-30', 'truck'),
    ('Toyota', 'Land Cruiser', '0W-20', 'truck'),
    ('Toyota', 'Land Cruiser Prado', '5W-30', 'truck'),
    ('Toyota', 'Hilux', '15W-40', 'truck'),
    ('Hyundai', 'Accent', '5W-30', 'korean'),
    ('Hyundai', 'Elantra', '5W-30', 'korean'),
    ('Hyundai', 'Sonata', '5W-30', 'korean'),
    ('Hyundai', 'Creta', '5W-30', 'korean'),
    ('Hyundai', 'Tucson', '5W-30', 'korean'),
    ('Hyundai', 'Santa Fe', '5W-30', 'korean'),
    ('Kia', 'Pegas', '5W-30', 'korean'),
    ('Kia', 'Rio', '5W-20', 'korean'),
    ('Kia', 'Cerato', '5W-30', 'korean'),
    ('Kia', 'K5', '5W-30', 'korean'),
    ('Kia', 'Sportage', '5W-30', 'korean'),
    ('Kia', 'Sorento', '5W-30', 'korean'),
    ('Nissan', 'Sunny', '5W-30', 'japanese'),
    ('Nissan', 'Altima', '0W-20', 'japanese'),
    ('Nissan', 'Kicks', '0W-20', 'japanese'),
    ('Nissan', 'X-Trail', '0W-20', 'japanese'),
    ('Nissan', 'Patrol', '5W-40', 'truck'),
    ('Nissan', 'Navara', '5W-30', 'truck'),
    ('Honda', 'City', '0W-20', 'japanese'),
    ('Honda', 'Civic', '0W-20', 'japanese'),
    ('Honda', 'Accord', '0W-20', 'japanese'),
    ('Honda', 'CR-V', '0W-20', 'japanese'),
    ('Mazda', 'Mazda 3', '0W-20', 'japanese'),
    ('Mazda', 'Mazda 6', '0W-20', 'japanese'),
    ('Mazda', 'CX-5', '0W-20', 'japanese'),
    ('Mitsubishi', 'Attrage', '0W-20', 'japanese'),
    ('Mitsubishi', 'Outlander', '0W-20', 'japanese'),
    ('Mitsubishi', 'Pajero', '5W-30', 'truck'),
    ('Mitsubishi', 'L200', '5W-30', 'truck'),
    ('Lexus', 'ES', '0W-20', 'japanese'),
    ('Lexus', 'RX', '0W-20', 'japanese'),
    ('Lexus', 'LX', '0W-20', 'truck'),
    ('Isuzu', 'D-Max', '5W-30', 'truck'),
    ('Chevrolet', 'Malibu', '5W-30', 'american'),
    ('Chevrolet', 'Captiva', '5W-30', 'chinese'),
    ('Chevrolet', 'Tahoe', '0W-20', 'american'),
    ('Chevrolet', 'Silverado', '0W-20', 'american'),
    ('GMC', 'Yukon', '0W-20', 'american'),
    ('GMC', 'Sierra', '0W-20', 'american'),
    ('Ford', 'Taurus', '5W-30', 'american'),
    ('Ford', 'Explorer', '5W-30', 'american'),
    ('Ford', 'Expedition', '5W-30', 'american'),
    ('Ford', 'F-150', '5W-30', 'american'),
    ('MG', 'MG5', '5W-30', 'chinese'),
    ('MG', 'ZS', '5W-30', 'chinese'),
    ('MG', 'RX5', '5W-30', 'chinese'),
    ('Changan', 'Alsvin', '5W-30', 'chinese'),
    ('Changan', 'CS35 Plus', '5W-30', 'chinese'),
    ('Changan', 'CS75 Plus', '5W-30', 'chinese'),
    ('Geely', 'Emgrand', '5W-30', 'chinese'),
    ('Geely', 'Coolray', '5W-30', 'chinese')
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
