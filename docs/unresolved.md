# Unresolved / deferred work

Things intentionally left out of the current build, so they aren't mistaken for bugs or forgotten.

## Due-service → notification bridge (deferred 2026-08-20)

**What's built:** the messaging layer (`lib/messaging/`), the two schedulers
(`app/api/cron/odometer-requests`, `app/api/cron/service-reminders`), and
notification logging (every send/receive writes a `notifications` row, status
callbacks update `delivery_status`). `lib/dashboard/service-status.ts`
(`computeServiceStatus`) already implements the mileage-OR-time due
evaluation from `docs/PRD.md` §5.4, and is used today to show due/overdue
badges on the web dashboard.

**What's missing:** nothing currently connects the two. There is no job that
periodically runs `computeServiceStatus` across every vehicle's service
items, notices a newly-due item, and calls
`lib/messaging/send.ts`'s `sendServiceDueNotification` to create the first
`service_due` notification for it. Per `docs/PRD.md` §5.5, this is supposed
to be a WhatsApp push ("هل تم تغيير زيت الفرامل؟"), not something the user
has to notice on the dashboard.

**Why it's deferred:** scoped out explicitly by the project owner in favor of
finishing the messaging/scheduler/logging infrastructure first.

**Consequence to be aware of:** `app/api/cron/service-reminders` (the
re-reminder chaser) is fully correct and will work the moment it has
`service_due`/`re_reminder` rows to chase — but until this bridge exists,
it will always find zero rows and effectively be a no-op. That's expected,
not a bug.

**Suggested shape for later** (not committed to, just a starting point): a
third cron route, e.g. `app/api/cron/due-service-check/route.ts`, that for
every `vehicle_service_items` row not already `status: "due"`/`"overdue"`
with a *currently open* notification, runs `computeServiceStatus` against
the vehicle's `current_odometer`; on a new `"due"` result, flips
`vehicle_service_items.status` and calls `sendServiceDueNotification`.
Needs a decision on run frequency (probably alongside the odometer-request
cron, since mileage-due can only change when the odometer changes, but
time-due needs its own daily check regardless of odometer activity).
