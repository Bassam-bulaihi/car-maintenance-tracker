import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { BracketLabel } from "@/components/ui/bracket-label";
import { MStripeDivider } from "@/components/layout/m-stripe-divider";

// Figma pre-footer band (Frame "10"): a two-line title with a pair of
// action buttons. The design's App Store / Google Play pair becomes the
// two real entry points this product has.
export function CtaBand({ locale, t }: { locale: Locale; t: Dictionary }) {
  const upper = locale === "en" ? "uppercase tracking-[-0.02em]" : "";
  const btnCase = locale === "en" ? "uppercase tracking-[1.5px]" : "";

  return (
    <section aria-labelledby="cta-heading" className="border-t border-hairline">
      <MStripeDivider />
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-20 text-center">
        <BracketLabel>{t.home.cta.eyebrow}</BracketLabel>
        <h2
          id="cta-heading"
          className={`max-w-2xl text-balance text-[32px] font-bold leading-[1.02] text-on-dark sm:text-[40px] ${upper}`}
        >
          {t.home.cta.title}
        </h2>
        <p className="max-w-xl text-pretty font-light text-body">{t.home.cta.subtitle}</p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/signup"
            className={`inline-flex h-12 items-center gap-2 border border-on-dark bg-on-dark px-8 text-sm font-bold text-canvas transition-colors hover:bg-transparent hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${btnCase}`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t.home.cta.primary}
          </Link>
          <Link
            href="#how-it-works"
            className={`inline-flex h-12 items-center gap-2 border border-hairline px-8 text-sm font-bold text-body transition-colors hover:border-on-dark hover:bg-on-dark hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${btnCase}`}
          >
            {t.home.cta.secondary}
            <ArrowRight className="h-4 w-4 rtl:scale-x-[-1]" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
