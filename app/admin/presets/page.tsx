import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { listPresets } from "@/lib/admin/data";
import { getDictionary } from "@/lib/i18n/locale";
import { Button } from "@/components/ui/button";

export default async function AdminPresetsPage() {
  const presets = await listPresets();
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold leading-tight text-on-dark">
          {t.admin.presets.title}
        </h1>
        <Link href="/admin/presets/new">
          <Button locale={locale} icon={<Plus className="h-4 w-4" />}>
            {t.admin.presets.addPreset}
          </Button>
        </Link>
      </div>

      {presets.length === 0 ? (
        <p className="text-body">{t.admin.presets.empty}</p>
      ) : (
        <div className="flex flex-col divide-y divide-hairline border border-hairline">
          {presets.map((preset) => (
            <Link
              key={preset.id}
              href={`/admin/presets/${preset.id}`}
              className="flex items-center justify-between bg-surface-card px-6 py-4 hover:bg-surface-elevated"
            >
              <span className="text-on-dark">
                {preset.make} {preset.model} — {preset.year}
              </span>
              <div className="flex items-center gap-3">
                {!preset.is_active && <span className="text-sm text-muted">{t.admin.presets.retired}</span>}
                <ChevronRight className="h-4 w-4 text-muted rtl:scale-x-[-1]" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
