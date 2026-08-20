import type { SVGProps } from "react";

// Lucide's stock set has no per-body-type car silhouettes (sedan, coupe,
// wagon, etc. all collapse to the same "car" glyph), so the body-type grid
// looked like the same 3-4 icons repeated. These are small hand-drawn
// silhouettes, one per BODY_TYPES slug, kept in the same 24x24 / stroke-1.5
// / round-cap language as Lucide so they sit naturally next to it.
// Relaxed by docs/DESIGN.md rule 3 — non-Lucide icons are allowed where
// Lucide doesn't cover the shape.

type IconProps = SVGProps<SVGSVGElement>;

function Wheels({
  positions,
  radius,
  strokeWidth,
}: {
  positions: [number, number][];
  radius: number;
  strokeWidth: number;
}) {
  return (
    <>
      {positions.map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={radius} stroke="currentColor" strokeWidth={strokeWidth} />
          <circle cx={cx} cy={cy} r={0.55} fill="currentColor" stroke="none" />
        </g>
      ))}
    </>
  );
}

function SedanIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,17 L2,14.3 Q2,14 2.4,14 L5.5,14 L7.6,9.4 Q8,9 8.6,9 L13.5,9 Q14.1,9 14.4,9.5 L15.6,12 L18.5,12 L19.6,14 L21,14 Q22,14 22,15 L22,17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Wheels positions={[[7, 18.4], [18, 18.4]]} radius={2} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function HatchbackIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,17 L2,14.3 Q2,14 2.4,14 L5.5,14 L7.6,9.4 Q8,9 8.6,9 L12.5,9 Q13.1,9 13.4,9.6 L16,14 Q17.2,14 17.2,15.4 L17.2,17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Wheels positions={[[7, 18.4], [14.8, 18.4]]} radius={2} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function WagonIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,17 L2,14.3 Q2,14 2.4,14 L5.5,14 L7.6,9.4 Q8,9 8.6,9 L17,9 Q17.8,9 17.8,9.8 L17.8,14 L21,14 Q22,14 22,15.5 L22,17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Wheels positions={[[7, 18.4], [18.5, 18.4]]} radius={2} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function CoupeIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,16.7 L2,15.2 Q2,14.7 2.6,14.7 L8,14.7 L11,10 Q11.4,9.5 12.2,9.6 L14.5,10.1 Q15.5,10.4 16,11.3 L19.5,14.7 L21,14.7 Q22,14.7 22,15.6 L22,16.7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Wheels positions={[[8, 17.9], [19, 17.9]]} radius={1.9} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function CrossoverIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,16.8 L2,13.6 Q2,13 2.8,13 L4.8,10.2 Q5.3,9.3 6.6,9.3 L13.5,9.3 Q14.3,9.3 14.8,10 L17,13 Q17.5,13.6 18.4,13.6 L20.6,13.6 Q21.6,13.6 21.6,14.6 L21.6,16.8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Wheels positions={[[7, 18.4], [18, 18.4]]} radius={2} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function SuvIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,16.2 L2,12.6 Q2,11.8 2.8,11.8 L4.2,9.2 Q4.7,8.3 5.8,8.3 L16.8,8.3 Q17.9,8.3 18.4,9.2 L19.8,11.8 L20.6,11.8 Q21.6,11.8 21.6,12.6 L21.6,16.2"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5,7.5 L6.5,8.3 M6.5,7.5 L15,7.5 M15,7.5 L15,8.3"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Wheels positions={[[6.5, 18.3], [18, 18.3]]} radius={2.2} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function PickupIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,17 L2,14 L5,14 L7,9.3 Q7.4,8.8 8.4,8.8 L10.6,8.8 Q11.3,8.8 11.6,9.5 L12.4,14 L21,14 Q22,14 22,15 L22,17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.4,12 L20,12 L20,14"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Wheels positions={[[7, 18.4], [19, 18.4]]} radius={2} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function MinivanIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,16.8 L2,12.4 Q2,10 4.3,9.6 Q4.9,8.6 6.4,8.6 L16.2,8.6 Q18,8.6 18.6,10 L20,12.8 L20.8,12.8 Q21.6,12.8 21.6,14 L21.6,16.8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13,8.9 L13,14.3" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
      <Wheels positions={[[6.8, 18.9], [18.5, 18.9]]} radius={2.1} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function VanIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,17 L2,10.4 Q2,8.8 3.8,8.8 L19.8,8.8 Q21.6,8.8 21.6,10.4 L21.6,17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5,9.6 L9.7,9.6 L9.7,12 L5.5,12 Z"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Wheels positions={[[6.5, 18.7], [18, 18.7]]} radius={1.9} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function ConvertibleIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,17 L2,14.3 Q2,14 2.4,14 L6,14 L7.4,11.2 L8.6,14 L20,14 Q21,14 21,15.2 L21,17"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Wheels positions={[[7, 18.4], [17.5, 18.4]]} radius={2} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function SportsIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,16.5 L2,15.3 Q2,14.8 2.8,14.8 L7.5,14.8 L10.5,10.6 Q11,10.1 11.8,10.3 L14.3,11.3 Q15.3,11.7 15.9,12.6 L18.5,14.8 L20.6,14.8 Q21.6,14.8 21.6,15.7 L21.6,16.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.6,10.8 L20.6,10.8 M19.1,10.8 L19.4,13.3"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <Wheels positions={[[7.5, 17.9], [19, 17.9]]} radius={1.8} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

function OffroadIcon({ strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2,16 L2,12.2 Q2,11.4 2.8,11.4 L4.2,8.8 Q4.7,7.9 5.8,7.9 L16.8,7.9 Q17.9,7.9 18.4,8.8 L19.8,11.4 L20.6,11.4 Q21.6,11.4 21.6,12.2 L21.6,16"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7,7.1 L7,7.9 M7,7.1 L15,7.1 M15,7.1 L15,7.9"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Wheels positions={[[6.5, 18.6], [18, 18.6]]} radius={2.5} strokeWidth={Number(strokeWidth)} />
    </svg>
  );
}

// Keyed by BODY_TYPES[].slug (lib/home/content.ts) so each card renders its
// own matching silhouette instead of a handful of icons on rotation.
export const BODY_TYPE_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  sedan: SedanIcon,
  suv: SuvIcon,
  hatchback: HatchbackIcon,
  pickup: PickupIcon,
  crossover: CrossoverIcon,
  coupe: CoupeIcon,
  minivan: MinivanIcon,
  wagon: WagonIcon,
  convertible: ConvertibleIcon,
  sports: SportsIcon,
  van: VanIcon,
  offroad: OffroadIcon,
};
