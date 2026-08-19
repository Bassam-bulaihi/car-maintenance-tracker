import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// docs/arabic-web-design.md: "Flip directional icons... horizontally in RTL
// mode." rtl:scale-x-[-1] mirrors the arrow to point right under dir="rtl".
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm text-muted hover:text-on-dark"
    >
      <ArrowLeft className="h-4 w-4 rtl:scale-x-[-1]" aria-hidden="true" />
      {children}
    </Link>
  );
}
