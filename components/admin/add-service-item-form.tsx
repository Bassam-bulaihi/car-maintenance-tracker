"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addServiceItem } from "@/lib/admin/actions";
import { serviceTypesFor } from "@/lib/admin/service-types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput, Select } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

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
    <form action={formAction} className="flex flex-wrap items-end gap-3 pt-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">{t.admin.presets.serviceType}</label>
        <Select name="service_type" required className="w-48" defaultValue="">
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
        <label className="text-xs text-muted">{t.common.km}</label>
        <TextInput name="interval_km" type="number" min={1} dir="ltr" className="w-28" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">{t.common.months}</label>
        <TextInput name="interval_months" type="number" min={1} dir="ltr" className="w-28" />
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
