"use client";

import { useActionState } from "react";
import { Car } from "lucide-react";
import { registerVehicle } from "@/lib/dashboard/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput, Select, FieldLabel } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

type Preset = { id: string; make: string; model: string; year: number };

export function RegisterVehicleForm({
  presets,
  locale,
  t,
}: {
  presets: Preset[];
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(registerVehicle, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="preset_id">{t.dashboard.presetLabel}</FieldLabel>
        <Select id="preset_id" name="preset_id" required defaultValue="">
          <option value="" disabled>
            {t.dashboard.presetChoose}
          </option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.make} {preset.model} — {preset.year}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="current_odometer">{t.dashboard.odometerLabel}</FieldLabel>
        <TextInput
          id="current_odometer"
          name="current_odometer"
          type="number"
          min={0}
          required
          dir="ltr"
          className="font-mono"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="plate_no">{t.dashboard.plateLabel}</FieldLabel>
        <TextInput id="plate_no" name="plate_no" dir="ltr" />
      </div>

      {state?.error && (
        <p className="text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        locale={locale}
        icon={<Car className="h-4 w-4" />}
        className="mt-2 self-start"
      >
        {pending ? t.dashboard.registerSubmitting : t.dashboard.registerSubmit}
      </Button>
    </form>
  );
}
