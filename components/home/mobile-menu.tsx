"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type NavLink = { href: string; label: string };

// Figma `Frame 3` (the two-line hamburger) — opens a full-screen panel on
// small screens, matching the design's mobile affordance.
export function MobileMenu({
  links,
  loginLabel,
  signupLabel,
  menuLabel,
  closeLabel,
}: {
  links: NavLink[];
  loginLabel: string;
  signupLabel: string;
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={menuLabel}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center border border-hairline text-on-dark transition-colors hover:border-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
          <div className="flex h-16 items-center justify-between border-b border-hairline px-6">
            <span className="text-lg font-bold text-on-dark">Car Auto</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="flex h-10 w-10 items-center justify-center border border-hairline text-on-dark transition-colors hover:border-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark active:translate-y-px"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex flex-col gap-px bg-hairline">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="bg-canvas px-6 py-5 text-lg text-on-dark transition-colors hover:bg-surface-card"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t border-hairline p-6">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center border border-hairline text-sm font-bold text-body transition-colors hover:border-on-dark hover:bg-on-dark hover:text-canvas"
            >
              {loginLabel}
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center border border-on-dark text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas"
            >
              {signupLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
