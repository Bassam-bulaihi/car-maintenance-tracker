import { serviceTypeLabel } from "@/lib/admin/service-types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function ServiceHistoryList({
  history,
  locale,
  t,
}: {
  history: { id: string; service_type: string; odometer_at_service: number; confirmed_at: string }[];
  locale: Locale;
  t: Dictionary;
}) {
  if (history.length === 0) {
    return <p className="py-4 text-body">{t.dashboard.historyEmpty}</p>;
  }

  return (
    <div className="border border-hairline bg-surface-card px-6">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-hairline py-4 last:border-b-0"
        >
          <span className="text-on-dark break-words">
            {serviceTypeLabel(entry.service_type, locale)}
          </span>
          <span className="font-mono text-sm text-body">
            {entry.odometer_at_service.toLocaleString(locale === "ar" ? "ar" : "en")}
          </span>
          <span className="font-mono text-xs text-muted">
            {new Date(entry.confirmed_at).toLocaleDateString(locale)}
          </span>
        </div>
      ))}
    </div>
  );
}
