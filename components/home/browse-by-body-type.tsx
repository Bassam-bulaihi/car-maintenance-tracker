"use client";

import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { BODY_TYPES } from "@/lib/home/content";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { BODY_TYPE_ICONS } from "@/components/icons/body-type-icons";

// Figma "Rent by body type": same 12-card / 6-across structure as the
// brand grid, with a silhouette icon instead of a logo mark. Lucide has no
// per-body-type car glyphs, so each card renders its own hand-drawn
// silhouette (docs/DESIGN.md rule 3 allows non-Lucide icons where Lucide
// doesn't cover the shape) instead of the same handful of icons repeated.

export function BrowseByBodyType({
  locale,
  t,
  availableBodies,
  activeBody,
  onSelect,
  onClear,
}: {
  locale: Locale;
  t: Dictionary;
  availableBodies: Set<string>;
  activeBody: string | null;
  onSelect: (body: string) => void;
  onClear: () => void;
}) {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-20">
      <Reveal>
        <SectionHeading
          title={t.home.bodyTypes.title}
          viewAll={
            activeBody
              ? { label: t.home.collection.clearFilter, onClick: onClear }
              : { href: "#models", label: t.home.bodyTypes.viewAll }
          }
          locale={locale}
        />
      </Reveal>

      <ul className="grid grid-cols-2 gap-px bg-hairline/60 sm:grid-cols-3 lg:grid-cols-6">
        {BODY_TYPES.map((type, i) => {
          const Icon = BODY_TYPE_ICONS[type.slug];
          const isActive = activeBody === type.slug;
          const ready = availableBodies.has(type.slug);
          return (
            <Reveal as="li" key={type.slug} delay={Math.min(i, 5) * 45}>
              <button
                type="button"
                onClick={() => onSelect(type.slug)}
                aria-pressed={isActive}
                className={`group flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-8 transition-[background-color,transform] duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${
                  isActive
                    ? "bg-surface-elevated/90"
                    : "bg-surface-card/70 backdrop-blur-sm hover:bg-surface-elevated/80"
                }`}
              >
                <Icon
                  className={`h-8 w-8 transition-[color,transform] duration-200 group-hover:scale-110 ${
                    isActive ? "text-on-dark" : "text-muted group-hover:text-on-dark"
                  }`}
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-bold text-on-dark">{type.label[locale]}</span>
                {ready ? (
                  <span className="font-mono text-[11px] text-muted">
                    {nf.format(type.modelCount)}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.06em]">
                    {t.home.brands.soon}
                  </span>
                )}
              </button>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
