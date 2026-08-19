import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDictionary } from "@/lib/i18n/locale";
import { BracketLabel } from "@/components/ui/bracket-label";
import { MStripeDivider } from "@/components/layout/m-stripe-divider";

export default async function NotFound() {
  const { locale, t } = await getDictionary();
  const upper = locale === "en" ? "uppercase tracking-[-0.02em]" : "";

  return (
    <div className="flex flex-1 flex-col">
      <MStripeDivider />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <BracketLabel>{t.home.notFound.code}</BracketLabel>
        <h1 className={`text-[40px] font-bold leading-[1.02] text-on-dark sm:text-[56px] ${upper}`}>
          {t.home.notFound.title}
        </h1>
        <p className="max-w-md text-pretty font-light text-body">{t.home.notFound.desc}</p>
        <Link
          href="/"
          className={`mt-2 inline-flex h-12 items-center gap-2 border border-on-dark px-8 text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px ${
            locale === "en" ? "uppercase tracking-[1.5px]" : ""
          }`}
        >
          {t.home.notFound.cta}
          <ArrowRight className="h-4 w-4 rtl:scale-x-[-1]" aria-hidden="true" />
        </Link>
      </main>
    </div>
  );
}
