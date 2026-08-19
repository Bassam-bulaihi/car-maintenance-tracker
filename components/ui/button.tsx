import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Locale } from "@/lib/i18n/dictionaries";

type Variant = "primary" | "outline" | "danger";
type Size = "md" | "sm";

// docs/DESIGN.md `{component.button-primary}` / `{component.button-primary-outline}`:
// rounded-none, uppercase + 1.5px tracking button label — but that
// letterspacing/uppercase treatment only applies to Latin script (Arabic has
// no case and tracking breaks letter-joining), so it's locale-gated here per
// docs/arabic-web-design.md.
// Pressed feedback (translate-y) and a visible keyboard focus ring apply to
// every variant; disabled buttons keep neither.
const base =
  "inline-flex items-center justify-center gap-2 rounded-none border font-bold transition-colors duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark " +
  "active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0";

// Every variant inverts fully on hover (border color as resting-state
// hierarchy cue, but the same fill+invert interaction across the board) —
// a mix of "just the border changes" and "everything inverts" read as
// inconsistent between adjacent buttons.
const variants: Record<Variant, string> = {
  primary: "border-on-dark text-on-dark hover:bg-on-dark hover:text-canvas",
  outline: "border-hairline text-body hover:bg-on-dark hover:border-on-dark hover:text-canvas",
  danger: "border-hairline text-m-red hover:bg-m-red hover:border-m-red hover:text-canvas",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-8 text-sm",
  sm: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  locale,
  icon,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  locale?: Locale;
  icon?: ReactNode;
}) {
  const caseClass = locale === "en" ? "uppercase tracking-[1.5px]" : "";

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${caseClass} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
