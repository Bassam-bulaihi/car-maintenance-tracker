---
name: industrial-brutalist-ui
description: Project-scoped adaptation of the upstream industrial-brutalist-ui skill. The upstream skill IS a competing visual system (own palette, own font stack, ASCII/scanline/halftone decoration) and cannot be applied wholesale here. This file keeps only the handful of implementation techniques that already agree with docs/design.md's BMW-M system; the aesthetic itself is dropped.
---

# Industrial Brutalist UI (car-maintenance-tracker override)

Upstream's core idea is a full aesthetic, not a neutral technique set — its own palette (Swiss-print paper/carbon-ink/hazard-red, or CRT dark/phosphor-white/hazard-red/terminal-green), its own font stack, and its own decorative language (ASCII framing, scanlines, halftone). `docs/design.md` already owns this project's aesthetic (BMW-M dark canvas, M-tricolor accent used only as a sparing stripe, Lucide icons, no invented tokens), so upstream cannot be used for visual direction here. What's kept below is technique-level only — things that carry no palette or font of their own.

## Kept — pure technique, no palette/font attached

- **Zero border-radius rigor.** Upstream's "absolute rejection of border-radius, corners exactly 90°" already matches design.md's `{rounded.none}` default. Treat this as reinforcement of the existing rule, not new instruction — the exception (circular icon buttons, `{rounded.full}`) is still defined by design.md, not by this skill.
- **Grid-line hairline technique.** `display: grid; gap: 1px` with a contrasting parent background showing through the gap is a clean way to render design.md's `{colors.hairline}` dividers between cells (e.g. spec-cell tables, service-item rows) without stacking border declarations.
- **Tabular data discipline.** `font-variant-numeric: tabular-nums` on odometer/mileage columns, and semantic tags (`<data>`, `<dl>`) for machine-readable numeric values — a good fit for this dashboard's data density, using the existing font, no monospace typeface added.

## Dropped entirely — this is the skill's actual identity, and it's a competing design system

- Both visual archetypes (Swiss Industrial Print and Tactical Telemetry/CRT) — their own background/foreground/accent palettes, hazard-red, terminal-green.
- The full font stack (Neue Haas Grotesk, JetBrains Mono, Playfair Display, etc.) — none of these are in the project's font set.
- ASCII framing (`[ DELIVERY SYSTEMS ]`, crosshairs, `>>>`), scanlines, halftone/dithering, noise overlays — decorative language design.md explicitly rejects ("never adds atmospheric backdrops, gradients, or decoration").
- Monospace-everywhere typographic voice — conflicts with design.md's BMW Type Next Latin pairing (700 display / 300 body).

If a genuine telemetry/blueprint aesthetic is ever wanted for a specific screen, that's a change to propose against `docs/design.md` with the user first — not something this skill introduces unilaterally.
