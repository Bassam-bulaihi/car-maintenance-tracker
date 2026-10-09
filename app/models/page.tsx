import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/locale";
import { getPublicCatalog } from "@/lib/home/catalog";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { BackLink } from "@/components/ui/back-link";
import { BracketLabel } from "@/components/ui/bracket-label";
import { CatalogBrowser } from "@/components/home/catalog-browser";

export const metadata: Metadata = { title: "Models" };

export default async function ModelsPage() {
  const [{ locale, t }, catalog] = await Promise.all([getDictionary(), getPublicCatalog()]);
  const c = t.pages.catalog;
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
  const makes = new Set(catalog.map((m) => m.make)).size;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader locale={locale} t={t} />
      <main className="mx-auto flex w-full max-w-[1216px] flex-1 flex-col gap-10 px-6 py-16">
        <BackLink href="/">{t.home.brand}</BackLink>
        <div className="flex flex-col gap-3">
          <BracketLabel>{c.eyebrow}</BracketLabel>
          <h1 className={`text-[40px] font-bold leading-[1.02] text-on-dark ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}>
            {c.title}
          </h1>
          <p className="max-w-2xl text-body">
            {c.intro.replace("{models}", nf.format(catalog.length)).replace("{makes}", nf.format(makes))}
          </p>
        </div>
        <CatalogBrowser catalog={catalog} locale={locale} t={t} />
      </main>
      <SiteFooter t={t} />
    </div>
  );
}
