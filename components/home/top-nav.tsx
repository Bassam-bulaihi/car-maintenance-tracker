import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { Button } from "@/components/ui/button";

// docs/DESIGN.md `{component.top-nav}` — 64px canvas bar, logo left, right
// cluster with language selector + account links.
export function TopNav({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-hairline px-6">
      <Link href="/" className="text-lg font-bold tracking-tight text-on-dark">
        {t.home.brand}
      </Link>
      <div className="flex items-center gap-3">
        <LanguageToggle locale={locale} />
        <Link href="/login">
          <Button variant="outline" size="sm" locale={locale}>
            {t.home.nav.login}
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" locale={locale}>
            {t.home.nav.signup}
          </Button>
        </Link>
      </div>
    </header>
  );
}
