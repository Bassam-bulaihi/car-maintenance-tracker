# Car Maintenance Tracker(Car auto)

Next.js + Supabase + Twilio (WhatsApp).

## Required reading — read before writing any code

@AGENTS.md
@docs/PRD.md
@docs/DESIGN.md
@docs/arabic-web-design.md

## Hard rules

1. Follow `docs/design.md` for all 
2. Anything not covered by 1 and must be derived from them
3. Fonts are project-supplied (Arabic: Noto Sans Arabic; English: per `docs/design.md`) — do not choose or add any. Icons: **Lucide** is the default UI icon set, but other icon sets, brand logos, and imagery are allowed where they serve the design (e.g. real brand marks in the footer and brand grid). Relaxed by the project owner on 2026-08-19; it supersedes the stricter "Lucide exclusively" rule that still appears in `docs/PRD.md` §0 rule 4.
4. WhatsApp messaging goes through **Twilio's Programmable Messaging API** (WhatsApp channel + Content API for templates), not Meta's Cloud API directly. All messaging goes through `lib/messaging/`. Relaxed by the project owner on 2026-08-20; it supersedes `docs/PRD.md` §0 rule 5 and §7, which still describe direct Meta Cloud API integration (Graph API endpoint, System User token, `X-Hub-Signature-256`, wamid) — read those sections for the *behavioral* requirements (cadence config, tolerant reply parsing, dedup, signed webhooks, AR/EN templates) but substitute Twilio's mechanics (`MessageSid` instead of wamid, `X-Twilio-Signature` instead of `X-Hub-Signature-256`, Content API template SIDs instead of Meta template names) wherever the PRD names a Meta-specific detail.
(No live Twilio account is wired up yet — the integration is built against the Twilio SDK/API contract so it's ready once real credentials are added to `.env.local`.)

5. Never commit secrets. `.env.local` is gitignored

## Design source of truth

- **Design system:** @docs/design.md
- **home page:** Figma — https://www.figma.com/design/JxcmKnTFJ0msLzFGN1a9cs/LUXEDRIVE--Car-Rental-Landing-Page--Community-?node-id=1-2826&t=eE2PWMIHmHzkM3lt-4

Read the Figma file via the Figma MCP before implementing any screen.