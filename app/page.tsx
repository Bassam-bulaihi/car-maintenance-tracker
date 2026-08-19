import Link from "next/link";
import { UserPlus, MessageCircle, CheckCircle2, Bell, Users, Languages } from "lucide-react";
import { getDictionary } from "@/lib/i18n/locale";
import { TopNav } from "@/components/home/top-nav";
import { Footer } from "@/components/home/footer";
import { MStripeDivider } from "@/components/layout/m-stripe-divider";
import { Button } from "@/components/ui/button";

const stepIcons = [UserPlus, MessageCircle, CheckCircle2];
const featureIcons = [Bell, Users, Languages];

export default async function Home() {
  const { locale, t } = await getDictionary();
  const upper = locale === "en" ? "uppercase" : "";

  return (
    <div className="flex flex-1 flex-col">
      <TopNav locale={locale} t={t} />

      {/* Hero — docs/DESIGN.md {component.hero-photo-band}, without
          photography (deferred feature): type carries the full weight. */}
      <section className="flex flex-col items-center gap-8 px-6 py-24 text-center">
        <span
          className={`font-bold text-body-strong ${locale === "en" ? "text-sm uppercase tracking-[1.5px]" : "text-base"}`}
        >
          {t.home.hero.eyebrow}
        </span>
        <h1
          className={`max-w-3xl text-[56px] font-bold leading-[1.05] text-on-dark ${upper}`}
        >
          {t.home.hero.title}
        </h1>
        <p className="max-w-xl text-lg font-light text-body">{t.home.hero.subtitle}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup">
            <Button locale={locale}>{t.home.hero.ctaPrimary}</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" locale={locale}>
              {t.home.hero.ctaSecondary}
            </Button>
          </Link>
        </div>
      </section>

      <MStripeDivider />

      {/* How it works — scraped from the LUXEDRIVE Figma home page's
          "Browse / Book / Enjoy" 3-step section. */}
      <section className="flex flex-col gap-12 px-6 py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span
            className={`font-bold text-body-strong ${locale === "en" ? "text-sm uppercase tracking-[1.5px]" : "text-base"}`}
          >
            {t.home.howItWorks.eyebrow}
          </span>
          <h2 className={`text-[40px] font-bold leading-[1.1] text-on-dark ${upper}`}>
            {t.home.howItWorks.title}
          </h2>
        </div>
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {t.home.howItWorks.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={step.title} className="flex flex-col gap-4 border border-hairline bg-surface-card p-6">
                <Icon className="h-8 w-8 text-on-dark" aria-hidden="true" />
                <span className="text-xl font-bold text-on-dark">{step.title}</span>
                <p className="font-light text-body">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features — scraped from the "Services & Benefits" icon row. */}
      <section className="flex flex-col gap-12 bg-surface-soft px-6 py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span
            className={`font-bold text-body-strong ${locale === "en" ? "text-sm uppercase tracking-[1.5px]" : "text-base"}`}
          >
            {t.home.features.eyebrow}
          </span>
          <h2 className={`text-[40px] font-bold leading-[1.1] text-on-dark ${upper}`}>
            {t.home.features.title}
          </h2>
        </div>
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {t.home.features.items.map((feature, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={feature.title} className="flex flex-col items-center gap-3 text-center">
                <Icon className="h-8 w-8 text-on-dark" aria-hidden="true" />
                <span className="text-lg font-bold text-on-dark">{feature.title}</span>
                <p className="font-light text-body">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA band — docs/DESIGN.md {component.cta-band-photo}, type-only. */}
      <section className="flex flex-col items-center gap-6 px-6 py-20 text-center">
        <h2 className={`text-[32px] font-bold text-on-dark ${upper}`}>{t.home.cta.title}</h2>
        <p className="text-body">{t.home.cta.subtitle}</p>
        <Link href="/signup">
          <Button locale={locale}>{t.home.cta.button}</Button>
        </Link>
      </section>

      <Footer t={t} />
    </div>
  );
}
