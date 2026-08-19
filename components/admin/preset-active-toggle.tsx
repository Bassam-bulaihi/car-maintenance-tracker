import { Power, PowerOff } from "lucide-react";
import { setPresetActive } from "@/lib/admin/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

export function PresetActiveToggle({
  presetId,
  isActive,
  locale,
  t,
}: {
  presetId: string;
  isActive: boolean;
  locale: Locale;
  t: Dictionary;
}) {
  return (
    <form action={setPresetActive.bind(null, presetId, !isActive)}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        locale={locale}
        icon={isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
      >
        {isActive ? t.admin.presets.retire : t.admin.presets.reactivate}
      </Button>
    </form>
  );
}
