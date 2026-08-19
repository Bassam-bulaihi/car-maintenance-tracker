"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/lib/admin/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { DataLabel } from "@/components/admin/data-label";

type PresetFormAction = (
  state: AdminFormState,
  formData: FormData,
) => Promise<AdminFormState>;

export function PresetForm({
  action,
  initial,
  submitLabel,
  locale,
  t,
}: {
  action: PresetFormAction;
  initial?: {
    make: string;
    model: string;
    year: number;
    recommended_oil: string | null;
  };
  submitLabel: string;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <DataLabel htmlFor="make">{t.admin.presets.make}</DataLabel>
          <TextInput id="make" name="make" required defaultValue={initial?.make} />
        </div>
        <div className="flex flex-col gap-1.5">
          <DataLabel htmlFor="model">{t.admin.presets.model}</DataLabel>
          <TextInput id="model" name="model" required defaultValue={initial?.model} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <DataLabel htmlFor="year">{t.admin.presets.year}</DataLabel>
        <TextInput
          id="year"
          name="year"
          type="number"
          min={1990}
          max={2100}
          required
          defaultValue={initial?.year}
          dir="ltr"
          className="font-mono"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <DataLabel htmlFor="recommended_oil">{t.admin.presets.recommendedOil}</DataLabel>
        <TextInput
          id="recommended_oil"
          name="recommended_oil"
          defaultValue={initial?.recommended_oil ?? ""}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} locale={locale} className="mt-2 self-start">
        {pending ? t.common.saving : submitLabel}
      </Button>
    </form>
  );
}
