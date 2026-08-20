# Unresolved / deferred work

Things intentionally left out of the current build, so they aren't mistaken for bugs or forgotten.

## Due-service → notification bridge (deferred 2026-08-20, resolved 2026-08-20)

Built as `lib/messaging/due-service-bridge.ts`'s `evaluateAndNotifyDueServices`,
which runs `computeServiceStatus` and calls `sendServiceDueNotification` on
anything newly due. It's called from three places: both odometer-entry paths
(`submitOdometerReading` in `lib/dashboard/actions.ts`, and
`handleOdometerReply` in `lib/messaging/inbound.ts`) for the mileage side, and
the new `app/api/cron/due-service-check` route (scheduled daily in
`vercel.json`, ahead of `service-reminders`) for the time side, since a
time-based item can go due with no odometer activity at all.
