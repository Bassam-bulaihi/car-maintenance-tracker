"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

/**
 * Two-step destructive/irreversible action without a browser dialog: the
 * first press swaps the button for an inline question with Confirm / Cancel;
 * it resets on its own after a few seconds of no answer.
 */
export function ConfirmButton({
  label,
  question,
  confirmLabel,
  cancelLabel,
  icon,
  onConfirm,
  variant = "outline",
  size = "sm",
  locale,
  className = "",
}: {
  label: ReactNode;
  question: string;
  confirmLabel: string;
  cancelLabel: string;
  icon?: ReactNode;
  onConfirm: () => Promise<unknown> | void;
  variant?: "primary" | "outline" | "danger";
  size?: "sm" | "md";
  locale: Locale;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!asking) return;
    const timer = setTimeout(() => setAsking(false), 8000);
    return () => clearTimeout(timer);
  }, [asking]);

  if (!asking) {
    return (
      <Button type="button" variant={variant} size={size} locale={locale} icon={icon} className={className} onClick={() => setAsking(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} role="group" aria-live="polite">
      <span className="text-sm text-body-strong">{question}</span>
      <Button
        type="button"
        variant={variant === "outline" ? "primary" : variant}
        size={size}
        locale={locale}
        disabled={pending}
        icon={<Check className="h-4 w-4" />}
        onClick={() => startTransition(async () => {
          await onConfirm();
          setAsking(false);
        })}
        autoFocus
      >
        {confirmLabel}
      </Button>
      <Button type="button" variant="outline" size={size} locale={locale} disabled={pending} icon={<X className="h-4 w-4" />} onClick={() => setAsking(false)}>
        {cancelLabel}
      </Button>
    </div>
  );
}
