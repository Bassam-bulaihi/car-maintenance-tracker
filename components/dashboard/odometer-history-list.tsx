import { Globe, Send } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { formatDate, formatNumber } from "@/lib/i18n/format";
import { UndoReadingButton } from "@/components/dashboard/undo-reading-button";

// Recent readings with where each came from — makes it visible that a
// Telegram reply really landed.
export function OdometerHistoryList({
  vehicleId,
  readings,
  locale,
  t,
}: {
  vehicleId: string;
  readings: { id: string; reading_km: number; source: string; recorded_at: string }[];
  locale: Locale;
  t: Dictionary;
}) {
  if (readings.length === 0) {
    return <p className="py-4 text-body">{t.dashboard.readingsEmpty}</p>;
  }

  return (
    <div className="border border-hairline bg-surface-card/70 px-6 backdrop-blur-sm">
      {readings.map((reading, index) => {
        // Only the newest reading can be undone, and never the first one.
        const canUndo = index === 0 && readings.length > 1;
        const viaTelegram = reading.source === "telegram";
        const Icon = viaTelegram ? Send : Globe;
        return (
          <div
            key={reading.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-hairline py-3 last:border-b-0"
          >
            <span className="font-mono text-on-dark">
              {formatNumber(locale, reading.reading_km)} {t.common.km}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Icon className="h-3.5 w-3.5 rtl:scale-x-[-1]" aria-hidden="true" />
              {viaTelegram ? t.dashboard.sourceTelegram : t.dashboard.sourceWeb}
            </span>
            <span className="flex flex-col items-end gap-1">
              <span className="font-mono text-xs text-muted">{formatDate(locale, reading.recorded_at)}</span>
              {canUndo && (
                <UndoReadingButton
                  vehicleId={vehicleId}
                  locale={locale}
                  confirmLabel={t.common.confirm}
                  cancelLabel={t.common.cancel}
                  label={t.dashboard.undoReading}
                  confirmText={t.dashboard.undoReadingConfirm
                    .replace("{reading}", formatNumber(locale, reading.reading_km))
                    .replace("{previous}", formatNumber(locale, readings[1].reading_km))}
                />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
