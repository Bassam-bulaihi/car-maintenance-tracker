import Link from "next/link";
import { CheckCheck, RotateCcw } from "lucide-react";
import { countSupportMessages, listSupportMessages } from "@/lib/admin/data";
import { setSupportMessageStatus } from "@/lib/admin/actions";
import { getDictionary } from "@/lib/i18n/locale";
import { formatDate, formatNumber } from "@/lib/i18n/format";
import { Button } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";

export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const params = await searchParams;
  const status = params.status === "resolved" ? "resolved" : "open";
  const [messages, counts, { locale, t }] = await Promise.all([
    listSupportMessages(status),
    countSupportMessages(),
    getDictionary(),
  ]);
  const m = t.admin.messages;
  const tabCase = locale === "en" ? "uppercase tracking-[1.5px]" : "";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <BracketLabel>{m.eyebrow}</BracketLabel>
        <h1
          className={`text-[32px] font-bold leading-[0.95] text-on-dark break-words sm:text-[40px] ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
        >
          {m.title}
        </h1>
        <p className="max-w-2xl text-body">{m.intro}</p>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label={m.title}>
        {(["open", "resolved"] as const).map((tab) => (
          <Link
            key={tab}
            href={`/admin/messages?status=${tab}`}
            aria-current={tab === status ? "page" : undefined}
            className={`inline-flex items-center gap-2 border px-4 py-2 text-sm font-bold transition-colors ${tabCase} ${
              tab === status ? "border-on-dark bg-on-dark text-canvas" : "border-hairline text-body hover:border-on-dark hover:text-on-dark"
            }`}
          >
            {m[tab]}
            <span className="font-mono text-xs">{formatNumber(locale, counts[tab])}</span>
          </Link>
        ))}
      </nav>

      {messages.length === 0 ? (
        <p className="border border-hairline bg-surface-card/70 px-6 py-10 text-center text-body">{m.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <li key={message.id} className="flex flex-col gap-4 border border-hairline bg-surface-card/70 p-5 backdrop-blur-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-bold text-on-dark">{message.users.name}</span>
                <span className="font-mono text-xs text-muted" dir="ltr">
                  {message.users.email}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words text-body-strong" dir="auto">
                {message.body}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3">
                <span className="font-mono text-xs text-muted">
                  {m.receivedAt}: {formatDate(locale, message.created_at)}
                  {message.resolved_at ? ` · ${m.resolvedAt}: ${formatDate(locale, message.resolved_at)}` : ""}
                </span>
                <form action={setSupportMessageStatus.bind(null, message.id, status === "open" ? "resolved" : "open")}>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    locale={locale}
                    icon={status === "open" ? <CheckCheck className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                  >
                    {status === "open" ? m.resolve : m.reopen}
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
