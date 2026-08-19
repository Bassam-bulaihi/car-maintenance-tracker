"use client";

import { forwardRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, X, SearchX } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { SHOWCASE_PRESETS, BODY_TYPES, type PresetCategory } from "@/lib/home/content";
import type { ModelFilter } from "@/components/home/models-explorer";
import { PresetCard } from "@/components/home/preset-card";
import { BracketLabel } from "@/components/ui/bracket-label";
import { Reveal } from "@/components/motion/reveal";

type TabKey = "popular" | PresetCategory;

// Figma "Our Impressive Collection of Cars" (Group 124): heading + subtitle,
// a five-tab category filter, a card grid, and a trailing "See all" link.
// docs/DESIGN.md {component.category-tab} / {component.category-tab-active}.
export const PresetCollection = forwardRef<
  HTMLDivElement,
  {
    locale: Locale;
    t: Dictionary;
    filter: ModelFilter;
    onClearFilter: () => void;
  }
>(function PresetCollection({ locale, t, filter, onClearFilter }, ref) {
  const [active, setActive] = useState<TabKey>("popular");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "popular", label: t.home.collection.tabs.popular },
    { key: "sedan", label: t.home.collection.tabs.sedan },
    { key: "suv", label: t.home.collection.tabs.suv },
    { key: "hatchback", label: t.home.collection.tabs.hatchback },
    { key: "pickup", label: t.home.collection.tabs.pickup },
  ];

  // An explicit make/body selection from the grids above takes precedence
  // over the tab row; otherwise the default tab shows the full six-card
  // grid as in the Figma frame, popular models first.
  const filtered =
    filter.kind === "make"
      ? SHOWCASE_PRESETS.filter((p) => p.make === filter.value)
      : filter.kind === "body"
        ? SHOWCASE_PRESETS.filter((p) => p.category === filter.value)
        : active === "popular"
          ? [...SHOWCASE_PRESETS].sort((a, b) => Number(b.popular) - Number(a.popular))
          : SHOWCASE_PRESETS.filter((p) => p.category === active);

  const filterName =
    filter.kind === "make"
      ? filter.value
      : filter.kind === "body"
        ? (BODY_TYPES.find((b) => b.slug === filter.value)?.label[locale] ?? filter.value)
        : "";

  const upper = locale === "en" ? "uppercase tracking-[-0.02em]" : "";
  const tabCase = locale === "en" ? "uppercase tracking-[1.5px]" : "";

  return (
    <section
      ref={ref}
      id="models"
      aria-labelledby="models-heading"
      className="scroll-mt-20 border-y border-hairline bg-surface-soft/50 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-24">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <BracketLabel>{t.home.collection.eyebrow}</BracketLabel>
          <h2
            id="models-heading"
            className={`max-w-3xl text-balance text-[32px] font-bold leading-[1.02] text-on-dark sm:text-[40px] ${upper}`}
          >
            {t.home.collection.title}
          </h2>
          <p className="max-w-2xl text-pretty font-light leading-relaxed text-body">
            {t.home.collection.subtitle}
          </p>
        </Reveal>

        {filter.kind !== "none" ? (
          // Active cross-section filter — replaces the tab row so the two
          // controls can never disagree about what is on screen.
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-mono text-xs text-muted ltr:uppercase ltr:tracking-[0.08em]">
              {t.home.collection.filteredBy}
            </span>
            <button
              type="button"
              onClick={onClearFilter}
              className={`inline-flex items-center gap-2 border border-on-dark bg-on-dark px-4 py-2 text-sm font-bold text-canvas transition-colors hover:bg-transparent hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${tabCase}`}
            >
              {filterName}
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div role="tablist" aria-label={t.home.collection.title} className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => {
              const isActive = tab.key === active;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(tab.key)}
                  className={`border px-4 py-2 text-sm font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${tabCase} ${
                    isActive
                      ? "border-on-dark bg-on-dark text-canvas"
                      : "border-hairline text-body hover:border-on-dark hover:text-on-dark"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-hairline bg-surface-card/70 px-6 py-16 text-center backdrop-blur-sm">
            <SearchX className="h-9 w-9 text-muted" aria-hidden="true" />
            <p className="max-w-md text-pretty text-body">
              {filterName
                ? t.home.collection.emptyFiltered.replace("{name}", filterName)
                : t.home.collection.empty}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className={`inline-flex h-11 items-center gap-2 border border-on-dark px-6 text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${tabCase}`}
              >
                {t.home.collection.emptyCta}
              </Link>
              {filter.kind !== "none" && (
                <button
                  type="button"
                  onClick={onClearFilter}
                  className={`inline-flex h-11 items-center gap-2 border border-hairline px-6 text-sm font-bold text-body transition-colors hover:border-on-dark hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${tabCase}`}
                >
                  {t.home.collection.clearFilter}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((preset, i) => (
              <Reveal key={preset.slug} delay={Math.min(i, 3) * 70} className="flex">
                <PresetCard
                  preset={preset}
                  categoryLabel={t.home.collection.tabs[preset.category]}
                  locale={locale}
                  t={t}
                />
              </Reveal>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Link
            href="/signup"
            className={`group/see inline-flex items-center gap-2 border border-on-dark px-8 py-3 text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${tabCase}`}
          >
            {t.home.collection.seeAll}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover/see:translate-x-1 rtl:scale-x-[-1]"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
});
