import { Unlink } from "lucide-react";
import { FaTelegram } from "react-icons/fa6";
import { connectTelegram, disconnectTelegram } from "@/lib/account/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/i18n/format";

// Account-page panel for the Telegram link: status line plus connect /
// reconnect / disconnect. Same surface treatment as AccountForm beside it.
export function TelegramConnect({
  rateLimited = false,
  linked,
  linkedAt,
  botUsername,
  locale,
  t,
}: {
  rateLimited?: boolean;
  linked: boolean;
  linkedAt: string | null;
  botUsername: string | null;
  locale: Locale;
  t: Dictionary;
}) {
  const copy = t.account.telegram;
  const available = botUsername !== null;

  return (
    <section className="flex flex-col gap-4 border border-hairline bg-surface-card/70 p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-1">
        <h2 className={`text-lg font-bold text-on-dark ${locale === "en" ? "uppercase tracking-[-0.01em]" : ""}`}>
          {copy.title}
        </h2>
        <p className={`text-sm ${linked ? "text-success" : "text-body"}`} role="status">
          {linked ? copy.connected : copy.notConnected}
        </p>
        {linked && linkedAt && (
          <p className="font-mono text-xs text-muted">{copy.linkedSince.replace("{date}", formatDate(locale, linkedAt))}</p>
        )}
      </div>

      {available ? (
        <div className="flex flex-wrap items-center gap-3">
          <form action={connectTelegram}>
            <Button
              type="submit"
              variant={linked ? "outline" : "primary"}
              locale={locale}
              icon={<FaTelegram className="h-4 w-4" aria-hidden="true" />}
            >
              {linked ? copy.reconnect : copy.connect}
            </Button>
          </form>
          {linked && botUsername && (
            <ButtonLink
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              locale={locale}
              icon={<FaTelegram className="h-4 w-4" aria-hidden="true" />}
            >
              {copy.openChat}
            </ButtonLink>
          )}
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

      {rateLimited && (
        <p className="text-sm text-m-red" role="alert">
          {copy.rateLimited}
        </p>
      )}
      {available && <p className="text-xs text-muted">{copy.hint}</p>}
    </section>
  );
}
