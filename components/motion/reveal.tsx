"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

// Scroll-driven entry animation: content fades and lifts into place once it
// enters the viewport, with an optional stagger delay so groups cascade
// instead of all mounting at once.
//
// Animates transform + opacity only (GPU-composited), unobserves after the
// first reveal, and is fully skipped when the OS asks for reduced motion —
// in which case content renders in its final state immediately.
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced-motion is handled purely in CSS (globals.css forces .reveal
    // visible under the media query), so there is no JS branch for it here.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "in" : "out"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
