import { notFound } from "next/navigation";
import { Droplet, PenLine, Save } from "lucide-react";
import { updateVehiclePlate } from "@/lib/dashboard/actions";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { getRecommendedOil, getVehicle, listOdometerReadings, listServiceHistory } from "@/lib/dashboard/data";
import { getDictionary } from "@/lib/i18n/locale";
import { BackLink } from "@/components/ui/back-link";
import { BracketLabel } from "@/components/ui/bracket-label";
import { SectionHeader } from "@/components/ui/section-header";
import { OdometerPanel } from "@/components/dashboard/odometer-panel";
import { ServiceStatusRow } from "@/components/dashboard/service-status-row";
import { ServiceHistoryList } from "@/components/dashboard/service-history-list";
import { OdometerHistoryList } from "@/components/dashboard/odometer-history-list";
import { DeleteVehicleButton } from "@/components/dashboard/delete-vehicle-button";

export default async function VehicleDetailPage({
  params,
}: PageProps<"/dashboard/vehicles/[id]">) {
  const { id } = await params;
  const [vehicle, { locale, t }] = await Promise.all([getVehicle(id), getDictionary()]);

  if (!vehicle) {
    notFound();
  }

  const [history, readings, recommendedOil] = await Promise.all([
    listServiceHistory(vehicle.id),
    listOdometerReadings(vehicle.id, 8),
    getRecommendedOil(vehicle),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
      <div className="flex flex-col gap-6">
        <BackLink href="/dashboard">{t.dashboard.backToVehicles}</BackLink>
        <div className="flex flex-col gap-2">
          <BracketLabel>
            {vehicle.plate_no ? `${t.dashboard.plateLabelShort} / ${vehicle.plate_no}` : t.dashboard.vehicleEyebrow}
          </BracketLabel>
          <h1
            className={`text-[30px] font-bold leading-[0.95] text-on-dark break-words sm:text-[40px] ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
          >
            {vehicle.make} {vehicle.model}{" "}
            <span className="font-mono text-body">/ {vehicle.year}</span>
          </h1>
          {recommendedOil && (
            <p className="flex items-center gap-2 text-sm text-body">
              <Droplet className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              {t.dashboard.recommendedOil}: <span className="font-mono text-on-dark">{recommendedOil}</span>
            </p>
          )}
          <details className="group">
            <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 py-1.5 text-xs text-muted hover:text-on-dark [&::-webkit-details-marker]:hidden">
              <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
              {t.dashboard.editPlate}
            </summary>
            <form action={updateVehiclePlate.bind(null, vehicle.id)} className="mt-2 flex flex-wrap items-center gap-2">
              <TextInput
                uiSize="sm"
                name="plate_no"
                defaultValue={vehicle.plate_no ?? ""}
                maxLength={20}
                aria-label={t.dashboard.plateLabel}
                dir="auto"
                className="w-48"
              />
              <Button type="submit" size="sm" variant="outline" locale={locale} icon={<Save className="h-4 w-4" />}>
                {t.dashboard.saveItem}
              </Button>
            </form>
          </details>
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
          {vehicle.vehicle_service_items.length === 0 && <p className="py-4 text-body">{t.dashboard.noServices}</p>}
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

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <SectionHeader>{t.dashboard.historySectionTitle}</SectionHeader>
          <ServiceHistoryList history={history} locale={locale} t={t} />
        </section>
        <section className="flex flex-col gap-3">
          <SectionHeader>{t.dashboard.readingsSectionTitle}</SectionHeader>
          <OdometerHistoryList vehicleId={vehicle.id} readings={readings} locale={locale} t={t} />
        </section>
      </div>

      <div className="flex justify-end border-t border-hairline pt-6">
        <DeleteVehicleButton
          vehicleId={vehicle.id}
          label={t.dashboard.removeVehicle}
          confirmText={t.dashboard.removeVehicleConfirm.replace("{vehicle}", `${vehicle.make} ${vehicle.model}`)}
          confirmLabel={t.common.confirm}
          cancelLabel={t.common.cancel}
          locale={locale}
        />
      </div>
    </main>
  );
}
