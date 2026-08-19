import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/locale";
import { ContentPage } from "@/components/home/content-page";

export const metadata: Metadata = { title: "About us" };

export default async function AboutPage() {
  const { locale, t } = await getDictionary();
  return (
    <ContentPage
      title={t.pages.about.title}
      sections={t.pages.about.sections}
      locale={locale}
      t={t}
    />
  );
}
