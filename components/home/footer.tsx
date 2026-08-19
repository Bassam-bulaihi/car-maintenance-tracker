import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// docs/DESIGN.md `{component.footer}` — black, {colors.body} text, never
// inverts.
export function Footer({ t }: { t: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline px-6 py-16 text-body">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <span className="text-lg font-bold text-on-dark">{t.home.brand}</span>
        <p className="text-sm">{t.home.footer.tagline}</p>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/login" className="hover:text-on-dark">
            {t.home.nav.login}
          </Link>
          <Link href="/signup" className="hover:text-on-dark">
            {t.home.nav.signup}
          </Link>
        </div>
        <p className="text-xs text-muted">
          © {year} {t.home.brand}. {t.home.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
