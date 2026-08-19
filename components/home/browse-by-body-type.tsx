import Link from "next/link";
import { Car, Truck, Caravan, CarFront } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { BODY_TYPES } from "@/lib/home/content";
import { SectionHeading } from "@/components/home/section-heading";

// Figma "Rent by body type": same 12-card / 6-across structure as the
// brand grid, with a silhouette icon instead of a logo mark.
const ICONS = [Car, Truck, CarFront, Truck, Car, CarFront, Caravan, Car, CarFront, Car, Caravan, Truck];

export function BrowseByBodyType({ locale, t }: { locale: Locale; t: Dictionary }) {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-20">
      <SectionHeading
        title={t.home.bodyTypes.title}
        viewAll={{ href: "/signup", label: t.home.bodyTypes.viewAll }}
        locale={locale}
      />

      <ul className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3 lg:grid-cols-6">
        {BODY_TYPES.map((type, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li key={type.slug}>
              <Link
                href="/signup"
                className="group flex h-full flex-col items-center justify-center gap-3 bg-surface-card px-4 py-8 transition-colors hover:bg-surface-elevated focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-on-dark"
              >
                <Icon
                  className="h-8 w-8 text-muted transition-colors group-hover:text-on-dark"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
                <span className="text-sm font-bold text-on-dark">{type.label[locale]}</span>
                <span className="font-mono text-[11px] text-muted">
                  {nf.format(type.modelCount)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
