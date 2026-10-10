"use client";

import { useActionState, useState } from "react";
import { Check, Gauge, Pencil } from "lucide-react";
import { submitOdometerReading, type OdometerFormState } from "@/lib/dashboard/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { DataLabel } from "@/components/ui/data-label";
import { formatDate, formatNumber } from "@/lib/i18n/format";

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
  const [state, formAction, pending] = useActionState<OdometerFormState, FormData>(
    submitOdometerReading.bind(null, vehicleId),
    undefined,
  );
  // Controlled so the typed number survives the round trip (an uncontrolled
  // field is reset when the action returns) and can be resubmitted as-is
  // from the confirmation prompt.
  const [reading, setReading] = useState("");
  const [prevState, setPrevState] = useState(state);
  const [editing, setEditing] = useState(false);
  if (state !== prevState) {
    setPrevState(state);
    setEditing(false);
    if (state && "saved" in state) setReading("");
  }

  const confirm = state && "confirm" in state && !editing ? state.confirm : null;

  return (
    <div className="border border-hairline bg-surface-card/70 p-6 backdrop-blur-sm">
      <div className="grid grid-cols-1 items-end gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-1">
          <DataLabel>{t.dashboard.currentOdometer}</DataLabel>
          <span className="font-mono text-[32px] font-bold leading-none text-on-dark sm:text-[40px]">
            {formatNumber(locale, currentOdometer)}{" "}
            <span className="text-base font-normal text-muted">{t.common.km}</span>
          </span>
          {odometerUpdatedAt && (
            <span className="font-mono text-xs text-muted">
              {t.dashboard.lastUpdated}:{" "}
              {formatDate(locale, odometerUpdatedAt)}
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
              inputMode="numeric"
              min={currentOdometer}
              required
              dir="ltr"
              value={reading}
              onChange={(event) => {
                setReading(event.target.value);
                setEditing(true);
              }}
              className="w-36 font-mono"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={pending || confirm !== null}
            locale={locale}
            icon={<Gauge className="h-4 w-4" />}
          >
            {pending ? t.dashboard.submittingReading : t.dashboard.submitReading}
          </Button>
        </form>
      </div>

      {confirm && (
        <div className="mt-4 flex flex-col gap-3 border border-warning/60 bg-warning/5 p-4" role="alertdialog" aria-live="polite">
          <p className="text-sm text-body-strong">{confirm.message}</p>
          <div className="flex flex-wrap gap-3">
            <form action={formAction}>
              <input type="hidden" name="reading_km" value={confirm.reading} />
              <input type="hidden" name="confirmed" value={confirm.reading} />
              <Button type="submit" size="sm" disabled={pending} locale={locale} icon={<Check className="h-4 w-4" />}>
                {t.dashboard.confirmReading}
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="outline"
              locale={locale}
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => {
                setEditing(true);
                document.getElementById("reading_km")?.focus();
              }}
            >
              {t.dashboard.editReading}
            </Button>
          </div>
        </div>
      )}

      {state && "error" in state && (
        <p className="mt-3 text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}
      {state && "saved" in state && (
        <p className="mt-3 text-sm text-success" role="status">
          {t.dashboard.readingSaved}
        </p>
      )}
    </div>
  );
}
