"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addServiceItem } from "@/lib/admin/actions";
import { serviceTypesFor } from "@/lib/admin/service-types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput, Select } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { DataLabel } from "@/components/ui/data-label";

export function AddServiceItemForm({
  presetId,
  usedTypes,
  locale,
  t,
}: {
  presetId: string;
  usedTypes: Set<string>;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    addServiceItem.bind(null, presetId),
    undefined,
  );

  const availableTypes = serviceTypesFor(locale).filter((s) => !usedTypes.has(s.value));

  if (availableTypes.length === 0) {
    return <p className="text-sm text-muted">{t.admin.presets.allServiceTypesAdded}</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4 pt-4">
      <div className="flex flex-col gap-1">
        <DataLabel>{t.admin.presets.serviceType}</DataLabel>
        <Select uiSize="sm" name="service_type" required className="w-44" defaultValue="">
          <option value="" disabled>
            {t.admin.presets.choose}
          </option>
          {availableTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <DataLabel>{t.common.km}</DataLabel>
        <TextInput
          uiSize="sm"
          name="interval_km"
          type="number"
          min={1}
          dir="ltr"
          className="w-24 font-mono"
        />
      </div>
      <div className="flex flex-col gap-1">
        <DataLabel>{t.common.months}</DataLabel>
        <TextInput
          uiSize="sm"
          name="interval_months"
          type="number"
          min={1}
          dir="ltr"
          className="w-24 font-mono"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending} locale={locale} icon={<Plus className="h-4 w-4" />}>
        {t.common.add}
      </Button>
      {state?.error && (
        <p className="w-full text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
