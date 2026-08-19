"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { updateServiceItem, deleteServiceItem } from "@/lib/admin/actions";
import { serviceTypeLabel } from "@/lib/admin/service-types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { DataLabel } from "@/components/ui/data-label";

export function ServiceItemRow({
  item,
  presetId,
  locale,
  t,
}: {
  item: {
    id: string;
    service_type: string;
    interval_km: number | null;
    interval_months: number | null;
  };
  presetId: string;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    updateServiceItem.bind(null, item.id, presetId),
    undefined,
  );

  return (
    <div className="flex flex-col gap-2 border-b border-hairline py-4 last:border-b-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4">
        <span className="text-on-dark break-words">
          {serviceTypeLabel(item.service_type, locale)}
        </span>

        <form action={formAction} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <DataLabel>{t.common.km}</DataLabel>
            <TextInput
              uiSize="sm"
              name="interval_km"
              type="number"
              min={1}
              dir="ltr"
              defaultValue={item.interval_km ?? ""}
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
              defaultValue={item.interval_months ?? ""}
              className="w-24 font-mono"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" disabled={pending} locale={locale}>
            {t.common.save}
          </Button>
        </form>

        <form action={deleteServiceItem.bind(null, item.id, presetId)}>
          <Button type="submit" variant="danger" size="sm" locale={locale} icon={<Trash2 className="h-4 w-4" />}>
            {t.common.delete}
          </Button>
        </form>
      </div>
      {state?.error && (
        <p className="text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
