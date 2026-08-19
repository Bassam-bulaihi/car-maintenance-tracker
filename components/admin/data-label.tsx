import type { ReactNode } from "react";

// Admin-only micro-typography treatment (industrial-brutalist blend) —
// telemetry-style field labels. Scoped to admin so the rest of the app
// keeps docs/DESIGN.md's plain field-label style.
export function DataLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-mono text-[11px] text-muted ltr:uppercase ltr:tracking-[0.08em]"
    >
      {children}
    </label>
  );
}
