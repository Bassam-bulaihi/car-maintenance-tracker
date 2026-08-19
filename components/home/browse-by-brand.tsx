import type { ComponentType } from "react";
import Link from "next/link";
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
// 6-across grid (2 rows at desktop). Each card = logo mark + name.
export function BrowseByBrand({ locale, t }: { locale: Locale; t: Dictionary }) {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-20">
      <SectionHeading
        title={t.home.brands.title}
        viewAll={{ href: "/signup", label: t.home.brands.viewAll }}
        locale={locale}
      />

      <ul className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3 lg:grid-cols-6">
        {BRANDS.map((brand) => {
          const Logo = BRAND_LOGOS[brand.slug];
          return (
            <li key={brand.slug}>
              <Link
                href="/signup"
                aria-label={`${brand.name} — ${t.home.brands.cardCta}`}
                className="group flex h-full flex-col items-center justify-center gap-3 bg-surface-card px-4 py-8 transition-colors hover:bg-surface-elevated focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-on-dark"
              >
                <Logo className="h-9 w-9 text-body transition-colors group-hover:text-on-dark" />
                <span className="text-sm font-bold text-on-dark">{brand.name}</span>
                <span className="font-mono text-[11px] text-muted">
                  {nf.format(brand.modelCount)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
