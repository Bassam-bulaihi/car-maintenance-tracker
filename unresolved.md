# Unresolved

## Node.js version too old to run the app

`npm run build`/`npm run dev` won't run here — this machine has Node 18.19.1, and Next 16 hard-requires >=20.9. Could not verify a build/typecheck for that reason (eslint passed fine).

You'll need to upgrade Node before running the app.

## Non-admin-vs-admin RLS check not verified live

Live-tested the admin write path (create preset, add service item, read with embedded items) directly against the Supabase project. Wanted to also confirm, with a real non-admin session, that RLS blocks that user from writing to `vehicle_presets`/`preset_service_items` — but signing up a second throwaway test user hit Supabase's signup rate limit (`over_email_send_rate_limit`) from the earlier auth smoke tests in the same session.

The policy logic itself was already confirmed clean by `supabase db advisors` when the schema was built (RLS admin-write policies gated on `app_metadata.role`, no anon/authenticated over-grants). This just means the specific "log in as a non-admin and try to PATCH a preset, expect it blocked" request/response pair hasn't been observed directly — worth a quick live check next time rate limits reset, before relying on the admin UI in front of real users.
