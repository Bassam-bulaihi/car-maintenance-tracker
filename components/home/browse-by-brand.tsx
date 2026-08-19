"use client";

import type { ComponentType } from "react";
import {
  SiToyota,
  SiHyundai,
  SiNissan,
  SiKia,
  SiHonda,
  SiFord,
  SiChevrolet,
  SiMazda,
  SiMitsubishi,
  SiSuzuki,
  SiJeep,
  SiVolkswagen,
} from "react-icons/si";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { BRANDS } from "@/lib/home/content";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";

const BRAND_LOGOS: Record<string, ComponentType<{ className?: string }>> = {
  toyota: SiToyota,
  hyundai: SiHyundai,
  nissan: SiNissan,
  kia: SiKia,
  honda: SiHonda,
  ford: SiFord,
  chevrolet: SiChevrolet,
  mazda: SiMazda,
  mitsubishi: SiMitsubishi,
  suzuki: SiSuzuki,
  jeep: SiJeep,
  volkswagen: SiVolkswagen,
};

// Figma "Rent by Brands": heading + View-all, then 12 uniform cards in a
// 6-across grid. Each card filters the model collection below.
export function BrowseByBrand({
  locale,
  t,
  availableMakes,
  activeMake,
  onSelect,
  onClear,
}: {
  locale: Locale;
  t: Dictionary;
  availableMakes: Set<string>;
  activeMake: string | null;
  onSelect: (make: string) => void;
  onClear: () => void;
}) {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-20">
      <Reveal>
        <SectionHeading
          title={t.home.brands.title}
          viewAll={
            activeMake
              ? { label: t.home.collection.clearFilter, onClick: onClear }
              : { href: "#models", label: t.home.brands.viewAll }
          }
          locale={locale}
        />
      </Reveal>

      <ul className="grid grid-cols-2 gap-px bg-hairline/60 sm:grid-cols-3 lg:grid-cols-6">
        {BRANDS.map((brand, i) => {
          const Logo = BRAND_LOGOS[brand.slug];
          const isActive = activeMake === brand.name;
          const ready = availableMakes.has(brand.name);
          return (
            <Reveal as="li" key={brand.slug} delay={Math.min(i, 5) * 45}>
              <button
                type="button"
                onClick={() => onSelect(brand.name)}
                aria-pressed={isActive}
                className={`group flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-8 transition-[background-color,transform] duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${
                  isActive
                    ? "bg-surface-elevated/90"
                    : "bg-surface-card/70 backdrop-blur-sm hover:bg-surface-elevated/80"
                }`}
              >
                <Logo
                  className={`h-9 w-9 transition-[color,transform] duration-200 group-hover:scale-110 ${
                    isActive ? "text-on-dark" : "text-body group-hover:text-on-dark"
                  }`}
                />
                <span className="text-sm font-bold text-on-dark">{brand.name}</span>
                {ready ? (
                  <span className="font-mono text-[11px] text-muted">
                    {nf.format(brand.modelCount)}
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
