import { PresetForm } from "@/components/admin/preset-form";
import { createPreset } from "@/lib/admin/actions";

export default function NewPresetPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-on-dark">إضافة نموذج جديد</h1>
      <PresetForm action={createPreset} submitLabel="إنشاء النموذج" />
    </div>
  );
}
