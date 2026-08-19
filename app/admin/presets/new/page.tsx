import { PresetForm } from "@/components/admin/preset-form";
import { BackLink } from "@/components/ui/back-link";
import { BracketLabel } from "@/components/ui/bracket-label";
import { createPreset } from "@/lib/admin/actions";
import { getDictionary } from "@/lib/i18n/locale";

export default async function NewPresetPage() {
  const { locale, t } = await getDictionary();

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/presets">{t.admin.presets.title}</BackLink>
      <div className="flex flex-col gap-2">
        <BracketLabel>{t.admin.presets.eyebrow}</BracketLabel>
        <h1
          className={`text-[32px] font-bold leading-[0.95] text-on-dark ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
        >
          {t.admin.presets.newTitle}
        </h1>
      </div>
      <PresetForm
        action={createPreset}
        submitLabel={t.admin.presets.createSubmit}
        locale={locale}
        t={t}
      />
    </div>
  );
}
