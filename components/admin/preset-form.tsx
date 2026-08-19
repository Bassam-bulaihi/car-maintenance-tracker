"use client";

import { useActionState } from "react";
import type { AdminFormState } from "@/lib/admin/actions";

const inputClass =
  "h-12 w-full rounded-none border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted focus:border-on-dark focus:outline-none";

const labelClass = "text-sm text-body";

type PresetFormAction = (
  state: AdminFormState,
  formData: FormData,
) => Promise<AdminFormState>;

export function PresetForm({
  action,
  initial,
  submitLabel,
}: {
  action: PresetFormAction;
  initial?: {
    make: string;
    model: string;
    year: number;
    recommended_oil: string | null;
    recommended_parts: string | null;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="make">
            الصانع
          </label>
          <input
            id="make"
            name="make"
            required
            defaultValue={initial?.make}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="model">
            الموديل
          </label>
          <input
            id="model"
            name="model"
            required
            defaultValue={initial?.model}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="year">
          سنة الصنع
        </label>
        <input
          id="year"
          name="year"
          type="number"
          min={1990}
          max={2100}
          required
          defaultValue={initial?.year}
          className={inputClass}
          dir="ltr"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="recommended_oil">
          الزيت الموصى به
        </label>
        <input
          id="recommended_oil"
          name="recommended_oil"
          defaultValue={initial?.recommended_oil ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="recommended_parts">
          القطع الموصى بها
        </label>
        <input
          id="recommended_parts"
          name="recommended_parts"
          defaultValue={initial?.recommended_parts ?? ""}
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-12 self-start rounded-none border border-on-dark px-8 text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas disabled:opacity-50"
      >
        {pending ? "جارِ الحفظ..." : submitLabel}
      </button>
    </form>
  );
}
