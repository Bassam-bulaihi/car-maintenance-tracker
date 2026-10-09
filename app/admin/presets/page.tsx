import Link from "next/link";
import { Plus, ChevronRight, Search } from "lucide-react";
import { listPresets } from "@/lib/admin/data";
import { getDictionary } from "@/lib/i18n/locale";
import { Button } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";
import { Select, TextInput } from "@/components/ui/text-input";
import { formatNumber } from "@/lib/i18n/format";

export default async function AdminPresetsPage({ searchParams }: PageProps<"/admin/presets">) {
  const [allPresets, { locale, t }, params] = await Promise.all([listPresets(), getDictionary(), searchParams]);
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const make = typeof params.make === "string" ? params.make : "";
  const makes = [...new Set(allPresets.map((p) => p.make))].sort();

  // The catalog is a few hundred rows — filtering in memory keeps the URL
  // shareable (?q=&make=) without a query per keystroke.
  const presets = allPresets.filter(
    (p) =>
      (!make || p.make === make) &&
      (!q || `${p.make} ${p.model} ${p.year}`.toLowerCase().includes(q)),
  );

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

      <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto]">
        <TextInput
          name="q"
          defaultValue={q}
          placeholder={t.admin.presets.searchPlaceholder}
          aria-label={t.admin.presets.search}
          dir="auto"
        />
        <Select name="make" defaultValue={make} aria-label={t.admin.presets.allMakes}>
          <option value="">{t.admin.presets.allMakes}</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline" locale={locale} icon={<Search className="h-4 w-4" />}>
          {t.admin.presets.search}
        </Button>
      </form>
      <p className="-mt-4 font-mono text-xs text-muted">
        {t.admin.presets.showing
          .replace("{count}", formatNumber(locale, presets.length))
          .replace("{total}", formatNumber(locale, allPresets.length))}
      </p>

      {allPresets.length === 0 ? (
        <p className="text-body">{t.admin.presets.empty}</p>
      ) : presets.length === 0 ? (
        <p className="text-body">{t.admin.presets.noMatches}</p>
      ) : (
        <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline/60">
          {presets.map((preset, index) => (
            <Link
              key={preset.id}
              href={`/admin/presets/${preset.id}`}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 bg-surface-card/70 backdrop-blur-sm px-6 py-4 hover:bg-surface-elevated/80"
            >
              <span className="font-mono text-xs text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-on-dark">
                {preset.make} {preset.model}{" "}
                <span className="font-mono text-body">/ {preset.year}</span>
              </span>
              <span className="font-mono text-xs text-m-red ltr:uppercase ltr:tracking-[0.05em]">
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
