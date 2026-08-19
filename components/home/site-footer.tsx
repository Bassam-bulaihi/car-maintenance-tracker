import Link from "next/link";
import { AtSign, Camera, Briefcase, MessageCircle } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Figma "Footer / Mini / 5": brand heading, a row of social icon links,
// and a row of navigation links. Extended with the product/company/legal
// grouping and legal links the design omits.
export function SiteFooter({ t }: { t: Dictionary }) {
  const year = new Date().getFullYear();

  // Lucide v1 dropped its brand glyphs (trademark), and CLAUDE.md pins the
  // project to Lucide only — so these are generic marks, identified by
  // their accessible labels rather than by logo.
  const social = [
    { icon: AtSign, label: t.home.footer.social.twitter, href: "https://x.com" },
    { icon: Camera, label: t.home.footer.social.instagram, href: "https://instagram.com" },
    { icon: Briefcase, label: t.home.footer.social.linkedin, href: "https://linkedin.com" },
    { icon: MessageCircle, label: t.home.footer.social.whatsapp, href: "https://whatsapp.com" },
  ];

  const columns = [
    {
      title: t.home.footer.product,
      links: [
        { label: t.home.footer.links.howItWorks, href: "#how-it-works" },
        { label: t.home.footer.links.models, href: "#models" },
        { label: t.home.footer.links.features, href: "#features" },
      ],
    },
    {
      title: t.home.footer.company,
      links: [
        { label: t.home.footer.links.about, href: "/about" },
        { label: t.home.footer.links.contact, href: "/contact" },
      ],
    },
    {
      title: t.home.footer.legal,
      links: [
        { label: t.home.footer.links.privacy, href: "/privacy" },
        { label: t.home.footer.links.terms, href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <span className="text-lg font-bold text-on-dark">{t.home.brand}</span>
          <p className="max-w-xs text-sm font-light text-body">{t.home.footer.tagline}</p>
          <ul className="flex items-center gap-3 pt-2">
            {social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center border border-hairline text-body transition-colors hover:border-on-dark hover:bg-on-dark hover:text-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
                >
                  <s.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
            <span className="font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.08em]">
              {col.title}
            </span>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-body transition-colors hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-hairline px-6 py-6">
        <p className="mx-auto max-w-[1440px] font-mono text-xs text-muted">
          © {year} {t.home.brand}. {t.home.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
