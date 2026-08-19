import type { ReactNode } from "react";

// Industrial/tactical-telemetry ASCII framing, layered over the existing
// design.md typography — ASCII brackets auto-mirror correctly under dir="rtl"
// via the browser's bidi algorithm, so this works unchanged for Arabic.
export function BracketLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`font-mono text-xs text-muted ltr:uppercase ltr:tracking-[0.1em] ${className}`}>
      [ {children} ]
    </span>
  );
}
