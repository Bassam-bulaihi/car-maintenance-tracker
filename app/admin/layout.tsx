import Link from "next/link";
import { Database, Gauge, Inbox, LayoutDashboard, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin/data";
import { LogoutButton } from "@/components/auth/logout-button";
import { NavLink } from "@/components/ui/nav-link";
import { getDictionary } from "@/lib/i18n/locale";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { MStripeDivider } from "@/components/layout/m-stripe-divider";
import { BracketLabel } from "@/components/ui/bracket-label";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  await requireAdmin();
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-1 flex-col">
      <MStripeDivider />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-4 sm:px-6">
        <Link href="/admin" className="flex flex-col gap-0.5">
          <BracketLabel>{t.admin.nav.eyebrow}</BracketLabel>
          <span
            className={`text-[15px] font-bold text-on-dark ${locale === "en" ? "uppercase tracking-[-0.01em]" : ""}`}
          >
            {t.admin.nav.title}
          </span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <nav aria-label={t.admin.nav.title} className="flex items-center gap-3">
            <NavLink
              href="/admin"
              exact
              aria-label={t.admin.nav.overview}
              className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark" activeClassName="!border-on-dark !text-on-dark bg-surface-elevated"
            >
              <Gauge className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.admin.nav.overview}</span>
            </NavLink>
            <NavLink
              href="/admin/presets"
              aria-label={t.admin.nav.presets}
              className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark" activeClassName="!border-on-dark !text-on-dark bg-surface-elevated"
            >
              <Database className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.admin.nav.presets}</span>
            </NavLink>
            <NavLink
              href="/admin/messages"
              aria-label={t.admin.nav.messages}
              className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark" activeClassName="!border-on-dark !text-on-dark bg-surface-elevated"
            >
              <Inbox className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.admin.nav.messages}</span>
            </NavLink>
          </nav>
          <LanguageToggle locale={locale} />
          <Link
            href="/dashboard"
            aria-label={t.admin.nav.backToDashboard}
            className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t.admin.nav.backToDashboard}</span>
          </Link>
          <LogoutButton>
            <button
              type="button"
              aria-label={t.common.logout}
              className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.common.logout}</span>
            </button>
          </LogoutButton>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-10 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
