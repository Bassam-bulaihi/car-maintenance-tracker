import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

// docs/DESIGN.md `{component.text-input}`: surface-card bg, hairline border,
// rounded-none, 48px height, thickened border on focus.
export const textInputClass =
  "h-12 w-full rounded-none border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted focus:border-on-dark focus:outline-none";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`${textInputClass} ${className}`} {...rest} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select className={`${textInputClass} ${className}`} {...rest} />;
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
