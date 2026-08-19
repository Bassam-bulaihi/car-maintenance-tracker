"use client";

import { useEffect, useRef } from "react";

// Animated mesh-gradient backdrop rendered once for the whole site. It sits
// fixed behind every page at the bottom of the stacking order, with a scrim
// over it so foreground text keeps its contrast.
//
// docs/DESIGN.md's "no gradient backdrops" rule is deliberately overridden
// here — the project owner supplied this exact @firecms/neat configuration
// and asked for it site-wide.
export function NeatBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Users who ask the OS to reduce motion get the flat canvas colour
    // instead of a continuously animating WebGL surface.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let gradient: { destroy: () => void; yOffset: number } | null = null;
    let cancelled = false;

    // Loaded lazily so the ~three.js payload never blocks first paint and a
    // WebGL-less browser degrades to the plain background instead of erroring.
    import("@firecms/neat")
      .then(({ NeatGradient }) => {
        if (cancelled || !canvasRef.current) return;
        gradient = new NeatGradient({
          ref: canvasRef.current,
          colors: [
            { color: "#E80A0A", enabled: true },
            { color: "#0E1CFF", enabled: true },
            { color: "#0C091C", enabled: true },
            { color: "#020207", enabled: true },
            { color: "#02152A", enabled: true },
            { color: "#B8D4E6", enabled: false },
          ],
          speed: 2,
          horizontalPressure: 3,
          verticalPressure: 5,
          waveFrequencyX: 1,
          waveFrequencyY: 3,
          waveAmplitude: 8,
          shadows: 0,
          highlights: 2,
          colorBrightness: 1,
          colorSaturation: 6,
          wireframe: false,
          colorBlending: 7,
          backgroundColor: "#003FFF",
          backgroundAlpha: 1,
          grainScale: 2,
          grainSparsity: 0,
          grainIntensity: 0.175,
          grainSpeed: 1,
          resolution: 1,
          yOffset: -0.16668701171875,
        });
      })
      .catch(() => {
        /* WebGL unavailable — the static background colour stands in. */
      });

    const onScroll = () => {
      if (gradient) gradient.yOffset = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      gradient?.destroy();
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-canvas">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Legibility scrim — keeps body copy at an accessible contrast ratio
          over the animating colours underneath. */}
      <div className="absolute inset-0 bg-canvas/80" />
    </div>
  );
}
