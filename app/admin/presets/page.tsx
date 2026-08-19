import Link from "next/link";
import { listPresets } from "@/lib/admin/data";

export default async function AdminPresetsPage() {
  const presets = await listPresets();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-dark">النماذج المسبقة للمركبات</h1>
        <Link
          href="/admin/presets/new"
          className="h-12 flex items-center rounded-none border border-on-dark px-6 text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas"
        >
          + إضافة نموذج
        </Link>
      </div>

      {presets.length === 0 ? (
        <p className="text-body">لا توجد نماذج بعد.</p>
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
              {!preset.is_active && (
                <span className="text-sm text-muted">متوقف</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
