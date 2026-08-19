import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/locale";
import { ContentPage } from "@/components/home/content-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default async function PrivacyPage() {
  const { locale, t } = await getDictionary();
  return (
    <ContentPage
      title={t.pages.privacy.title}
      eyebrow={`${t.pages.lastUpdated}: ${t.pages.updatedDate}`}
      sections={t.pages.privacy.sections}
      locale={locale}
      t={t}
    >
      <p className="border border-hairline bg-surface-card/70 backdrop-blur-sm p-4 text-sm text-muted">
        {t.pages.draftNotice}
      </p>
    </ContentPage>
  );
}
