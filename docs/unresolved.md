# Unresolved / deferred work

Things intentionally left out of the current build, so they aren't mistaken for bugs or forgotten.

- **Clerk production instance.** Auth runs on Clerk's development instance. A production instance (`clerk deploy`) needs a custom domain with DNS we control; once it exists, register its issuer in Supabase → Authentication → Third-party auth as well.
- **Phone number field.** Still required at signup and on the account page as a contact detail, but no longer used for messaging (reminders go to the linked Telegram chat). Drop or make it optional if it stays unused.
- **Follow-up queue.** Telegram threads that hit `MAX_REPLY_ATTEMPTS` are flagged (`notifications.needs_follow_up`), but there's no admin view listing them yet.

The due-service → notification bridge previously tracked here is implemented in `lib/messaging/due-services.ts`: it runs after every odometer reading (web or Telegram) and from the daily `service-reminders` cron, which also catches time-only items.
