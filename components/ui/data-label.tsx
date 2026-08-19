import type { ReactNode } from "react";

// Industrial-brutalist micro-typography treatment — telemetry-style field
// labels. Extended app-wide from its original admin-only scope once the
// dashboard adopted the same structural/typographic blend.
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
