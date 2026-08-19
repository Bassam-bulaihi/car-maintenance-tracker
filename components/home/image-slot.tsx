import type { LucideIcon } from "lucide-react";
import { Car } from "lucide-react";

// Stand-in for the photography the Figma design uses. No licensed car
// photography exists for this project yet, so every image node in the
// design is represented by an explicit, labelled slot rather than being
// dropped — the element stays in the hierarchy and can be swapped for a
// real <Image> once assets land.
export function ImageSlot({
  label,
  icon: Icon = Car,
  className = "",
  iconClassName = "h-10 w-10",
}: {
  label: string;
  icon?: LucideIcon;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center justify-center border border-hairline bg-surface-soft ${className}`}
    >
      <Icon className={`${iconClassName} text-muted`} aria-hidden="true" />
    </div>
  );
}
