"use client";

import { useActionState } from "react";
import { RefreshCw } from "lucide-react";
import { resyncPresetVehicles, type ResyncState } from "@/lib/admin/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

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
  const p = t.admin.presets;
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(p.resyncConfirm.replace("{count}", nf.format(vehicleCount)))) event.preventDefault();
      }}
      className="flex flex-col gap-3 border border-hairline bg-surface-card/70 p-6 backdrop-blur-sm"
    >
      <p className="text-sm text-body">{p.resyncBody.replace("{count}", nf.format(vehicleCount))}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={pending || vehicleCount === 0}
          locale={locale}
          icon={<RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />}
        >
          {p.resyncButton}
        </Button>
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
    </form>
  );
}
