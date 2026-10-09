# Car Maintenance Tracker(Car auto)

Next.js + Supabase + Clerk + Telegram bot.

## Required reading — read before writing any code

@AGENTS.md
@docs/PRD.md
@docs/DESIGN.md
@docs/arabic-web-design.md

## Hard rules

1. Follow `docs/design.md` for all 
2. Anything not covered by 1 and must be derived from them
3. Fonts are project-supplied (Arabic: Noto Sans Arabic; English: per `docs/design.md`) — do not choose or add any. Icons: **Lucide** is the default UI icon set, but other icon sets, brand logos, and imagery are allowed where they serve the design (e.g. real brand marks in the footer and brand grid). Relaxed by the project owner on 2026-08-19; it supersedes the stricter "Lucide exclusively" rule that still appears in `docs/PRD.md` §0 rule 4.
4. Messaging is a **Telegram bot** (Bot API, `lib/messaging/telegram-client.ts`), two-way: odometer requests are answered by replying with a number (validated, PRD §5.3/§7.5), service reminders carry inline Done / Not done buttons, typed "تم / لم يتم / done / not done" are tolerated, bad input gets a clarification and is flagged after `MAX_REPLY_ATTEMPTS`. Users link their chat from the account page via a one-time `t.me/<bot>?start=<token>` deep link. The webhook (`app/api/telegram/webhook`) is authenticated by `X-Telegram-Bot-Api-Secret-Token`, acks immediately and processes in `after()`, and dedupes on `update_id`. All messaging goes through `lib/messaging/`. Changed by the project owner on 2026-10-09 (WhatsApp/Twilio removed entirely); it supersedes `docs/PRD.md` §0 rule 5, §7 and §8's Meta WhatsApp Cloud API details — read those for the *behavioral* requirements only. `npm run test:telegram` runs every message/reply scenario end to end against a mock Bot API; `scripts/telegram-dev-bridge.mjs` forwards real bot updates to localhost.
5. Never commit secrets. `.env.local` is gitignored
6. Auth is **Clerk** (custom sign-in/sign-up forms on Clerk's hooks in `components/auth/`), with Supabase kept as the database via its Clerk third-party auth integration. RLS identifies users by `auth.jwt() ->> 'sub'` (the Clerk user ID; `public.users.id` is `text`), admin role comes from the session-token claim `app_metadata.role` mapped from Clerk `publicMetadata.role`, and server code gets the user through `lib/auth/session.ts` / `lib/auth/profile.ts`. Changed by the project owner on 2026-10-09; it supersedes the "Supabase Auth" wording in `docs/PRD.md` §5.1.

## Design source of truth

- **Design system:** @docs/design.md
- **home page:** Figma — https://www.figma.com/design/JxcmKnTFJ0msLzFGN1a9cs/LUXEDRIVE--Car-Rental-Landing-Page--Community-?node-id=1-2826&t=eE2PWMIHmHzkM3lt-4

Read the Figma file via the Figma MCP before implementing any screen.