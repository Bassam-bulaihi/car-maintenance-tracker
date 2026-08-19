# Car Maintenance Tracker(Car auto)

Next.js + Supabase + Meta WhatsApp Cloud API.

## Required reading — read before writing any code

@AGENTS.md
@docs/PRD.md
@docs/DESIGN.md
@docs/arabic-web-design.md

## Hard rules

1. Follow `docs/design.md` for all styling. Never invent tokens, colors, or spacing.
2. Anything not covered by 1 and 2 must be derived from them — never invented.
3. Fonts are project-supplied (Arabic: Noto Sans Arabic; English: per `docs/design.md`) — do not choose or add any. Icons: **Lucide** is the default UI icon set, but other icon sets, brand logos, and imagery are allowed where they serve the design (e.g. real brand marks in the footer and brand grid). Relaxed by the project owner on 2026-08-19; it supersedes the stricter "Lucide exclusively" rule that still appears in `docs/PRD.md` §0 rule 4.
4. WhatsApp is Meta Cloud API only. All messaging goes through `lib/messaging/`.
(You don't have the connection right now so you need to work as we will it will all work in the future)

5. Never commit secrets. `.env.local` is gitignored

## Design source of truth

- **Design system:** @docs/design.md
- **home page:** Figma — https://www.figma.com/design/JxcmKnTFJ0msLzFGN1a9cs/LUXEDRIVE--Car-Rental-Landing-Page--Community-?node-id=1-2826&t=eE2PWMIHmHzkM3lt-4

Read the Figma file via the Figma MCP before implementing any screen.