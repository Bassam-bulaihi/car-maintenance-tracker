import { PresetForm } from "@/components/admin/preset-form";
import { BackLink } from "@/components/ui/back-link";
import { createPreset } from "@/lib/admin/actions";
import { getDictionary } from "@/lib/i18n/locale";

export default async function NewPresetPage() {
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/presets">{t.admin.presets.title}</BackLink>
      <h1 className="text-[32px] font-bold leading-tight text-on-dark">
        {t.admin.presets.newTitle}
      </h1>
      <PresetForm
        action={createPreset}
        submitLabel={t.admin.presets.createSubmit}
        locale={locale}
        t={t}
      />
    </div>
  );
}
