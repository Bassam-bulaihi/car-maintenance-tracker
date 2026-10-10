"use client";

import { Undo2 } from "lucide-react";
import { undoLatestReading } from "@/lib/dashboard/actions";
import type { Locale } from "@/lib/i18n/dictionaries";
import { ConfirmButton } from "@/components/ui/confirm-button";

export function UndoReadingButton({
  vehicleId,
  label,
  confirmText,
  confirmLabel,
  cancelLabel,
  locale,
}: {
  vehicleId: string;
  label: string;
  confirmText: string;
  confirmLabel: string;
  cancelLabel: string;
  locale: Locale;
}) {
  return (
    <ConfirmButton
      label={label}
      question={confirmText}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      icon={<Undo2 className="h-4 w-4" />}
      locale={locale}
      onConfirm={() => undoLatestReading(vehicleId)}
    />
  );
}
