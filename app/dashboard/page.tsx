import Link from "next/link";
import { LogOut, Shield, Plus, Car } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";
import { getDictionary } from "@/lib/i18n/locale";
import { listVehicles } from "@/lib/dashboard/data";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { MStripeDivider } from "@/components/layout/m-stripe-divider";
import { Button } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";
import { VehicleCard } from "@/components/dashboard/vehicle-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, vehicles, { locale, t }] = await Promise.all([
    supabase.from("users").select("name").eq("id", user!.id).single(),
    listVehicles(),
    getDictionary(),
  ]);

  const isAdmin = user?.app_metadata?.role === "admin";

  return (
    <div className="flex flex-1 flex-col">
      <MStripeDivider />
      <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <span className="text-[15px] font-bold text-on-dark">
          {t.dashboard.welcome}
          {profile?.name ? `، ${profile.name}` : ""}
        </span>
        <div className="flex items-center gap-3">
          <LanguageToggle locale={locale} />
          {isAdmin && (
            <Link href="/admin/presets">
              <Button variant="outline" size="sm" locale={locale} icon={<Shield className="h-4 w-4" />}>
                {t.admin.nav.title}
              </Button>
            </Link>
          )}
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" locale={locale} icon={<LogOut className="h-4 w-4" />}>
              {t.common.logout}
            </Button>
          </form>
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

        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-hairline bg-surface-card px-6 py-16 text-center">
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
