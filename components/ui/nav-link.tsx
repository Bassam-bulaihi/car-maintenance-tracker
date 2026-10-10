"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { ButtonLink } from "@/components/ui/button";

/**
 * A nav link that knows when it's the current page: sets aria-current and
 * swaps to `activeClassName`. `exact` matches only the path itself; otherwise
 * any sub-path counts (e.g. /admin/presets/123 keeps "Presets" active).
 */
export function NavLink({
  href,
  exact = false,
  className = "",
  activeClassName = "",
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  exact?: boolean;
  activeClassName?: string;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? activeClassName : ""}`}
      {...props}
    />
  );
}

/** ButtonLink that marks the current page (filled + aria-current) — for header actions. */
export function NavButtonLink({
  href,
  ...props
}: Omit<ComponentProps<typeof ButtonLink>, "variant" | "aria-current"> & { href: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return <ButtonLink href={href} variant={active ? "primary" : "outline"} aria-current={active ? "page" : undefined} {...props} />;
}
