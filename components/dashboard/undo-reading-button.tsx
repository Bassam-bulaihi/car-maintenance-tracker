"use client";

import { useTransition } from "react";
import { Undo2 } from "lucide-react";
import { undoLatestReading } from "@/lib/dashboard/actions";

export function UndoReadingButton({ vehicleId, label, confirmText }: { vehicleId: string; label: string; confirmText: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) startTransition(() => undoLatestReading(vehicleId));
      }}
      className="inline-flex min-h-8 items-center gap-1 py-1.5 text-xs text-muted underline-offset-4 hover:text-m-red hover:underline disabled:opacity-50"
    >
      <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}
