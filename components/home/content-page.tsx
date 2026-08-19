import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { BackLink } from "@/components/ui/back-link";
import { BracketLabel } from "@/components/ui/bracket-label";

// Shared shell for the static content pages the footer links to, so those
// links resolve to real pages instead of dead-ending in the 404.
export function ContentPage({
  title,
  eyebrow,
  sections,
  children,
  locale,
  t,
}: {
  title: string;
  eyebrow?: string;
  sections?: { heading: string; body: string }[];
  children?: ReactNode;
  locale: Locale;
  t: Dictionary;
}) {
  const upper = locale === "en" ? "uppercase tracking-[-0.02em]" : "";

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader locale={locale} t={t} />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
        <BackLink href="/">{t.home.brand}</BackLink>

        <div className="flex flex-col gap-3">
          {eyebrow && <BracketLabel>{eyebrow}</BracketLabel>}
          <h1 className={`text-[40px] font-bold leading-[1.02] text-on-dark ${upper}`}>{title}</h1>
        </div>

        {sections && (
          <div className="flex flex-col gap-px bg-hairline">
            {sections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-3 bg-canvas py-8">
                <h2 className="text-xl font-bold text-on-dark">{section.heading}</h2>
                <p className="text-pretty font-light leading-relaxed text-body">{section.body}</p>
              </section>
            ))}
          </div>
        )}

        {children}
      </main>

      <SiteFooter t={t} />
    </div>
  );
}
