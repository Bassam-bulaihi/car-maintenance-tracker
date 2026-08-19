"use client";

import { useActionState } from "react";
import { updateServiceItem, deleteServiceItem } from "@/lib/admin/actions";
import { serviceTypeLabel } from "@/lib/admin/service-types";

const inputClass =
  "h-10 w-28 rounded-none border border-hairline bg-surface-card px-3 text-on-dark focus:border-on-dark focus:outline-none";

export function ServiceItemRow({
  item,
  presetId,
}: {
  item: { id: string; service_type: string; interval_km: number | null; interval_months: number | null };
  presetId: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateServiceItem.bind(null, item.id, presetId),
    undefined,
  );

  return (
    <div className="flex flex-col gap-2 border-b border-hairline py-4 last:border-b-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <span className="text-on-dark">{serviceTypeLabel(item.service_type)}</span>

        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">كم</label>
            <input
              name="interval_km"
              type="number"
              min={1}
              dir="ltr"
              defaultValue={item.interval_km ?? ""}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">أشهر</label>
            <input
              name="interval_months"
              type="number"
              min={1}
              dir="ltr"
              defaultValue={item.interval_months ?? ""}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-none border border-hairline px-4 text-sm text-on-dark hover:border-on-dark disabled:opacity-50"
          >
            حفظ
          </button>
        </form>

        <form action={deleteServiceItem.bind(null, item.id, presetId)}>
          <button type="submit" className="text-sm text-m-red hover:underline">
            حذف
          </button>
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
