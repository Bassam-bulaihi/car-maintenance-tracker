"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Admin dashboard charts — inline SVG, no chart library. Specs follow the
// dataviz method: thin marks (columns ≤ 24px, 4px rounded data-end, square at
// the baseline), 2px lines with a ~10% area wash, hairline solid gridlines,
// 2px surface gaps between stacked segments, a crosshair/tooltip hover layer
// that also works on keyboard focus, and a table view for every chart.
//
// Colour: one validated accent (M Blue Dark, passes the dark-surface checks)
// for single series; when one series is the story, emphasis form — accent for
// it, muted grey for the context series. Text always uses text tokens.

export const ACCENT = "var(--color-m-blue-dark)";
export const CONTEXT = "var(--color-muted)";

export type ChartPoint = { day: string; values: number[] };
export type ChartSeries = { name: string; color: string };

const HEIGHT = 200;
const PAD = { top: 12, right: 12, bottom: 24, left: 36 };

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Clean y ticks (0, nice step, …) covering `max`. */
function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

function useFormatters(locale: "ar" | "en") {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
  const df = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  return {
    num: (n: number) => nf.format(n),
    day: (d: string) => df.format(new Date(`${d}T00:00:00Z`)),
  };
}

/** Card shell: title, optional legend, the chart, and a table view. */
export function ChartCard({
  title,
  subtitle,
  legend,
  table,
  tableLabel,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  legend?: ChartSeries[];
  table: { head: string[]; rows: (string | number)[][] };
  tableLabel: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col gap-4 border border-hairline bg-surface-card p-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-on-dark">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {legend && legend.length > 1 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-body">
            {legend.map((s) => (
              <li key={s.name} className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5" style={{ background: s.color }} aria-hidden="true" />
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {children}
      <details className="text-xs">
        <summary className="cursor-pointer text-muted hover:text-on-dark">{tableLabel}</summary>
        <div className="mt-2 max-h-64 overflow-auto">
          <table className="w-full border-collapse font-mono">
            <thead>
              <tr>
                {table.head.map((h) => (
                  <th key={h} className="border-b border-hairline px-2 py-1 text-start font-normal text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border-b border-hairline/50 px-2 py-1 text-body">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

function Tooltip({ x, width, title, rows }: { x: number; width: number; title: string; rows: { label: string; value: string; color: string }[] }) {
  const flip = x > width - 150;
  return (
    <div
      className="pointer-events-none absolute top-2 z-10 min-w-32 border border-hairline bg-canvas px-3 py-2 text-xs shadow-none"
      style={flip ? { right: width - x + 8 } : { left: x + 8 }}
      role="status"
    >
      <div className="mb-1 text-muted">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-3" style={{ background: r.color }} aria-hidden="true" />
          <span className="font-mono font-bold text-on-dark">{r.value}</span>
          <span className="text-body">{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function Axes({ width, ticks, y, num }: { width: number; ticks: number[]; y: (v: number) => number; num: (n: number) => string }) {
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-hairline)" strokeWidth={1} />
          <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={10} fill="var(--color-muted)">
            {num(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Column chart, one or two series (stacked, 2px surface gap between segments). */
export function ColumnChart({
  points,
  series,
  locale,
  ariaLabel,
}: {
  points: ChartPoint[];
  series: ChartSeries[];
  locale: "ar" | "en";
  ariaLabel: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const { num, day } = useFormatters(locale);

  const totals = points.map((p) => p.values.reduce((a, b) => a + b, 0));
  const ticks = niceTicks(Math.max(...totals, 1));
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = points.length ? plotW / points.length : 0;
  const barW = Math.max(2, Math.min(24, band * 0.6));
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const labelEvery = Math.ceil(points.length / 6);

  return (
    <div ref={ref} className="relative" dir="ltr">
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={ariaLabel}>
          <Axes width={width} ticks={ticks} y={y} num={num} />
          {points.map((p, i) => {
            const cx = PAD.left + band * i + band / 2;
            const x0 = cx - barW / 2;
            const lastNonZero = p.values.reduce((last, v, s) => (v > 0 ? s : last), -1);
            let cumulative = 0;
            return (
              <g key={p.day}>
                {p.values.map((v, s) => {
                  if (v <= 0) return null;
                  const hasBelow = cumulative > 0;
                  // 2px surface gap between this segment and the one below.
                  const bottom = y(cumulative) - (hasBelow ? 2 : 0);
                  cumulative += v;
                  const yTop = y(cumulative);
                  const h = Math.max(1, bottom - yTop);
                  const r = s === lastNonZero ? Math.min(4, h, barW / 2) : 0;
                  const d = `M${x0},${bottom} V${yTop + r} Q${x0},${yTop} ${x0 + r},${yTop} H${x0 + barW - r} Q${x0 + barW},${yTop} ${x0 + barW},${yTop + r} V${bottom} Z`;
                  return (
                    <path key={s} d={d} fill={series[s].color} opacity={active === null || active === i ? 1 : 0.55} />
                  );
                })}
                {i % labelEvery === 0 && (
                  <text x={cx} y={HEIGHT - 6} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
                    {day(p.day)}
                  </text>
                )}
                <rect
                  x={PAD.left + band * i}
                  y={PAD.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${day(p.day)}: ${p.values.map((v, s) => `${series[s].name} ${num(v)}`).join(", ")}`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="outline-none"
                />
              </g>
            );
          })}
        </svg>
      )}
      {active !== null && width > 0 && (
        <Tooltip
          x={PAD.left + band * active + band / 2}
          width={width}
          title={day(points[active].day)}
          rows={points[active].values.map((v, s) => ({ label: series[s].name, value: num(v), color: series[s].color }))}
        />
      )}
    </div>
  );
}

/** Single-series line with a 10% area wash, crosshair hover, end value label. */
export function AreaChart({
  points,
  series,
  locale,
  ariaLabel,
}: {
  points: ChartPoint[];
  series: ChartSeries;
  locale: "ar" | "en";
  ariaLabel: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const { num, day } = useFormatters(locale);

  const values = points.map((p) => p.values[0]);
  const ticks = niceTicks(Math.max(...values, 1));
  const top = ticks[ticks.length - 1];
  const plotW = Math.max(0, width - PAD.left - PAD.right - 24);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length > 1 ? (i / (points.length - 1)) * plotW : 0);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const area = `${line} L${x(values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const last = values.length - 1;
  const labelEvery = Math.ceil(points.length / 6);

  const nearest = (clientX: number, rect: DOMRect) => {
    const rel = clientX - rect.left - PAD.left;
    return Math.max(0, Math.min(last, Math.round((rel / plotW) * last)));
  };

  return (
    <div ref={ref} className="relative" dir="ltr">
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          className="outline-none focus-visible:outline-1 focus-visible:outline-hairline"
          onPointerMove={(e) => setActive(nearest(e.clientX, e.currentTarget.getBoundingClientRect()))}
          onPointerLeave={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") setActive((a) => Math.min(last, (a ?? -1) + 1));
            if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? last + 1) - 1));
          }}
          onBlur={() => setActive(null)}
        >
          <Axes width={width - 24} ticks={ticks} y={y} num={num} />
          <path d={area} fill={series.color} opacity={0.1} />
          <path d={line} fill="none" stroke={series.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) =>
            i % labelEvery === 0 ? (
              <text key={p.day} x={x(i)} y={HEIGHT - 6} textAnchor="middle" fontSize={10} fill="var(--color-muted)">
                {day(p.day)}
              </text>
            ) : null,
          )}
          <circle cx={x(last)} cy={y(values[last])} r={4} fill={series.color} stroke="var(--color-surface-card)" strokeWidth={2} />
          <text x={x(last) + 8} y={y(values[last])} dy="0.32em" fontSize={11} fill="var(--color-body-strong)">
            {num(values[last])}
          </text>
          {active !== null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={y(0)} stroke="var(--color-body)" strokeWidth={1} />
              <circle cx={x(active)} cy={y(values[active])} r={4} fill={series.color} stroke="var(--color-surface-card)" strokeWidth={2} />
            </g>
          )}
        </svg>
      )}
      {active !== null && width > 0 && (
        <Tooltip
          x={x(active)}
          width={width}
          title={day(points[active].day)}
          rows={[{ label: series.name, value: num(values[active]), color: series.color }]}
        />
      )}
    </div>
  );
}

/** Ranked horizontal bars (magnitude, one hue). Follows document direction. */
export function BarList({
  rows,
  locale,
  emptyLabel,
}: {
  rows: { label: string; value: number }[];
  locale: "ar" | "en";
  emptyLabel: string;
}) {
  const { num } = useFormatters(locale);
  const max = Math.max(...rows.map((r) => r.value), 1);
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-muted">{emptyLabel}</p>;
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.label} className="grid grid-cols-[minmax(5rem,9rem)_minmax(0,1fr)_auto] items-center gap-3 text-sm">
          <span className="truncate text-body" title={row.label}>
            {row.label}
          </span>
          <span className="h-3 bg-hairline/40" aria-hidden="true">
            <span
              className="block h-full rounded-e-[4px]"
              style={{ width: `${Math.max(2, (row.value / max) * 100)}%`, background: ACCENT }}
            />
          </span>
          <span className="font-mono text-on-dark">{num(row.value)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Ratio against a whole: accent fill on a lighter step of the same family. */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-2 w-full bg-m-blue-dark/25"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
    >
      <div className="h-full rounded-e-[4px] bg-m-blue-dark" style={{ width: `${pct}%` }} />
    </div>
  );
}
