"use client";

import { Trash2 } from "lucide-react";
import { deleteVehicle } from "@/lib/dashboard/actions";
import type { Locale } from "@/lib/i18n/dictionaries";
import { ConfirmButton } from "@/components/ui/confirm-button";

// Irreversible, so it asks first (inline, no browser dialog); the server
// action enforces ownership.
export function DeleteVehicleButton({
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
      icon={<Trash2 className="h-4 w-4" />}
      variant="danger"
      locale={locale}
      onConfirm={() => deleteVehicle(vehicleId)}
    />
  );
}
