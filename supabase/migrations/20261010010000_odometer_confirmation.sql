-- A reading above the time-scaled plausibility allowance is no longer
-- rejected outright: the bot asks the user to confirm it first. The
-- candidate reading waits here until they tap "Yes, correct" (recorded) or
-- "No, re-enter" (cleared).
alter table public.notifications add column pending_reading_km integer;
