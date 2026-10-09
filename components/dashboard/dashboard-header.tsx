import Link from "next/link";
import { LogOut, Shield, UserCog } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { MStripeDivider } from "@/components/layout/m-stripe-divider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { LogoutButton } from "@/components/auth/logout-button";

// Shared by every /dashboard/* page (app/dashboard/layout.tsx) so the
// account, vehicle and registration pages keep the same way out and back.
// Below `sm` the actions collapse to icon-only buttons (labels stay as
// aria-labels) so the bar never overflows a phone screen.
export function DashboardHeader({
  name,
  isAdmin,
  locale,
  t,
}: {
  name: string | null;
  isAdmin: boolean;
  locale: Locale;
  t: Dictionary;
}) {
  const label = (text: string) => <span className="hidden sm:inline">{text}</span>;

  return (
    <>
      <MStripeDivider />
      <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/dashboard"
            aria-label={t.dashboard.vehiclesTitle}
            className="shrink-0 text-on-dark transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark"
          >
            <Logo markClassName="h-7" />
          </Link>
          <span className="hidden h-6 w-px bg-hairline md:block" aria-hidden="true" />
          <span className="hidden truncate text-[15px] font-bold text-on-dark md:inline">
            {t.dashboard.welcome}
            {name ? `${locale === "ar" ? "،" : ","} ${name}` : ""}
          </span>
        </div>
        <nav aria-label={t.account.navLabel} className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageToggle locale={locale} />
          <ButtonLink href="/dashboard/account" aria-label={t.account.navLabel} variant="outline" size="sm" locale={locale} icon={<UserCog className="h-4 w-4" />}>
              {label(t.account.navLabel)}
            </ButtonLink>
          {isAdmin && (
            <ButtonLink href="/admin" aria-label={t.admin.nav.title} variant="outline" size="sm" locale={locale} icon={<Shield className="h-4 w-4" />}>
                {label(t.admin.nav.title)}
              </ButtonLink>
          )}
          <LogoutButton>
            <Button
              type="button"
              variant="outline"
              size="sm"
              locale={locale}
              icon={<LogOut className="h-4 w-4 rtl:scale-x-[-1]" />}
              aria-label={t.common.logout}
            >
              {label(t.common.logout)}
            </Button>
          </LogoutButton>
        </nav>
      </header>
    </>
  );
}
