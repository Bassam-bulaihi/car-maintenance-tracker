import Link from "next/link";
import { Plus, Car } from "lucide-react";
import { FaTelegram } from "react-icons/fa6";
import { requireProfile } from "@/lib/auth/profile";
import { getDictionary } from "@/lib/i18n/locale";
import { listVehicles } from "@/lib/dashboard/data";
import { computeServiceStatus } from "@/lib/dashboard/service-status";
import { ButtonLink } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";
import { VehicleCard } from "@/components/dashboard/vehicle-card";

export default async function DashboardPage() {
  const [{ profile }, vehicles, { locale, t }] = await Promise.all([
    requireProfile(),
    listVehicles(),
    getDictionary(),
  ]);

  // Cars that need attention first, then by registration order.
  const dueCount = (v: (typeof vehicles)[number]) =>
    v.vehicle_service_items.filter((item) => computeServiceStatus(item, v.current_odometer) === "due").length;
  const sortedVehicles = [...vehicles].sort((a, b) => dueCount(b) - dueCount(a));

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
          <ButtonLink href="/dashboard/vehicles/new" locale={locale} icon={<Plus className="h-4 w-4" />}>
              {t.dashboard.addVehicle}
            </ButtonLink>
        </div>

        {profile.telegram_chat_id === null && (
          <Link
            href="/dashboard/account"
            className="flex flex-wrap items-center justify-between gap-3 border border-hairline bg-surface-card/70 px-5 py-4 text-sm text-body backdrop-blur-sm transition-colors hover:border-on-dark hover:text-on-dark"
          >
            <span className="flex items-center gap-3">
              <FaTelegram className="h-5 w-5 shrink-0 text-on-dark" aria-hidden="true" />
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
            <ButtonLink href="/dashboard/vehicles/new" locale={locale} icon={<Plus className="h-4 w-4" />}>
                {t.dashboard.emptyCta}
              </ButtonLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} locale={locale} t={t} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
