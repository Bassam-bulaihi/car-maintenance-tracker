import type { ComponentType, SVGProps } from "react";

// Side-profile silhouettes, one per BODY_TYPES slug. Lucide has no per-body
// car glyphs, and the earlier 24×24 drawings were too small to tell apart —
// these are wide (64×28) so each type's defining proportions read: a
// sedan's three boxes, a hatchback's steep rear, a pickup's open bed, a
// minivan's single tall box, an off-roader's clearance and spare wheel.
// Same stroke language as Lucide (round caps/joins, currentColor), facing
// left. docs/DESIGN.md rule 3 allows non-Lucide icons where Lucide doesn't
// cover the shape.

type IconProps = SVGProps<SVGSVGElement>;

type Shape = {
  /** Outline from the front bottom corner over the roof to the rear bottom corner. */
  body: string;
  /** Window / detail strokes. */
  details?: string;
  /** Wheel centre x positions (front, rear). */
  wheels: [number, number];
  /** Body ends (front x, rear x) at the sill line. */
  ends: [number, number];
  wheelRadius?: number;
  /** Sill (bottom edge) height. */
  sill?: number;
  /** Spare wheel on the tailgate (off-road). */
  spare?: [number, number, number];
};

const SHAPES: Record<string, Shape> = {
  sedan: {
    body: "M4 20 V16.5 Q4 14.6 6 14.3 L17 13 L24 7.6 Q25.2 6.6 27 6.6 H38 Q39.8 6.6 41 7.7 L47 13 L58 13.9 Q60.5 14.3 60.5 16.5 V20",
    details: "M25.6 12.6 L28.4 8.6 H37.4 L41.6 12.6 Z",
    wheels: [15, 49.5],
    ends: [4, 60.5],
  },
  hatchback: {
    body: "M6 20 V16.5 Q6 14.6 8 14.3 L18 13 L25 7.6 Q26 6.6 28 6.6 H42 Q44 6.6 45 8 L50 14 Q52 15 52 17 V20",
    details: "M26.6 12.6 L29.2 8.6 H41.6 L44.8 12.6 Z",
    wheels: [16.5, 42.5],
    ends: [6, 52],
  },
  suv: {
    body: "M4 20 V14 Q4 12.2 6 11.9 L14 11 L19 5 Q20 4 22 4 H50 Q53 4 54 6 L58 11.5 Q60 12 60 14 V20",
    details: "M20.6 10.4 L23.6 6 H35.5 V10.4 Z M38 10.4 V6 H50.5 Q52 6 52.6 7.2 L54.6 10.4 Z",
    wheels: [15, 49.5],
    ends: [4, 60],
    wheelRadius: 5,
  },
  crossover: {
    body: "M4 20 V15 Q4 13.2 6 12.9 L15 12 L21 6.6 Q22.4 5.6 24.5 5.6 H44 Q46.4 5.6 48 7.6 L54 12.6 Q60 13 60 15.6 V20",
    details: "M22.6 11.4 L25.6 7.6 H43.6 Q45 7.6 46 8.8 L49.6 11.4 Z",
    wheels: [15, 49],
    ends: [4, 60],
    wheelRadius: 4.8,
  },
  pickup: {
    body: "M3 20 V14 Q3 12.2 5 11.9 L12 11.3 L16 5.6 Q17 4.6 19 4.6 H30 Q32 4.6 32 6.6 V12 H61 V20",
    details: "M17.6 10.6 L20 6.8 H29.4 V10.6 Z M33 14.6 H59",
    wheels: [13, 50],
    ends: [3, 61],
    wheelRadius: 4.8,
  },
  coupe: {
    body: "M3 20 V16.6 Q3 15 5 14.8 L20 14 L28 8.6 Q29.6 7.6 32 7.6 H38 Q41 7.6 43 9 L54 14.6 Q61 15 61 17.2 V20",
    details: "M29.6 13.2 L31.8 9.8 H38.6 Q40.4 9.8 41.8 10.8 L45.6 13.2 Z",
    wheels: [14, 51],
    ends: [3, 61],
  },
  minivan: {
    body: "M4 20 V14 Q4 12.6 6 12.3 L11 11.6 L17 4.6 Q18 3.6 20 3.6 H55 Q58 3.6 58.6 6 L60 12 Q60.6 13 60.6 15 V20",
    details: "M18.6 10 L21 5.8 H31 V10 Z M33.4 10 V5.8 H43 V10 Z M45.4 10 V5.8 H55.4 Q56.6 5.8 56.8 7 L57.4 10 Z",
    wheels: [14, 50.5],
    ends: [4, 60.6],
  },
  wagon: {
    body: "M4 20 V16.5 Q4 14.6 6 14.3 L16 13 L23 7.6 Q24 6.6 26 6.6 H53 Q55 6.6 56 8.6 L59 13.6 Q60.6 14.6 60.6 16.6 V20",
    details: "M24.6 12.4 L27.4 8.6 H38 V12.4 Z M40.4 12.4 V8.6 H53 Q54.2 8.6 54.8 9.8 L56.4 12.4 Z",
    wheels: [15, 50],
    ends: [4, 60.6],
  },
  convertible: {
    body: "M3 20 V16 Q3 14 5 13.8 L58 13.2 Q61 13.6 61 16 V20",
    details: "M23.6 13.6 L27.6 8 M32 13.2 V10.4 Q32 9.4 33 9.4 H36.4",
    wheels: [14, 51],
    ends: [3, 61],
  },
  sports: {
    body: "M2 20 V17.6 Q2 16.6 4 16.3 L22 14.8 L30 10 Q31.6 9.2 34 9.2 H38 Q40 9.2 42 10.6 L50 15 Q61 15.6 62 17.6 V20",
    details: "M31.6 13.6 L33.6 11 H38.4 Q39.6 11 40.6 11.8 L43 13.6 Z M55.6 15.2 V12.6 H61.4",
    wheels: [13.5, 51],
    ends: [2, 62],
    wheelRadius: 4.4,
  },
  van: {
    body: "M3 20 V11 Q3 10 4 9.6 L9 3.6 Q10 2.6 12 2.6 H59 Q61 2.6 61 4.6 V20",
    details: "M10.6 4.6 L6.8 9.6 H16 V4.6 Z M30 4.6 V18 M33 4.6 H58.6 V9.6 H33 Z",
    wheels: [13, 51],
    ends: [3, 61],
  },
  offroad: {
    body: "M5 19 V12 Q5 10.8 6.6 10.6 L14 10.2 L17 4.6 H44 Q45 4.6 45 5.6 V10.2 H55 Q57 10.2 57 12.2 V19",
    details: "M18.6 9 L20.4 6.4 H29.6 V9 Z M32 9 V6.4 H43 V9 Z",
    wheels: [15, 46],
    ends: [5, 57],
    wheelRadius: 5.6,
    sill: 19,
    spare: [60, 13.2, 3.4],
  },
};

