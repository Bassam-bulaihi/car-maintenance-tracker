"use client";

import { useActionState } from "react";
import { Save, SlidersHorizontal } from "lucide-react";
import { updateServiceItem, type ServiceItemFormState } from "@/lib/dashboard/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { DataLabel } from "@/components/ui/data-label";
import { todayInAppTimeZone } from "@/lib/config";

// Collapsed by default under each service row: correct when the service was
// really last done and this car's own intervals.
export function ServiceItemAdjust({
  vehicleId,
  item,
  currentOdometer,
  locale,
  t,
}: {
  vehicleId: string;
  item: {
    id: string;
    interval_km: number | null;
    interval_months: number | null;
    last_service_odometer: number | null;
    last_service_date: string | null;
  };
  currentOdometer: number;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState<ServiceItemFormState, FormData>(
    updateServiceItem.bind(null, vehicleId, item.id),
    undefined,
  );
  const d = t.dashboard;
  const today = todayInAppTimeZone();

  return (
    <details className="group sm:col-span-2">
      <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 py-1.5 text-xs text-muted hover:text-on-dark [&::-webkit-details-marker]:hidden">
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        {d.adjust}
      </summary>
      <form action={formAction} className="mt-3 flex flex-col gap-3 border border-hairline bg-surface-soft/60 p-4">
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-4">
          <label className="flex flex-col gap-1">
            <DataLabel>{d.lastServiceKmLabel}</DataLabel>
            <TextInput
              uiSize="sm"
              name="last_service_odometer"
              type="number"
              inputMode="numeric"
              min={0}
              max={currentOdometer}
              required
              defaultValue={item.last_service_odometer ?? currentOdometer}
              dir="ltr"
              className="font-mono"
            />
          </label>
          <label className="flex flex-col gap-1">
            <DataLabel>{d.lastServiceDateLabel}</DataLabel>
            <TextInput
              uiSize="sm"
              name="last_service_date"
              type="date"
              max={today}
              required
              defaultValue={item.last_service_date ?? today}
              dir="ltr"
              className="font-mono"
            />
          </label>
          <label className="flex flex-col gap-1">
            <DataLabel>{d.scheduleKm}</DataLabel>
            <TextInput
              uiSize="sm"
              name="interval_km"
              type="number"
              inputMode="numeric"
              min={1}
              defaultValue={item.interval_km ?? ""}
              dir="ltr"
              className="font-mono"
            />
          </label>
          <label className="flex flex-col gap-1">
            <DataLabel>{d.scheduleMonths}</DataLabel>
            <TextInput
              uiSize="sm"
              name="interval_months"
              type="number"
              inputMode="numeric"
              min={1}
              defaultValue={item.interval_months ?? ""}
              dir="ltr"
              className="font-mono"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" variant="outline" disabled={pending} locale={locale} icon={<Save className="h-4 w-4" />}>
            {d.saveItem}
          </Button>
          {state && "error" in state && (
            <p className="text-sm text-m-red" role="alert">
              {state.error}
            </p>
          )}
          {state && "saved" in state && (
            <p className="text-sm text-success" role="status">
              {d.itemSaved}
            </p>
          )}
        </div>
        <p className="text-xs text-muted">{d.scheduleHint}</p>
      </form>
    </details>
  );
}
