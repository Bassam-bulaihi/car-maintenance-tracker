import Link from "next/link";
import { Plus, Car, Send } from "lucide-react";
import { requireProfile } from "@/lib/auth/profile";
import { getDictionary } from "@/lib/i18n/locale";
import { listVehicles } from "@/lib/dashboard/data";
import { Button } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";
import { VehicleCard } from "@/components/dashboard/vehicle-card";

export default async function DashboardPage() {
  const [{ profile }, vehicles, { locale, t }] = await Promise.all([
    requireProfile(),
    listVehicles(),
    getDictionary(),
  ]);

  return (
    <>
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
    </>
  );
}
