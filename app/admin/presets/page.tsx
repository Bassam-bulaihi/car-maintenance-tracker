import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { listPresets } from "@/lib/admin/data";
import { getDictionary } from "@/lib/i18n/locale";
import { Button } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";

export default async function AdminPresetsPage() {
  const presets = await listPresets();
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
        <div className="flex flex-col gap-2">
          <BracketLabel>{t.admin.presets.eyebrow}</BracketLabel>
          <h1
            className={`text-[40px] font-bold leading-[0.95] text-on-dark break-words ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
          >
            {t.admin.presets.title}
          </h1>
        </div>
        <Link href="/admin/presets/new">
          <Button locale={locale} icon={<Plus className="h-4 w-4" />}>
            {t.admin.presets.addPreset}
          </Button>
        </Link>
      </div>

      {presets.length === 0 ? (
        <p className="text-body">{t.admin.presets.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline">
          {presets.map((preset, index) => (
            <Link
              key={preset.id}
              href={`/admin/presets/${preset.id}`}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 bg-surface-card px-6 py-4 hover:bg-surface-elevated"
            >
              <span className="font-mono text-xs text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-on-dark">
                {preset.make} {preset.model}{" "}
                <span className="font-mono text-body">/ {preset.year}</span>
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.05em] text-m-red">
                {!preset.is_active && t.admin.presets.retired}
              </span>
              <ChevronRight className="h-4 w-4 text-muted rtl:scale-x-[-1]" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
