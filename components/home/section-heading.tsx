import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { BracketLabel } from "@/components/ui/bracket-label";

// Figma section header pattern: title on the left, "View all" text-link on
// the right (docs/DESIGN.md {component.text-link}).
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  viewAll,
  locale,
  align = "start",
  id,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  // Either a link or an in-page action (e.g. clearing an active filter).
  viewAll?: { href: string; label: string } | { onClick: () => void; label: string };
  locale: Locale;
  align?: "start" | "center";
  id?: string;
}) {
  const upper = locale === "en" ? "uppercase tracking-[-0.02em]" : "";
  const centered = align === "center";
  const viewAllClass = `group/link inline-flex items-center gap-2 text-sm font-bold text-on-dark transition-colors hover:text-body focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark ${
    locale === "en" ? "uppercase tracking-[1.5px]" : ""
  }`;

  return (
    <div
      className={`flex flex-wrap items-end gap-6 ${
        centered ? "flex-col items-center text-center" : "justify-between"
      }`}
    >
      <div className={`flex flex-col gap-3 ${centered ? "items-center" : ""}`}>
        {eyebrow && <BracketLabel>{eyebrow}</BracketLabel>}
        <h2
          id={id}
          className={`text-balance text-[32px] font-bold leading-[1.02] text-on-dark sm:text-[40px] ${upper}`}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`text-pretty font-light leading-relaxed text-body ${
              centered ? "max-w-2xl" : "max-w-xl"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {viewAll &&
        ("href" in viewAll ? (
          <Link href={viewAll.href} className={viewAllClass}>
            {viewAll.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1 rtl:scale-x-[-1]" aria-hidden="true" />
          </Link>
        ) : (
          <button type="button" onClick={viewAll.onClick} className={viewAllClass}>
            {viewAll.label}
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
    </div>
  );
}
