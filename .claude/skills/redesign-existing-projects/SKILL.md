---
name: redesign-existing-projects
description: Project-scoped adaptation of the upstream redesign-existing-projects skill. Keeps its audit process and the parts of its checklist that don't touch typography/color/icons (states, accessibility, code quality, content realism, missing-page checks). Defers ALL visual-direction decisions to docs/design.md, which remains the sole authority.
---

# Redesign Skill (car-maintenance-tracker override)

This project's visual system is locked in `docs/design.md` and the `CLAUDE.md` hard rules — fonts, colors, icons (Lucide only), and border-radius are not open questions. This file adapts the upstream `redesign-existing-projects` skill to work under that constraint instead of overriding it. Where this file is silent, defer to `docs/design.md` — never to the upstream skill's defaults.

## Process (unchanged from upstream)
1. **Scan** — read the code, identify framework/styling method.
2. **Diagnose** — run the audit below.
3. **Fix** — targeted upgrades on the existing stack. Never rewrite from scratch.

## Kept — no conflict with docs/design.md

**Interactivity & States**
- Hover/active/pressed feedback, 200–300ms transitions.
- Visible focus rings — accessibility requirement, not optional.
- Skeleton loaders instead of generic spinners; designed empty states.
- Inline form errors, never `window.alert()`.
- No dead `#` links; active nav item visually indicated.
- Smooth-scroll; animate `transform`/`opacity`, not `top/left/width/height`.

**Content**
- Realistic names/numbers/dates, no Lorem Ipsum, no fake round numbers.
- No AI-copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen"...).
- Active voice, no "Oops!", sentence case body copy.
- Apply to both Arabic and English copy per `docs/arabic-web-design.md`.

**Code Quality**
- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`).
- No inline styles outside the project's styling system.
- Relative units, no arbitrary `z-index`, no dead/commented-out code.
- Verify every import actually exists in the project's dependencies.
- Proper meta tags (title, description, og:image).

**Strategic Omissions** — apply directly, this product needs all of these:
- Legal links, back-navigation, custom 404, form validation, skip-to-content link, cookie consent where required.

**Layout — structural half only**
- `min-height: 100dvh` over `100vh`.
- CSS Grid over flex percentage math.
- Max-width container per design.md (~1440px).
- Optical alignment fixes (baseline/CTA alignment across cards).
- Break forced symmetry only within Figma-specified structure — don't invent new asymmetric layouts design.md/Figma didn't call for.

**One typography carry-over worth keeping**
- `font-variant-numeric: tabular-nums` on odometer/mileage/date figures — a genuine fit for this data-heavy dashboard, achieved with the project's existing font, no new typeface involved.

## Struck out — do not apply (conflicts with hard rules)

- **Typography**: no font swap (Geist/Outfit/Satoshi/etc.) — fonts are fixed (Noto Sans Arabic for Arabic, design.md's face for English). No "avoid all-caps subheaders" — design.md's UPPERCASE display headline is a deliberate brand voice, not a generic AI pattern to fix.
- **Color**: no "replace pure #000 with off-black" — design.md's true-black canvas is a documented, deliberate choice. No colored/tinted shadows — design.md specifies zero drop shadows system-wide. No grain/noise/texture overlays — not in design.md's vocabulary.
- **Iconography**: no icon-set swap — Lucide only, full stop. The audit still applies for *consistency within Lucide* (uniform stroke width, avoiding the most cliché glyph when a better one exists in the set) but never for switching libraries.
- **Component patterns**: no graduated border-radius ("tighter inner, softer outer") — design.md's radius scale is binary (0 or full circular), not a gradient. No squircle avatars — not a design.md token.
