"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";
import { Button, ButtonLink } from "@/components/ui/button";
import { BracketLabel } from "@/components/ui/bracket-label";
import { MStripeDivider } from "@/components/layout/m-stripe-divider";

// Route-level error boundary, styled like not-found. Client component, so
// the language comes from the <html lang> the root layout already set.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const locale: Locale =
    typeof document !== "undefined" && document.documentElement.lang === "en" ? "en" : "ar";
  const t = dictionaries[locale].home.error;

  return (
    <div className="flex flex-1 flex-col">
      <MStripeDivider />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <BracketLabel>{t.code}</BracketLabel>
        <h1
          className={`text-[40px] font-bold leading-[1.02] text-on-dark sm:text-[56px] ${locale === "en" ? "uppercase tracking-[-0.02em]" : ""}`}
        >
          {t.title}
        </h1>
        <p className="max-w-md text-pretty font-light text-body">{t.desc}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button type="button" locale={locale} icon={<RotateCcw className="h-4 w-4" />} onClick={() => reset()}>
            {t.retry}
          </Button>
          <ButtonLink href="/" variant="outline" locale={locale}>
            {t.home}
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
