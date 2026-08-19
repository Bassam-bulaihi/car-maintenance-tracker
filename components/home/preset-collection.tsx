"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { SHOWCASE_PRESETS, type PresetCategory } from "@/lib/home/content";
import { PresetCard } from "@/components/home/preset-card";
import { BracketLabel } from "@/components/ui/bracket-label";

type TabKey = "popular" | PresetCategory;

// Figma "Our Impressive Collection of Cars" (Group 124): heading + subtitle,
// a five-tab category filter, a card grid, and a trailing "See all" link.
// docs/DESIGN.md {component.category-tab} / {component.category-tab-active}.
export function PresetCollection({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [active, setActive] = useState<TabKey>("popular");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "popular", label: t.home.collection.tabs.popular },
    { key: "sedan", label: t.home.collection.tabs.sedan },
    { key: "suv", label: t.home.collection.tabs.suv },
    { key: "hatchback", label: t.home.collection.tabs.hatchback },
    { key: "pickup", label: t.home.collection.tabs.pickup },
  ];

  const visible = SHOWCASE_PRESETS.filter((p) =>
    active === "popular" ? p.popular : p.category === active,
  );

  const upper = locale === "en" ? "uppercase tracking-[-0.02em]" : "";
  const tabCase = locale === "en" ? "uppercase tracking-[1.5px]" : "";

  return (
    <section
      id="models"
      aria-labelledby="models-heading"
      className="scroll-mt-20 border-y border-hairline bg-surface-soft"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-24">
        <div className="flex flex-col items-center gap-3 text-center">
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
        </div>

        {/* Category tabs */}
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
                className={`border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${tabCase} ${
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

        {visible.length === 0 ? (
          <p className="py-12 text-center text-body">{t.home.collection.empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((preset) => (
              <PresetCard
                key={preset.slug}
                preset={preset}
                categoryLabel={t.home.collection.tabs[preset.category]}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Link
            href="/signup"
            className={`inline-flex items-center gap-2 border border-on-dark px-8 py-3 text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${tabCase}`}
          >
            {t.home.collection.seeAll}
            <ArrowRight className="h-4 w-4 rtl:scale-x-[-1]" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
