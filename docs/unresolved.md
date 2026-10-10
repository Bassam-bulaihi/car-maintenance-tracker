# Unresolved / deferred work

Things intentionally left out of the current build, so they aren't mistaken for bugs or forgotten.

- **Clerk production instance.** Auth runs on Clerk's development instance (hence the "Development mode" badge). A production instance (`npx clerk deploy`, interactive) needs a custom domain with DNS we control — `*.vercel.app` can't host Clerk's DNS records. Once it exists: swap the Clerk keys on Vercel, register the production issuer in Supabase → Authentication → Third-party auth, and re-run `scripts/telegram-set-webhook.mjs` against the new domain.
- **English Telegram test coverage.** `npm run test:telegram` exercises every Arabic bot message; the English run covers linking, odometer replies, the full service-reminder button path and /status, and relies on the AR/EN parity check (same keys and placeholders) for the remaining strings (confirmation prompt, ambiguity replies).
- **Catalog intervals are general guidance.** The seeded presets use five maintenance profiles (Japanese, Korean, body-on-frame, American, Chinese) tuned for Gulf "severe" conditions, not each manufacturer's manual. Admins refine individual presets from `/admin/presets` and push changes to existing cars with "Apply intervals".
- **Body type for admin-created presets** is optional; a preset without one still appears in the catalog and registration, just not under a body-type tile.
- **Undo is one reading deep.** Only the newest odometer reading can be undone; service baselines confirmed against a mistaken reading keep that reading.

The due-service → notification bridge previously tracked here is implemented in `lib/messaging/due-services.ts`: it runs after every odometer reading (web or Telegram) and from the daily `service-reminders` cron, which also catches time-only items.
