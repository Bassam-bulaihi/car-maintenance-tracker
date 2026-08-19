import { notFound } from "next/navigation";
import { getPresetWithItems } from "@/lib/admin/data";
import { updatePreset } from "@/lib/admin/actions";
import { getDictionary } from "@/lib/i18n/locale";
import { PresetForm } from "@/components/admin/preset-form";
import { PresetActiveToggle } from "@/components/admin/preset-active-toggle";
import { ServiceItemRow } from "@/components/admin/service-item-row";
import { AddServiceItemForm } from "@/components/admin/add-service-item-form";
import { RecommendedPartsList } from "@/components/admin/recommended-parts-list";
import { BackLink } from "@/components/ui/back-link";
import { BracketLabel } from "@/components/ui/bracket-label";
import { SectionHeader } from "@/components/admin/section-header";

export default async function EditPresetPage({
  params,
}: PageProps<"/admin/presets/[id]">) {
  const { id } = await params;
  const [preset, { locale, t }] = await Promise.all([
    getPresetWithItems(id),
    getDictionary(),
  ]);

  if (!preset) {
    notFound();
  }

  const usedTypes = new Set(preset.preset_service_items.map((i) => i.service_type));

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <BackLink href="/admin/presets">{t.admin.presets.title}</BackLink>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <BracketLabel>UNIT / {preset.id.slice(0, 8)}</BracketLabel>
            <h1
              className={`text-[40px] font-bold leading-[0.95] text-on-dark ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
            >
              {preset.make} {preset.model}{" "}
              <span className="font-mono text-body">/ {preset.year}</span>
            </h1>
          </div>
          <PresetActiveToggle
            presetId={preset.id}
            isActive={preset.is_active}
            locale={locale}
            t={t}
          />
        </div>
      </div>

      <PresetForm
        action={updatePreset.bind(null, preset.id)}
        initial={preset}
        submitLabel={t.admin.presets.updateSubmit}
        locale={locale}
        t={t}
      />

      <section className="flex flex-col gap-3">
        <SectionHeader>{t.admin.presets.serviceIntervals}</SectionHeader>
        <div className="border border-hairline bg-surface-card px-6 py-2">
          {preset.preset_service_items.length === 0 ? (
            <p className="py-4 text-body">{t.admin.presets.noServiceItems}</p>
          ) : (
            preset.preset_service_items.map((item) => (
              <ServiceItemRow key={item.id} item={item} presetId={preset.id} locale={locale} t={t} />
            ))
          )}
          <AddServiceItemForm presetId={preset.id} usedTypes={usedTypes} locale={locale} t={t} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader>{t.admin.presets.recommendedParts}</SectionHeader>
        <RecommendedPartsList
          presetId={preset.id}
          parts={preset.preset_recommended_parts}
          locale={locale}
          t={t}
        />
      </section>
    </div>
  );
}
