import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { BRANDS } from "@/lib/home/content";
import { SectionHeading } from "@/components/home/section-heading";

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
        {BRANDS.map((brand) => (
          <li key={brand.slug}>
            <Link
              href="/signup"
              aria-label={`${brand.name} — ${t.home.brands.cardCta}`}
              className="group flex h-full flex-col items-center justify-center gap-3 bg-surface-card px-4 py-8 transition-colors hover:bg-surface-elevated focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-on-dark"
            >
              {/* Brand logo mark stand-in — no licensed brand artwork. */}
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center border border-hairline font-mono text-base font-bold text-body transition-colors group-hover:border-on-dark group-hover:text-on-dark"
              >
                {brand.name.charAt(0)}
              </span>
              <span className="text-sm font-bold text-on-dark">{brand.name}</span>
              <span className="font-mono text-[11px] text-muted">
                {nf.format(brand.modelCount)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
