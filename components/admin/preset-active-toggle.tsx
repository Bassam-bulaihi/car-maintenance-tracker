import { setPresetActive } from "@/lib/admin/actions";

export function PresetActiveToggle({
  presetId,
  isActive,
}: {
  presetId: string;
  isActive: boolean;
}) {
  return (
    <form action={setPresetActive.bind(null, presetId, !isActive)}>
      <button
        type="submit"
        className="h-10 rounded-none border border-hairline px-4 text-sm text-on-dark hover:border-on-dark"
      >
        {isActive ? "إيقاف النموذج" : "إعادة تفعيل النموذج"}
      </button>
    </form>
  );
}