function silhouette(shape: Shape) {
  function BodyTypeIcon({ strokeWidth = 1.6, ...props }: IconProps) {
    const r = shape.wheelRadius ?? 4.5;
    const sill = shape.sill ?? 20;
    const cy = sill + 0.6;
    const [front, rear] = shape.ends;
    const [w1, w2] = shape.wheels;
    // Sill segments between the wheel arches, so the body line never
    // crosses a wheel.
    const sillPath = `M${front} ${sill} H${w1 - r - 1} M${w1 + r + 1} ${sill} H${w2 - r - 1} M${w2 + r + 1} ${sill} H${rear}`;
    const stroke = {
      stroke: "currentColor",
      strokeWidth,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      fill: "none",
    };
    return (
      <svg viewBox="0 0 64 28" fill="none" aria-hidden="true" {...props}>
        <path d={shape.body} {...stroke} />
        <path d={sillPath} {...stroke} />
        {shape.details && <path d={shape.details} {...stroke} strokeWidth={Number(strokeWidth) * 0.8} />}
        {[w1, w2].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={cy} r={r} {...stroke} />
            <circle cx={cx} cy={cy} r={r * 0.35} fill="currentColor" stroke="none" />
          </g>
        ))}
        {shape.spare && <circle cx={shape.spare[0]} cy={shape.spare[1]} r={shape.spare[2]} {...stroke} />}
      </svg>
    );
  }
  return BodyTypeIcon;
}

export const BODY_TYPE_ICONS: Record<string, ComponentType<IconProps>> = Object.fromEntries(
  Object.entries(SHAPES).map(([slug, shape]) => [slug, silhouette(shape)]),
);
