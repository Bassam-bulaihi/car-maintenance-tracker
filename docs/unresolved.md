# Unresolved / deferred work

Things intentionally left out of the current build, so they aren't mistaken for bugs or forgotten.

Nothing outstanding right now. The due-service → notification bridge that
used to be tracked here (deferred 2026-08-20) was implemented on 2026-08-20:
`lib/dashboard/due-service-check.ts` runs `computeServiceStatus` and calls
`sendServiceDueNotification` whenever a service item crosses its
mileage-or-time threshold — invoked inline after every odometer update (web
and WhatsApp) and from the new daily `app/api/cron/due-service-check` sweep
(for time-only items with no odometer activity to trigger on).
