"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteVehicle } from "@/lib/dashboard/actions";
import type { Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

// Irreversible, so it asks first; the server action enforces ownership.
export function DeleteVehicleButton({
  vehicleId,
  label,
  confirmText,
  locale,
}: {
  vehicleId: string;
  label: string;
  confirmText: string;
  locale: Locale;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      locale={locale}
      disabled={pending}
      icon={<Trash2 className="h-4 w-4" />}
      onClick={() => {
        if (window.confirm(confirmText)) startTransition(() => deleteVehicle(vehicleId));
      }}
    >
      {label}
    </Button>
  );
}
