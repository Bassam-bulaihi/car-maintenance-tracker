import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { listFollowUps } from "@/lib/admin/data";
import { resolveFollowUp } from "@/lib/admin/actions";
import { getDictionary } from "@/lib/i18n/locale";
import { formatDate, formatNumber } from "@/lib/i18n/format";
import { MAX_REPLY_ATTEMPTS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";

export default async function AdminFollowUpsPage() {
  const [threads, { locale, t }] = await Promise.all([listFollowUps(), getDictionary()]);
  const f = t.admin.followUps;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <BracketLabel>{f.eyebrow}</BracketLabel>
        <h1
          className={`text-[40px] font-bold leading-[0.95] text-on-dark break-words ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
        >
          {f.title}
        </h1>
        <p className="max-w-2xl text-body">{f.intro.replace("{max}", formatNumber(locale, MAX_REPLY_ATTEMPTS))}</p>
      </div>

      {threads.length === 0 ? (
        <p className="border border-hairline bg-surface-card/70 px-6 py-10 text-center text-body">{f.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-px border border-hairline bg-hairline/60">
          {threads.map((thread) => {
            const user = thread.vehicles.users;
            return (
              <div
                key={thread.id}
                className="grid grid-cols-1 gap-4 bg-surface-card/70 px-6 py-5 backdrop-blur-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.08em]">{f.user}</dt>
                    <dd className="text-on-dark">{user.name}</dd>
                    <dd className="font-mono text-xs text-muted" dir="ltr">
                      {user.phone_number}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.08em]">{f.vehicle}</dt>
                    <dd className="text-on-dark">
                      {thread.vehicles.make} {thread.vehicles.model}
                    </dd>
                    <dd className="font-mono text-xs text-muted">
                      {formatNumber(locale, thread.vehicles.current_odometer)} {t.common.km}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.08em]">{f.lastReply}</dt>
                    <dd className="break-words font-mono text-sm text-m-red" dir="auto">
                      {thread.response_text ?? "—"}
                    </dd>
                    <dd className="font-mono text-xs text-muted">
                      {f.attempts}: {formatNumber(locale, thread.reply_attempts)}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.08em]">{f.sentAt}</dt>
                    <dd className="font-mono text-sm text-body">{thread.sent_at ? formatDate(locale, thread.sent_at) : "—"}</dd>
                  </div>
                </dl>
                <form action={resolveFollowUp.bind(null, thread.id)}>
                  <Button type="submit" size="sm" variant="outline" locale={locale} icon={<CheckCheck className="h-4 w-4" />}>
                    {f.resolve}
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      <Link href="/admin/presets" className="text-sm text-muted hover:text-on-dark">
        {t.admin.nav.presets}
      </Link>
    </div>
  );
}
