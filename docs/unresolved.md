# Unresolved / deferred work

Things intentionally left out of the current build, so they aren't mistaken for bugs or forgotten.

## WhatsApp is send-only — replies are not processed (decided 2026-08-20)

**Decision by the project owner:** WhatsApp carries *notifications only*. All
data entry (odometer readings, "تم التغيير" confirmations) happens on the
website. This supersedes `docs/PRD.md` §5.3/§5.5/§7.3's two-way reply flow —
read those sections for the *cadence and evaluation* requirements, but not
for the inbound-reply mechanics.

**What that means in code:**
- Every outbound template ends with a deep link to the exact page the user
  needs — `lib/config.ts`'s `vehicleDeepLink()` →
  `/dashboard/vehicles/<id>`. Verified: signed out, that URL 307s to
  `/login?next=/dashboard/vehicles/<id>`, so the user lands on their own car
  right after logging in.
- `lib/messaging/inbound.ts` no longer writes anything from an inbound
  message. It dedupes on `MessageSid`, then replies with the deep link —
  wording differs slightly if the message parses as a real reply attempt
  ("25000", "تم") versus something unrecognized, but both just point at the
  site.
- Quick-reply buttons are gone from the outbound copy; the templates must
  *not* ask the user to reply.

**To re-enable two-way later:** `lib/messaging/reply-parser.ts` is still
correct and still used (for wording), and `markServiceDone()` /
`evaluateDueServicesForVehicle()` already do the DB work the reply path
would need — reinstating it is mostly re-adding the branches removed from
`inbound.ts`.

## Twilio account is on Trial — blocks the real templates (2026-08-20)

The messaging code is complete but **cannot be run end-to-end on the current
Twilio account.** Verified live against the API:

| Operation | Result on this trial account |
|---|---|
| Send with an existing `ContentSid` | ✅ works (`201`, `queued`; messages arrive) |
| Send free-form (`Body`) outside the 24h window | ❌ `21654 ContentSid Required` |
| Create a Content template | ❌ `20003` — requires upgrade |
| List Content templates | ❌ `20003` — requires upgrade |
| Read a message's delivery status | ❌ `20003` — requires upgrade |
| WhatsApp Senders API | ❌ `20003` — requires upgrade |

**Consequence:** the four `TWILIO_CONTENT_SID_*` templates the code expects
can't be created until the account is upgraded, so `sendOdometerRequest` /
`sendServiceDueNotification` will throw `Missing TWILIO_CONTENT_SID_…` until
then. Nothing in the app code needs to change when that happens — register
the four templates (odometer_request + service_due, each AR and EN), each
ending in a link variable, and set the env vars.

**Template copy must match the variable order in
`lib/messaging/templates.ts`:**
- `odometer_request` — `{{1}}` vehicle, `{{2}}` link
- `service_due` — `{{1}}` vehicle, `{{2}}` service, `{{3}}` link

**Testing without upgrading:** inside a 24-hour session window (opened when
the user sends *any* WhatsApp message to the sandbox number), free-form
sends are accepted — enough to verify copy and links, not the templates
themselves.

## Node.js version on the dev machine

Local Node is 18.19.1; this Next.js version requires >=20.9, so `next
dev`/`next build` can't run here. Typecheck (`tsc --noEmit`) and `eslint`
both run fine and are clean. See the root `unresolved.md` for the rest of
that environment note.
