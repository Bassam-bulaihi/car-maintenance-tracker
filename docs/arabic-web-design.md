---
name: arabic-web-design
description: Expert guidelines for designing and developing high-end Arabic websites with perfect RTL support, typography, and cultural layout adaptations.
---

# Arabic Web Design & RTL Mastery Skill

## Core Philosophy
- Avoid generic "AI-generated looking" web designs. Prioritize clean, modern, and human-like aesthetic standards tailored for Arabic digital experiences.
- Arabic is written from right to left (RTL); ensure the entire layout, grid, and navigation mirror correctly without breaking LTR elements (like English numbers or code snippets).

## Typography (الخطوط والخطوط العربية)
- Use **Noto Sans Arabic** for all Arabic text — UI, editorial, and headings alike. Do not substitute another Arabic web font.
- Define proper font-scaling and line-heights (Arabic fonts often need a slightly higher `line-height` e.g., `1.6` to accommodate diacritics and vertical accents).
- Never use generic fallback fonts like Arial or Times New Roman for Arabic text.

## Layout & Direction (التخطيط واتجاه الصفحة)
- Set `dir="rtl"` and `lang="ar"` on the root `<html>` tag.
- Use logical CSS properties instead of physical ones:
  - Use `margin-inline-start` / `margin-inline-end` instead of `margin-left` / `margin-right`.
  - Use `padding-inline` and `inset-inline` for absolute positioning.
- Flexbox and Grid: Ensure `flex-direction` and grid alignments adapt naturally to RTL flow.
- Icons & Arrows: All icons come from the **Lucide** library. Flip directional icons (back, forward, chevron, arrows) horizontally in RTL mode (e.g., a right-arrow becomes a left-arrow for "Next").

## Color Palette & UI Nuances (الألوان والهوية)
- Adopt culturally resonant, balanced color palettes. Avoid over-saturated, clashing primary neon colors.
- Ensure high contrast ratios (WCAG AA compliant) for readability across all screen sizes.
- Implement subtle, purposeful micro-interactions and smooth animations (e.g., using modern CSS or transitions) to make the interface feel alive, not static.

## Content & Spacing (المحتوى والمسافات)
- Design components with flexible padding, keeping in mind that translated Arabic text can sometimes be longer or shorter than English equivalents.
- Avoid text truncation in critical areas; allow natural wrapping.
- Numbers and English terms (if mixed) must be handled carefully using `dir="ltr"` inline spans if they risk reversing order incorrectly.

