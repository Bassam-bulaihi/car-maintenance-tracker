import { notFound } from "next/navigation";
import { getVehicle, listServiceHistory } from "@/lib/dashboard/data";
import { getDictionary } from "@/lib/i18n/locale";
import { BackLink } from "@/components/ui/back-link";
import { BracketLabel } from "@/components/ui/bracket-label";
import { SectionHeader } from "@/components/ui/section-header";
import { OdometerPanel } from "@/components/dashboard/odometer-panel";
import { ServiceStatusRow } from "@/components/dashboard/service-status-row";
import { ServiceHistoryList } from "@/components/dashboard/service-history-list";

export default async function VehicleDetailPage({
  params,
}: PageProps<"/dashboard/vehicles/[id]">) {
  const { id } = await params;
  const [vehicle, { locale, t }] = await Promise.all([getVehicle(id), getDictionary()]);

  if (!vehicle) {
    notFound();
  }

  const history = await listServiceHistory(vehicle.id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
      <div className="flex flex-col gap-6">
        <BackLink href="/dashboard">{t.dashboard.backToVehicles}</BackLink>
        <div className="flex flex-col gap-2">
          <BracketLabel>UNIT / {vehicle.id.slice(0, 8)}</BracketLabel>
          <h1
            className={`text-[40px] font-bold leading-[0.95] text-on-dark break-words ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
          >
            {vehicle.make} {vehicle.model}{" "}
            <span className="font-mono text-body">/ {vehicle.year}</span>
          </h1>
        </div>
      </div>

      <OdometerPanel
        vehicleId={vehicle.id}
        currentOdometer={vehicle.current_odometer}
        odometerUpdatedAt={vehicle.odometer_updated_at}
        locale={locale}
        t={t}
      />

      <section className="flex flex-col gap-3">
        <SectionHeader>{t.dashboard.servicesSectionTitle}</SectionHeader>
        <div className="border border-hairline bg-surface-card/70 backdrop-blur-sm px-6">
          {vehicle.vehicle_service_items.map((item) => (
            <ServiceStatusRow
              key={item.id}
              vehicleId={vehicle.id}
              currentOdometer={vehicle.current_odometer}
              item={item}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader>{t.dashboard.historySectionTitle}</SectionHeader>
        <ServiceHistoryList history={history} locale={locale} t={t} />
      </section>
    </main>
  );
}
