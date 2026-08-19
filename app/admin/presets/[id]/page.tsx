import { notFound } from "next/navigation";
import { getPresetWithItems } from "@/lib/admin/data";
import { updatePreset } from "@/lib/admin/actions";
import { PresetForm } from "@/components/admin/preset-form";
import { PresetActiveToggle } from "@/components/admin/preset-active-toggle";
import { ServiceItemRow } from "@/components/admin/service-item-row";
import { AddServiceItemForm } from "@/components/admin/add-service-item-form";
import { SERVICE_TYPES } from "@/lib/admin/service-types";

export default async function EditPresetPage({
  params,
}: PageProps<"/admin/presets/[id]">) {
  const { id } = await params;
  const preset = await getPresetWithItems(id);

  if (!preset) {
    notFound();
  }

  const usedTypes = new Set(preset.preset_service_items.map((i) => i.service_type));
  const availableTypes = SERVICE_TYPES.filter((t) => !usedTypes.has(t.value));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-dark">
          {preset.make} {preset.model} — {preset.year}
        </h1>
        <PresetActiveToggle presetId={preset.id} isActive={preset.is_active} />
      </div>

      <PresetForm
        action={updatePreset.bind(null, preset.id)}
        initial={preset}
        submitLabel="حفظ التغييرات"
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-on-dark">فترات الصيانة</h2>
        <div className="border border-hairline bg-surface-card px-6">
          {preset.preset_service_items.length === 0 ? (
            <p className="py-4 text-body">لم تتم إضافة أي خدمات بعد.</p>
          ) : (
            preset.preset_service_items.map((item) => (
              <ServiceItemRow key={item.id} item={item} presetId={preset.id} />
            ))
          )}
          <AddServiceItemForm presetId={preset.id} availableTypes={[...availableTypes]} />
        </div>
      </section>
    </div>
  );
}
