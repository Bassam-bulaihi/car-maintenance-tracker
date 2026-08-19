import { UserPlus, MessageCircle, CheckCircle2, Compass } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { SectionHeading } from "@/components/home/section-heading";
import { ImageSlot } from "@/components/home/image-slot";

const STEP_ICONS = [UserPlus, MessageCircle, CheckCircle2];

// Figma "How it woks" (Group 125): heading block, three numbered step
// cards each carrying an icon badge, and a supporting image to the side.
export function HowItWorks({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="mx-auto flex w-full max-w-[1440px] scroll-mt-20 flex-col gap-10 px-6 py-24"
    >
      <SectionHeading
        id="how-it-works-heading"
        eyebrow={t.home.howItWorks.eyebrow}
        title={t.home.howItWorks.title}
        subtitle={t.home.howItWorks.subtitle}
        locale={locale}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
        <ol className="grid grid-cols-1 gap-px bg-hairline">
          {t.home.howItWorks.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <li
                key={step.title}
                className="grid grid-cols-[auto_auto_1fr] items-start gap-5 bg-surface-card p-6"
              >
                <span className="font-mono text-sm text-muted" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-hairline">
                  <Icon className="h-5 w-5 text-on-dark" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-on-dark">{step.title}</h3>
                  <p className="text-pretty font-light leading-relaxed text-body">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <ImageSlot
          label={t.home.howItWorks.imageAlt}
          icon={Compass}
          className="min-h-[240px] lg:min-h-full"
          iconClassName="h-16 w-16"
        />
      </div>
    </section>
  );
}
