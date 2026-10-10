"use client";

import { useActionState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { resyncPresetVehicles, type ResyncState } from "@/lib/admin/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function ResyncPresetForm({
  presetId,
  vehicleCount,
  locale,
  t,
}: {
  presetId: string;
  vehicleCount: number;
  locale: Locale;
  t: Dictionary;
}) {
  const [state, action, pending] = useActionState<ResyncState, FormData>(
    resyncPresetVehicles.bind(null, presetId),
    undefined,
  );
  const [, startTransition] = useTransition();
  const p = t.admin.presets;
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");

  return (
    <div className="flex flex-col gap-3 border border-hairline bg-surface-card/70 p-6 backdrop-blur-sm">
      <p className="text-sm text-body">{p.resyncBody.replace("{count}", nf.format(vehicleCount))}</p>
      <div className="flex flex-wrap items-center gap-3">
        {vehicleCount > 0 && (
          <ConfirmButton
            label={p.resyncButton}
            question={p.resyncConfirm.replace("{count}", nf.format(vehicleCount))}
            confirmLabel={t.common.confirm}
            cancelLabel={t.common.cancel}
            icon={<RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />}
            locale={locale}
            onConfirm={() => startTransition(() => action(new FormData()))}
          />
        )}
        {state && "synced" in state && (
          <p className="text-sm text-success" role="status">
            {p.resyncDone.replace("{count}", nf.format(state.synced))}
          </p>
        )}
        {state && "error" in state && (
          <p className="text-sm text-m-red" role="alert">
            {state.error}
          </p>
        )}
      </div>
    </div>
  );
}
