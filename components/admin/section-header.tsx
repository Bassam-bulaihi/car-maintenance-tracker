import type { ReactNode } from "react";

// Bracket-framed section header — bolder/larger than BracketLabel (which is
// a small page eyebrow), used to break up admin content into distinct
// operational blocks per the industrial-brutalist blend. ltr: variants key
// off the ancestor dir="rtl"/"ltr" attribute, so this needs no locale prop.
export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-sm font-bold text-on-dark ltr:uppercase ltr:tracking-[0.05em]">
      [ {children} ]
    </h2>
  );
}
