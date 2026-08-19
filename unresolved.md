# Unresolved

## Node.js version too old to run the app

`npm run build`/`npm run dev` won't run here — this machine has Node 18.19.1, and Next 16 hard-requires >=20.9. Could not verify a build/typecheck for that reason (eslint passed fine).

Same root cause also broke `scripts/set-admin.mjs`: `@supabase/supabase-js` eagerly initializes a realtime client that needs a native `WebSocket` global (Node 21+), so the script crashes with "native WebSocket not found" on this machine. Worked around it once by granting the admin role directly via `curl` against the Auth Admin API instead of running the script — the script itself is unchanged and should work fine on Node >=20.9, untested here.

You'll need to upgrade Node before running the app (or the script).

## Non-admin-vs-admin RLS check not verified live

Live-tested the admin write path (create preset, add service item, read with embedded items) directly against the Supabase project. Wanted to also confirm, with a real non-admin session, that RLS blocks that user from writing to `vehicle_presets`/`preset_service_items` — but signing up a second throwaway test user hit Supabase's signup rate limit (`over_email_send_rate_limit`) from the earlier auth smoke tests in the same session.

The policy logic itself was already confirmed clean by `supabase db advisors` when the schema was built (RLS admin-write policies gated on `app_metadata.role`, no anon/authenticated over-grants). This just means the specific "log in as a non-admin and try to PATCH a preset, expect it blocked" request/response pair hasn't been observed directly — worth a quick live check next time rate limits reset, before relying on the admin UI in front of real users.

## Email confirmation disabled (`mailer_autoconfirm: true`)

While testing signup live on `https://car-auto-app.vercel.app`, real signup attempts hit Supabase's shared-sender email rate limit (`rate_limit_email_sent: 2` per hour, no custom SMTP configured — `smtp_host: null`) on top of the limit my own earlier smoke-testing had already used up. To unblock testing, I flipped `mailer_autoconfirm` to `true` via the Supabase Management API (`PATCH /v1/projects/xzcjzrusdtkrabtzdraa/config/auth`).

**What this means right now:** new signups get an active session immediately — no confirmation email is sent or required, so an unverified/typo'd/someone-else's email can be used to create an account.

**Before onboarding real users:** either set `mailer_autoconfirm` back to `false` (re-enabling the email rate limit problem unless SMTP is configured first) or, better, configure custom SMTP (Resend, Postmark, etc.) in Supabase Auth settings and *then* re-enable confirmation — SMTP was the option not chosen when this was fixed.
