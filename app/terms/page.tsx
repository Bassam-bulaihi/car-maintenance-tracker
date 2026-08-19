import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/locale";
import { ContentPage } from "@/components/home/content-page";

export const metadata: Metadata = { title: "Terms of service" };

export default async function TermsPage() {
  const { locale, t } = await getDictionary();
  return (
    <ContentPage
      title={t.pages.terms.title}
      eyebrow={`${t.pages.lastUpdated}: ${t.pages.updatedDate}`}
      sections={t.pages.terms.sections}
      locale={locale}
      t={t}
    >
      <p className="border border-hairline bg-surface-card p-4 text-sm text-muted">
        {t.pages.draftNotice}
      </p>
    </ContentPage>
  );
}
