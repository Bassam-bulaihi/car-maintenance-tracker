"use client";

import { useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { addRecommendedPart, deleteRecommendedPart } from "@/lib/admin/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { TextInput } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";

export function RecommendedPartsList({
  presetId,
  parts,
  locale,
  t,
}: {
  presetId: string;
  parts: { id: string; part_name: string }[];
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    addRecommendedPart.bind(null, presetId),
    undefined,
  );

  return (
    <div className="border border-hairline bg-surface-card px-6">
      {parts.length === 0 ? (
        <p className="py-4 text-body">{t.admin.presets.noParts}</p>
      ) : (
        parts.map((part) => (
          <div
            key={part.id}
            className="flex items-center justify-between border-b border-hairline py-4 last:border-b-0"
          >
            <span className="text-on-dark">{part.part_name}</span>
            <form action={deleteRecommendedPart.bind(null, part.id, presetId)}>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                locale={locale}
                icon={<Trash2 className="h-4 w-4" />}
              >
                {t.common.delete}
              </Button>
            </form>
          </div>
        ))
      )}

      <form action={formAction} className="flex flex-wrap items-end gap-3 py-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted">{t.admin.presets.partName}</label>
          <TextInput name="part_name" required className="w-64" />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={pending}
          locale={locale}
          icon={<Plus className="h-4 w-4" />}
        >
          {t.common.add}
        </Button>
      </form>
      {state?.error && (
        <p className="pb-4 text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
