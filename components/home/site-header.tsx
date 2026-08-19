import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { MobileMenu } from "@/components/home/mobile-menu";
import { Button } from "@/components/ui/button";

// Figma header row: logo (left) · hamburger · Login/Register (right).
// docs/DESIGN.md {component.top-nav} — 64px canvas bar, hairline base.
export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    { href: "#how-it-works", label: t.home.nav.links.howItWorks },
    { href: "#models", label: t.home.nav.links.models },
    { href: "#features", label: t.home.nav.links.features },
    { href: "#testimonials", label: t.home.nav.links.testimonials },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-on-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark"
        >
          {t.home.brand}
        </Link>

        <nav aria-label={t.home.nav.menu} className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm text-body transition-colors hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark ${
                locale === "en" ? "uppercase tracking-[0.5px]" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle locale={locale} />
          <Link href="/login" className="hidden sm:block">
            <Button variant="outline" size="sm" locale={locale}>
              {t.home.nav.login}
            </Button>
          </Link>
          <Link href="/signup" className="hidden sm:block">
            <Button size="sm" locale={locale}>
              {t.home.nav.signup}
            </Button>
          </Link>
          <MobileMenu
            links={links}
            loginLabel={t.home.nav.login}
            signupLabel={t.home.nav.signup}
            menuLabel={t.home.nav.menu}
            closeLabel={t.home.nav.closeMenu}
          />
        </div>
      </div>
    </header>
  );
}
