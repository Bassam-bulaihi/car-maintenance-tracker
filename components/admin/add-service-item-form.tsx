"use client";

import { useActionState } from "react";
import { addServiceItem } from "@/lib/admin/actions";
import { SERVICE_TYPES } from "@/lib/admin/service-types";

const inputClass =
  "h-10 w-28 rounded-none border border-hairline bg-surface-card px-3 text-on-dark focus:border-on-dark focus:outline-none";

export function AddServiceItemForm({
  presetId,
  availableTypes,
}: {
  presetId: string;
  availableTypes: typeof SERVICE_TYPES[number][];
}) {
  const [state, formAction, pending] = useActionState(
    addServiceItem.bind(null, presetId),
    undefined,
  );

  if (availableTypes.length === 0) {
    return <p className="text-sm text-muted">تمت إضافة جميع أنواع الخدمة لهذا النموذج.</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 pt-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">نوع الخدمة</label>
        <select
          name="service_type"
          required
          className={`${inputClass} w-48`}
          defaultValue=""
        >
          <option value="" disabled>
            اختر...
          </option>
          {availableTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">كم</label>
        <input name="interval_km" type="number" min={1} dir="ltr" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">أشهر</label>
        <input name="interval_months" type="number" min={1} dir="ltr" className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-none border border-on-dark px-4 text-sm font-bold text-on-dark hover:bg-on-dark hover:text-canvas disabled:opacity-50"
      >
        إضافة
      </button>
      {state?.error && (
        <p className="w-full text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
