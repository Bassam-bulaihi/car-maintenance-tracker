import { getDictionary } from "@/lib/i18n/locale";
import { SiteHeader } from "@/components/home/site-header";
import { Hero } from "@/components/home/hero";
import { VehicleLookupWidget } from "@/components/home/vehicle-lookup-widget";
import { ModelsExplorer } from "@/components/home/models-explorer";
import { HowItWorks } from "@/components/home/how-it-works";
import { ServicesBenefits } from "@/components/home/services-benefits";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBand } from "@/components/home/cta-band";
import { SiteFooter } from "@/components/home/site-footer";

export default async function Home() {
  const { locale, t } = await getDictionary();

  return (
    <div id="top" className="flex flex-1 flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:border focus:border-on-dark focus:bg-canvas focus:px-4 focus:py-2 focus:text-sm focus:text-on-dark"
      >
        {t.home.skipToContent}
      </a>

      <SiteHeader locale={locale} t={t} />

      <main id="main" className="flex flex-1 flex-col">
        <Hero locale={locale} t={t} />
        <VehicleLookupWidget locale={locale} t={t} />
        <ModelsExplorer locale={locale} t={t} />
        <HowItWorks locale={locale} t={t} />
        <ServicesBenefits locale={locale} t={t} />
        <Testimonials locale={locale} t={t} />
        <CtaBand locale={locale} t={t} />
      </main>

      <SiteFooter t={t} />
    </div>
  );
}
