import type { Metadata } from "next";
import { Mail, Clock } from "lucide-react";
import { getDictionary } from "@/lib/i18n/locale";
import { ContentPage } from "@/components/home/content-page";
import { DataLabel } from "@/components/ui/data-label";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { locale, t } = await getDictionary();

  return (
    <ContentPage title={t.pages.contact.title} locale={locale} t={t}>
      <p className="text-pretty font-light leading-relaxed text-body">{t.pages.contact.intro}</p>

      <dl className="grid grid-cols-1 gap-px border border-hairline bg-hairline sm:grid-cols-2">
        <div className="flex items-start gap-4 bg-surface-card p-6">
          <Mail className="mt-1 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
          <div className="flex min-w-0 flex-col gap-1">
            <dt>
              <DataLabel>{t.pages.contact.emailLabel}</DataLabel>
            </dt>
            <dd>
              <a
                href={`mailto:${t.pages.contact.email}`}
                dir="ltr"
                className="break-all font-mono text-on-dark underline underline-offset-4 transition-colors hover:text-body focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark"
              >
                {t.pages.contact.email}
              </a>
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-surface-card p-6">
          <Clock className="mt-1 h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <dt>
              <DataLabel>{t.pages.contact.responseLabel}</DataLabel>
            </dt>
            <dd className="text-on-dark">{t.pages.contact.response}</dd>
          </div>
        </div>
      </dl>
    </ContentPage>
  );
}
