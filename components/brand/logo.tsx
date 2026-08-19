import { CarAutoMark } from "@/components/brand/car-auto-mark";

// Lockup: the shield mark plus a live-text wordmark. The wordmark is text
// rather than the 26KB path-outline SVG so it stays light, selectable, and
// styleable with the project fonts.
export function Logo({
  className = "",
  markClassName = "h-7",
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <CarAutoMark className={`${markClassName} w-auto shrink-0`} />
      {showWordmark && (
        <span className="text-lg font-bold uppercase leading-none tracking-[0.06em]">
          Car Auto
        </span>
      )}
    </span>
  );
}
