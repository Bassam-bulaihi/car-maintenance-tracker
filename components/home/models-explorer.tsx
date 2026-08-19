"use client";

import { useMemo, useRef, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { SHOWCASE_PRESETS, type PresetCategory } from "@/lib/home/content";
import { BrowseByBrand } from "@/components/home/browse-by-brand";
import { BrowseByBodyType } from "@/components/home/browse-by-body-type";
import { PresetCollection } from "@/components/home/preset-collection";

export type ModelFilter =
  | { kind: "none" }
  | { kind: "make"; value: string }
  | { kind: "body"; value: PresetCategory | string };

// Owns the filter shared by the brand grid, the body-type grid, and the
// model collection. Previously all 24 of those cards linked straight to
// /signup, which made them decorative — now selecting one filters the
// collection below and scrolls to it, so every card does something.
export function ModelsExplorer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [filter, setFilter] = useState<ModelFilter>({ kind: "none" });
  const collectionRef = useRef<HTMLDivElement>(null);

  // Which makes / body types we actually ship a schedule for. Cards outside
  // these sets are flagged "soon" rather than silently leading to an empty
  // result with no explanation.
  const availableMakes = useMemo(
    () => new Set(SHOWCASE_PRESETS.map((p) => p.make)),
    [],
  );
  const availableBodies = useMemo(
    () => new Set(SHOWCASE_PRESETS.map((p) => p.category as string)),
    [],
  );

  const select = (next: ModelFilter) => {
    setFilter(next);
    // Let React commit the filtered list before scrolling to it.
    requestAnimationFrame(() => {
      collectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <>
      <BrowseByBrand
        locale={locale}
        t={t}
        availableMakes={availableMakes}
        activeMake={filter.kind === "make" ? filter.value : null}
        onSelect={(make) => select({ kind: "make", value: make })}
        onClear={() => setFilter({ kind: "none" })}
      />
      <BrowseByBodyType
        locale={locale}
        t={t}
        availableBodies={availableBodies}
        activeBody={filter.kind === "body" ? filter.value : null}
        onSelect={(body) => select({ kind: "body", value: body })}
        onClear={() => setFilter({ kind: "none" })}
      />
      <PresetCollection
        ref={collectionRef}
        locale={locale}
        t={t}
        filter={filter}
        onClearFilter={() => setFilter({ kind: "none" })}
      />
    </>
  );
}
