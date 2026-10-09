import Link from "next/link";
import { LogOut, Shield, Plus, Car, UserCog, Send } from "lucide-react";
import { requireProfile } from "@/lib/auth/profile";
import { getDictionary } from "@/lib/i18n/locale";
import { listVehicles } from "@/lib/dashboard/data";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { MStripeDivider } from "@/components/layout/m-stripe-divider";
import { Button } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";
import { VehicleCard } from "@/components/dashboard/vehicle-card";
import { Logo } from "@/components/brand/logo";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardPage() {
  const [{ user, profile }, vehicles, { locale, t }] = await Promise.all([
    requireProfile(),
    listVehicles(),
    getDictionary(),
  ]);

  const isAdmin = user.isAdmin;

  return (
    <div className="flex flex-1 flex-col">
      <MStripeDivider />
      <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            aria-label={t.home.brand}
            className="text-on-dark transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark"
          >
            <Logo markClassName="h-7" />
          </Link>
          <span className="hidden h-6 w-px bg-hairline sm:block" aria-hidden="true" />
          <span className="hidden text-[15px] font-bold text-on-dark sm:inline">
            {t.dashboard.welcome}
            {profile?.name ? `، ${profile.name}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle locale={locale} />
          <Link href="/dashboard/account">
            <Button variant="outline" size="sm" locale={locale} icon={<UserCog className="h-4 w-4" />}>
              {t.account.navLabel}
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin/presets">
              <Button variant="outline" size="sm" locale={locale} icon={<Shield className="h-4 w-4" />}>
                {t.admin.nav.title}
              </Button>
            </Link>
          )}
          <LogoutButton>
            <Button type="button" variant="outline" size="sm" locale={locale} icon={<LogOut className="h-4 w-4" />}>
              {t.common.logout}
            </Button>
          </LogoutButton>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
          <div className="flex flex-col gap-2">
            <BracketLabel>{t.dashboard.eyebrow}</BracketLabel>
            <h1
              className={`text-[40px] font-bold leading-[0.95] text-on-dark break-words ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
            >
              {t.dashboard.vehiclesTitle}
            </h1>
          </div>
          <Link href="/dashboard/vehicles/new">
            <Button locale={locale} icon={<Plus className="h-4 w-4" />}>
              {t.dashboard.addVehicle}
            </Button>
          </Link>
        </div>

        {profile.telegram_chat_id === null && (
          <Link
            href="/dashboard/account"
            className="flex flex-wrap items-center justify-between gap-3 border border-hairline bg-surface-card/70 px-5 py-4 text-sm text-body backdrop-blur-sm transition-colors hover:border-on-dark hover:text-on-dark"
          >
            <span className="flex items-center gap-3">
              <Send className="h-4 w-4 shrink-0 text-muted rtl:scale-x-[-1]" aria-hidden="true" />
              {t.account.telegram.notConnected}
            </span>
            <span className={`font-bold text-on-dark ${locale === "en" ? "uppercase tracking-[1.5px]" : ""}`}>
              {t.account.telegram.connect}
            </span>
          </Link>
        )}

        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-hairline bg-surface-card/70 backdrop-blur-sm px-6 py-16 text-center">
            <Car className="h-10 w-10 text-muted" aria-hidden="true" />
            <p className="text-body">{t.dashboard.empty}</p>
            <Link href="/dashboard/vehicles/new">
              <Button locale={locale} icon={<Plus className="h-4 w-4" />}>
                {t.dashboard.emptyCta}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} locale={locale} t={t} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
