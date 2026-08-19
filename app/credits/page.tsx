import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getDictionary } from "@/lib/i18n/locale";
import { ContentPage } from "@/components/home/content-page";
import credits from "@/lib/home/image-credits.json";

export const metadata: Metadata = { title: "Image credits" };

// The car photography is licensed from Wikimedia Commons. CC BY and
// CC BY-SA both require attribution, so every image used on the site is
// credited here with its author, licence, and source page.
export default async function CreditsPage() {
  const { locale, t } = await getDictionary();
  const entries = Object.entries(credits as Record<string, {
    title: string;
    artist: string;
    license: string;
    source: string;
  }>);

  return (
    <ContentPage title={t.pages.credits.title} locale={locale} t={t}>
      <p className="text-pretty font-light leading-relaxed text-body">{t.pages.credits.intro}</p>

      <ul className="grid grid-cols-1 gap-px border border-hairline bg-hairline">
        {entries.map(([slug, c]) => (
          <li key={slug} className="flex flex-col gap-2 bg-surface-card p-5">
            <span className="font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.08em]">
              {slug}
            </span>
            <span className="text-on-dark" dir="ltr">
              {c.title}
            </span>
            <span className="text-sm text-body" dir="ltr">
              {c.artist} · {c.license}
            </span>
            <a
              href={c.source}
              target="_blank"
              rel="noreferrer noopener"
              dir="ltr"
              className="inline-flex w-fit items-center gap-2 break-all font-mono text-xs text-muted underline underline-offset-4 transition-colors hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark"
            >
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              Wikimedia Commons
            </a>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
