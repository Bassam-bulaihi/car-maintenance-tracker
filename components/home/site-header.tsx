import Link from "next/link";
import { LogOut } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { MobileMenu } from "@/components/home/mobile-menu";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

// Figma header row: logo (left) · hamburger · Login/Register (right).
// docs/DESIGN.md {component.top-nav} — 64px canvas bar, hairline base.
// Reads the session so a signed-in visitor sees "Dashboard / Log out"
// instead of "Log in / Sign up" here too — this header is reused on every
// marketing/content page, not just the ones behind the auth wall.
export async function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);

  const links = [
    { href: "#how-it-works", label: t.home.nav.links.howItWorks },
    { href: "#models", label: t.home.nav.links.models },
    { href: "#features", label: t.home.nav.links.features },
    { href: "#testimonials", label: t.home.nav.links.testimonials },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-6">
        <Link
          href="/"
          aria-label={t.home.brand}
          className="text-on-dark transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark"
        >
          <Logo markClassName="h-8" />
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
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="outline" size="sm" locale={locale}>
                  {t.home.nav.dashboard}
                </Button>
              </Link>
              <form action={logout} className="hidden sm:block">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  locale={locale}
                  icon={<LogOut className="h-4 w-4" />}
                >
                  {t.common.logout}
                </Button>
              </form>
            </>
          ) : (
            <>
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
            </>
          )}
          <MobileMenu
            links={links}
            loginLabel={t.home.nav.login}
            signupLabel={t.home.nav.signup}
            menuLabel={t.home.nav.menu}
            closeLabel={t.home.nav.closeMenu}
            isAuthenticated={isAuthenticated}
            dashboardLabel={t.home.nav.dashboard}
            logoutLabel={t.common.logout}
            logoutAction={logout}
          />
        </div>
      </div>
    </header>
  );
}
