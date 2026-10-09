import { Send, Unlink } from "lucide-react";
import { connectTelegram, disconnectTelegram } from "@/lib/account/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

// Account-page panel for the Telegram link: status line plus connect /
// reconnect / disconnect. Same surface treatment as AccountForm beside it.
export function TelegramConnect({
  linked,
  available,
  locale,
  t,
}: {
  linked: boolean;
  available: boolean;
  locale: Locale;
  t: Dictionary;
}) {
  const copy = t.account.telegram;

  return (
    <section className="flex flex-col gap-4 border border-hairline bg-surface-card/70 p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-1">
        <h2 className={`text-lg font-bold text-on-dark ${locale === "en" ? "uppercase tracking-[-0.01em]" : ""}`}>
          {copy.title}
        </h2>
        <p className={`text-sm ${linked ? "text-success" : "text-body"}`} role="status">
          {linked ? copy.connected : copy.notConnected}
        </p>
      </div>

      {available ? (
        <div className="flex flex-wrap items-center gap-3">
          <form action={connectTelegram}>
            <Button
              type="submit"
              variant={linked ? "outline" : "primary"}
              locale={locale}
              icon={<Send className="h-4 w-4 rtl:scale-x-[-1]" />}
            >
              {linked ? copy.reconnect : copy.connect}
            </Button>
          </form>
          {linked && (
            <form action={disconnectTelegram}>
              <Button type="submit" variant="danger" locale={locale} icon={<Unlink className="h-4 w-4" />}>
                {copy.disconnect}
              </Button>
            </form>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">{copy.unavailable}</p>
      )}

      {available && <p className="text-xs text-muted">{copy.hint}</p>}
    </section>
  );
}
