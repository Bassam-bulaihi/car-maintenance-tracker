import { listActivePresets } from "@/lib/dashboard/data";
import { getDictionary } from "@/lib/i18n/locale";
import { RegisterVehicleForm } from "@/components/dashboard/register-vehicle-form";
import { BackLink } from "@/components/ui/back-link";
import { BracketLabel } from "@/components/ui/bracket-label";

export default async function NewVehiclePage() {
  const [presets, { locale, t }] = await Promise.all([listActivePresets(), getDictionary()]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
      <BackLink href="/dashboard">{t.dashboard.backToVehicles}</BackLink>
      <div className="flex flex-col gap-2">
        <BracketLabel>{t.dashboard.eyebrow}</BracketLabel>
        <h1
          className={`text-[32px] font-bold leading-[0.95] text-on-dark ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
        >
          {t.dashboard.registerTitle}
        </h1>
      </div>
      <RegisterVehicleForm presets={presets} locale={locale} t={t} />
    </main>
  );
}
