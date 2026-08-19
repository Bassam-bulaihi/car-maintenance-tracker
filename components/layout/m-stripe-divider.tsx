// docs/DESIGN.md `{component.m-stripe-divider}` — the system's signature
// brand-identity accent. Used sparingly, never as a button fill.
export function MStripeDivider() {
  return (
    <div
      aria-hidden="true"
      className="h-1 w-full"
      style={{
        background:
          "linear-gradient(to var(--stripe-direction, right), var(--color-m-blue-light), var(--color-m-blue-dark), var(--color-m-red))",
      }}
    />
  );
}
