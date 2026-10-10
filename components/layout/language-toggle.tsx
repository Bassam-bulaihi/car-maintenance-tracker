import { Languages } from "lucide-react";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const other: Locale = locale === "ar" ? "en" : "ar";
  const otherLabel = other === "ar" ? "العربية" : "English";
  const shortLabel = other === "ar" ? "ع" : "EN";

  return (
    <form action={setLocale.bind(null, other)}>
      <button
        type="submit"
        aria-label={otherLabel}
        lang={other}
        className="flex h-10 items-center gap-2 rounded-none border border-hairline px-3 text-sm text-body hover:border-on-dark hover:text-on-dark"
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
        {/* Short label on phones so headers with several controls fit. */}
        <span className="sm:hidden" aria-hidden="true">
          {shortLabel}
        </span>
        <span className="hidden sm:inline" aria-hidden="true">
          {otherLabel}
        </span>
      </button>
    </form>
  );
}
