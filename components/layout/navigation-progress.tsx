"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Immediate feedback that something is happening, so a slow page never looks
 * frozen or like the click didn't register:
 * - a thin bar along the top that starts the moment an internal link is
 *   clicked or a form is submitted, eases towards 90%, and completes when the
 *   new page has rendered (or the submit finished);
 * - the "working" cursor on the whole page meanwhile (html.is-busy).
 * Purely visual — it never blocks interaction.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = () => {
    if (timer.current) clearInterval(timer.current);
    if (safety.current) clearTimeout(safety.current);
    timer.current = null;
    document.documentElement.classList.remove("is-busy");
    setProgress((p) => (p === null ? null : 100));
    setTimeout(() => setProgress(null), 250);
  };

  const start = () => {
    if (timer.current) return;
    document.documentElement.classList.add("is-busy");
    setProgress(8);
    // Ease towards 90%: quick at first, slower as it waits.
    timer.current = setInterval(() => setProgress((p) => (p === null ? null : p + (90 - p) * 0.08)), 120);
    safety.current = setTimeout(finish, 15000);
  };

  // A new route rendered → done (next frame, after it has painted).
  useEffect(() => {
    const frame = requestAnimationFrame(finish);
    return () => cancelAnimationFrame(frame);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / hash link
      start();
    };
    const onSubmit = () => {
      start();
      // Server actions that don't navigate: finish once no submit button is
      // busy any more (Button sets aria-busy while its form is pending).
      const watch = setInterval(() => {
        if (!document.querySelector('[aria-busy="true"]')) {
          clearInterval(watch);
          finish();
        }
      }, 200);
      setTimeout(() => clearInterval(watch), 15000);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (progress === null) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5" role="progressbar" aria-label="Loading" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <div
        className="h-full bg-on-dark transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  );
}
