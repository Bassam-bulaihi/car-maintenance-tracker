-- Body type per preset, so the landing page's body-type tiles show real
-- catalog counts (they were hard-coded marketing numbers) and selecting one
-- lists the registrable models. Slugs match BODY_TYPES in lib/home/content.ts.
alter table public.vehicle_presets add column body_type text;

update public.vehicle_presets set body_type = v.body_type
from (values
  ('Camry', 'sedan'), ('Corolla', 'sedan'), ('Accent', 'sedan'), ('Elantra', 'sedan'),
  ('Sonata', 'sedan'), ('Pegas', 'sedan'), ('Cerato', 'sedan'), ('K5', 'sedan'),
  ('Sunny', 'sedan'), ('Altima', 'sedan'), ('City', 'sedan'), ('Civic', 'sedan'),
  ('Accord', 'sedan'), ('Mazda 3', 'sedan'), ('Mazda 6', 'sedan'), ('Attrage', 'sedan'),
  ('ES', 'sedan'), ('Malibu', 'sedan'), ('Taurus', 'sedan'), ('MG5', 'sedan'),
  ('Alsvin', 'sedan'), ('Emgrand', 'sedan'), ('Dzire', 'sedan'), ('Passat', 'sedan'),
  ('Yaris', 'hatchback'), ('Rio', 'hatchback'), ('Swift', 'hatchback'),
  ('RAV4', 'crossover'), ('Creta', 'crossover'), ('Tucson', 'crossover'), ('Sportage', 'crossover'),
  ('Kicks', 'crossover'), ('X-Trail', 'crossover'), ('CR-V', 'crossover'), ('CX-5', 'crossover'),
  ('Outlander', 'crossover'), ('RX', 'crossover'), ('ZS', 'crossover'), ('RX5', 'crossover'),
  ('CS35 Plus', 'crossover'), ('CS75 Plus', 'crossover'), ('Coolray', 'crossover'),
  ('Compass', 'crossover'), ('Tiguan', 'crossover'), ('Captiva', 'crossover'),
  ('Fortuner', 'suv'), ('Land Cruiser', 'suv'), ('Land Cruiser Prado', 'suv'), ('Santa Fe', 'suv'),
  ('Sorento', 'suv'), ('Patrol', 'suv'), ('Pajero', 'suv'), ('LX', 'suv'), ('Tahoe', 'suv'),
  ('Yukon', 'suv'), ('Explorer', 'suv'), ('Expedition', 'suv'), ('Grand Cherokee', 'suv'),
  ('Teramont', 'suv'),
  ('Jimny', 'offroad'), ('Wrangler', 'offroad'),
  ('Ertiga', 'minivan'),
  ('Hilux', 'pickup'), ('Navara', 'pickup'), ('L200', 'pickup'), ('D-Max', 'pickup'),
  ('Silverado', 'pickup'), ('Sierra', 'pickup'), ('F-150', 'pickup')
) as v(model, body_type)
where public.vehicle_presets.model = v.model;
