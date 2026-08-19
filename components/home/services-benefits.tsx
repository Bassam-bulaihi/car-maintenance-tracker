import Link from "next/link";
import { BellRing, Layers, Languages, ArrowRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";

const FEATURE_ICONS = [BellRing, Layers, Languages];
const FEATURE_HREFS = ["#how-it-works", "/signup", "#top"];

// Figma "Our Services & Benefits" (Group 110): centered heading, then a
// three-up Container/Content grid where each _Feature text block carries a
// featured icon, a text + supporting text pair, and a trailing text button.
export function ServicesBenefits({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-y border-hairline bg-surface-soft/50 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1440px] scroll-mt-20 flex-col gap-12 px-6 py-24">
        <Reveal>
        <SectionHeading
          id="features-heading"
          eyebrow={t.home.features.eyebrow}
          title={t.home.features.title}
          subtitle={t.home.features.subtitle}
          locale={locale}
          align="center"
        />
        </Reveal>

        <div className="grid grid-cols-1 gap-px bg-hairline/60 md:grid-cols-3">
          {t.home.features.items.map((item, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <Reveal
                as="article"
                key={item.title}
                delay={i * 90}
                className="flex flex-col items-start gap-4 bg-surface-soft/50 p-8 backdrop-blur-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center border border-hairline">
                  <Icon className="h-6 w-6 text-on-dark" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-on-dark">{item.title}</h3>
                <p className="text-pretty font-light leading-relaxed text-body">{item.desc}</p>
                <Link
                  href={FEATURE_HREFS[i]}
                  className={`mt-auto inline-flex items-center gap-2 pt-2 text-sm font-bold text-on-dark transition-colors hover:text-body focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark ${
                    locale === "en" ? "uppercase tracking-[1.5px]" : ""
                  }`}
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4 rtl:scale-x-[-1]" aria-hidden="true" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
