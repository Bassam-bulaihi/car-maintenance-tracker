"use client";

import { useActionState } from "react";
import { Gauge } from "lucide-react";
import { submitOdometerReading } from "@/lib/dashboard/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { DataLabel } from "@/components/ui/data-label";

export function OdometerPanel({
  vehicleId,
  currentOdometer,
  odometerUpdatedAt,
  locale,
  t,
}: {
  vehicleId: string;
  currentOdometer: number;
  odometerUpdatedAt: string | null;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    submitOdometerReading.bind(null, vehicleId),
    undefined,
  );

  return (
    <div className="border border-hairline bg-surface-card/70 backdrop-blur-sm p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
        <div className="flex flex-col gap-1">
          <DataLabel>{t.dashboard.currentOdometer}</DataLabel>
          <span className="font-mono text-[40px] font-bold leading-none text-on-dark">
            {currentOdometer.toLocaleString(locale === "ar" ? "ar" : "en")}
          </span>
          {odometerUpdatedAt && (
            <span className="font-mono text-xs text-muted">
              {t.dashboard.lastUpdated}: {new Date(odometerUpdatedAt).toLocaleDateString(locale)}
            </span>
          )}
        </div>

        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <DataLabel htmlFor="reading_km">{t.dashboard.newReadingLabel}</DataLabel>
            <TextInput
              uiSize="sm"
              id="reading_km"
              name="reading_km"
              type="number"
              min={currentOdometer}
              required
              dir="ltr"
              className="w-32 font-mono"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={pending}
            locale={locale}
            icon={<Gauge className="h-4 w-4" />}
          >
            {pending ? t.dashboard.submittingReading : t.dashboard.submitReading}
          </Button>
        </form>
      </div>
      {state?.error && (
        <p className="mt-3 text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
