import Link from "next/link";
import { Database, Gauge, LayoutDashboard, LogOut, MessageSquareWarning } from "lucide-react";
import { requireAdmin } from "@/lib/admin/data";
import { LogoutButton } from "@/components/auth/logout-button";
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
      <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
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
            <Link
              href="/admin"
              className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark"
            >
              <Gauge className="h-4 w-4" aria-hidden="true" />
              {t.admin.nav.overview}
            </Link>
            <Link
              href="/admin/presets"
              className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark"
            >
              <Database className="h-4 w-4" aria-hidden="true" />
              {t.admin.nav.presets}
            </Link>
            <Link
              href="/admin/follow-ups"
              className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark"
            >
              <MessageSquareWarning className="h-4 w-4" aria-hidden="true" />
              {t.admin.nav.followUps}
            </Link>
          </nav>
          <LanguageToggle locale={locale} />
          <Link
            href="/dashboard"
            className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            {t.admin.nav.backToDashboard}
          </Link>
          <LogoutButton>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t.common.logout}
            </button>
          </LogoutButton>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-16 px-6 py-12">
        {children}
      </main>
    </div>
  );
}
