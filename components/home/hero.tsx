import Link from "next/link";
import { Car } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";

// Figma hero band (y 0–833): full-bleed photo band with the headline
// overlaid, per docs/DESIGN.md {component.hero-photo-band}.
export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  const upper = locale === "en" ? "uppercase tracking-[-0.02em]" : "";

  return (
    <section className="relative isolate overflow-hidden border-b border-hairline">
      {/* Photo band stand-in — the design's `image 23` node. */}
      <div
        role="img"
        aria-label={t.home.hero.imageAlt}
        className="absolute inset-0 -z-10 flex items-center justify-center bg-surface-soft"
      >
        <Car className="h-64 w-64 text-hairline" aria-hidden="true" strokeWidth={0.75} />
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-6 px-6 py-24 md:py-32">
        <BracketLabel>{t.home.hero.eyebrow}</BracketLabel>

        <h1
          className={`max-w-4xl text-balance text-[44px] font-bold leading-[0.98] text-on-dark sm:text-[64px] lg:text-[80px] ${upper}`}
        >
          {t.home.hero.titleLine1}
          <br />
          {t.home.hero.titleLine2}
        </h1>

        <p className="max-w-xl text-pretty text-lg font-light leading-relaxed text-body-strong">
          {t.home.hero.subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link href="/signup">
            <Button locale={locale}>{t.home.cta.primary}</Button>
          </Link>
          <Link href="#how-it-works">
            <Button variant="outline" locale={locale}>
              {t.home.cta.secondary}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
