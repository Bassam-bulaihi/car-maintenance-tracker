import Link from "next/link";
import Image from "next/image";
import { Gauge, Droplet, CalendarClock, Wrench, Tag } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import type { ShowcasePreset } from "@/lib/home/content";

// Mirrors the Figma car card (Group 115): image · badge row · title+metric
// row · four-up spec strip · CTA button.
export function PresetCard({
  preset,
  categoryLabel,
  locale,
  t,
}: {
  preset: ShowcasePreset;
  categoryLabel: string;
  locale: Locale;
  t: Dictionary;
}) {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
  const specs = [
    {
      icon: Gauge,
      label: t.home.collection.specs.oilInterval,
      value: `${nf.format(preset.oilIntervalKm)} ${t.common.km}`,
    },
    { icon: Droplet, label: t.home.collection.specs.oilType, value: preset.oilType },
    {
      icon: CalendarClock,
      label: t.home.collection.specs.timeInterval,
      value: `${nf.format(preset.intervalMonths)} ${t.common.months}`,
    },
    {
      icon: Wrench,
      label: t.home.collection.specs.items,
      value: nf.format(preset.serviceItems),
    },
  ];

  return (
    <article className="flex flex-col border border-hairline bg-surface-card/70 backdrop-blur-sm transition-colors hover:border-hairline-strong">
      <div className="relative h-44 border-b border-hairline bg-surface-soft/50 backdrop-blur-sm">
        <Image
          src={`/cars/${preset.slug}.jpg`}
          alt={`${preset.make} ${preset.model} ${preset.year}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <span className="inline-flex items-center gap-2 self-start border border-hairline px-2 py-1 font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.08em]">
          <Tag className="h-3 w-3" aria-hidden="true" />
          {categoryLabel}
        </span>

        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-bold text-on-dark">
            {preset.make} {preset.model}
          </h3>
          <span className="font-mono text-sm text-body">{preset.year}</span>
        </div>

        <dl className="grid grid-cols-2 gap-px border border-hairline bg-hairline/60">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-center gap-2 bg-surface-card/70 backdrop-blur-sm px-3 py-2.5">
              <spec.icon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              <div className="flex min-w-0 flex-col">
                <dt className="truncate font-mono text-[10px] text-muted ltr:uppercase ltr:tracking-[0.06em]">
                  {spec.label}
                </dt>
                <dd className="truncate font-mono text-sm font-bold text-on-dark">{spec.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <Link
          href="/signup"
          className={`mt-auto flex h-11 items-center justify-center border border-on-dark text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${
            locale === "en" ? "uppercase tracking-[1.5px]" : ""
          }`}
        >
          {t.home.collection.cardCta}
        </Link>
      </div>
    </article>
  );
}
