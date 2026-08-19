import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { Locale } from "@/lib/i18n/dictionaries";

type Variant = "primary" | "outline" | "danger";
type Size = "md" | "sm";

// docs/DESIGN.md `{component.button-primary}` / `{component.button-primary-outline}`:
// rounded-none, uppercase + 1.5px tracking button label — but that
// letterspacing/uppercase treatment only applies to Latin script (Arabic has
// no case and tracking breaks letter-joining), so it's locale-gated here per
// docs/arabic-web-design.md.
const base =
  "inline-flex items-center justify-center gap-2 rounded-none border font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "border-on-dark text-on-dark hover:bg-on-dark hover:text-canvas",
  outline: "border-hairline text-body hover:border-on-dark hover:text-on-dark",
  danger: "border-hairline text-m-red hover:border-m-red",
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
