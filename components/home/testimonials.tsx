"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Quote, User } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { Reveal } from "@/components/motion/reveal";
import { BracketLabel } from "@/components/ui/bracket-label";

// Figma testimonial block: heading, a pair of circular prev/next arrow
// buttons (docs/DESIGN.md {component.carousel-arrow} — the one place
// {rounded.full} is allowed), the quote, and an avatar + name + location.
export function Testimonials({ locale, t }: { locale: Locale; t: Dictionary }) {
  const items = t.home.testimonials.items;
  const [index, setIndex] = useState(0);
  const current = items[index];

  const go = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);
  const upper = locale === "en" ? "uppercase tracking-[-0.02em]" : "";

  const arrowClass =
    "flex h-12 w-12 items-center justify-center rounded-full border border-hairline text-on-dark transition-colors hover:border-on-dark hover:bg-on-dark hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px";

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="mx-auto flex w-full max-w-[1440px] scroll-mt-20 flex-col gap-8 px-6 py-24"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <BracketLabel>{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</BracketLabel>
          <h2
            id="testimonials-heading"
            className={`text-balance text-[32px] font-bold leading-[1.02] text-on-dark sm:text-[40px] ${upper}`}
          >
            {t.home.testimonials.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => go(-1)} aria-label={t.home.testimonials.prev} className={arrowClass}>
            <ArrowLeft className="h-5 w-5 rtl:scale-x-[-1]" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label={t.home.testimonials.next} className={arrowClass}>
            <ArrowRight className="h-5 w-5 rtl:scale-x-[-1]" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Reveal as="figure" className="flex flex-col gap-8 border border-hairline bg-surface-card/70 backdrop-blur-sm p-8 sm:p-12">
        <Quote className="h-8 w-8 text-hairline rtl:scale-x-[-1]" aria-hidden="true" />
        <blockquote className="text-pretty text-xl font-light leading-relaxed text-body-strong sm:text-2xl">
          {current.quote}
        </blockquote>
        <figcaption className="flex items-center gap-4 border-t border-hairline pt-6">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center border border-hairline bg-surface-elevated/80"
          >
            <User className="h-5 w-5 text-muted" />
          </span>
          <span className="flex flex-col">
            <span className="font-bold text-on-dark">{current.name}</span>
            <span className="font-mono text-xs text-muted">{current.location}</span>
          </span>
        </figcaption>
      </Reveal>
    </section>
  );
}
