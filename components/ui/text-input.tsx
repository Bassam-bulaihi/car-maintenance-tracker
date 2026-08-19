import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

// docs/DESIGN.md `{component.text-input}`: surface-card bg, hairline border,
// rounded-none, 48px height, thickened border on focus. "sm" is a compact
// variant for dense inline data rows (sits next to h-10 sm buttons) —
// not part of the documented spec, used only where a full 48px field would
// visually dominate its row.
const uiSizes = {
  md: "h-12 px-4",
  sm: "h-10 px-3 text-sm",
};

// Named uiSize, not size — <input>/<select> already have a native `size`
// HTML attribute (a number), which would otherwise collide with this.
type UiSize = keyof typeof uiSizes;

const base =
  "w-full rounded-none border border-hairline bg-surface-card text-on-dark placeholder:text-muted focus:border-on-dark focus:outline-none";

export function TextInput({
  uiSize = "md",
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { uiSize?: UiSize }) {
  return <input className={`${base} ${uiSizes[uiSize]} ${className}`} {...rest} />;
}

export function Select({
  uiSize = "md",
  className = "",
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { uiSize?: UiSize }) {
  return <select className={`${base} ${uiSizes[uiSize]} ${className}`} {...rest} />;
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label className="text-sm text-body" htmlFor={htmlFor}>
      {children}
    </label>
  );
}
