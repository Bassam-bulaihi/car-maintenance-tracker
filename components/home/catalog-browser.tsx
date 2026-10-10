"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Droplet, Gauge, Search, Wrench } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import type { CatalogModel } from "@/lib/home/catalog";
import { makeName, modelName, vehicleName } from "@/lib/i18n/vehicle-names";
import { TextInput } from "@/components/ui/text-input";

// The full preset catalog, grouped by make, with instant search and make
// chips. Every row is something a user can register after signup.
export function CatalogBrowser({ catalog, locale, t }: { catalog: CatalogModel[]; locale: Locale; t: Dictionary }) {
  const c = t.pages.catalog;
  const [query, setQuery] = useState("");
  const [make, setMake] = useState<string | null>(null);
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
  const makes = useMemo(() => [...new Set(catalog.map((m) => m.make))], [catalog]);
  const tabCase = locale === "en" ? "uppercase tracking-[1.5px]" : "";

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = catalog.filter(
      (m) =>
        (!make || m.make === make) &&
        (!q || `${m.make} ${m.model} ${vehicleName(m, "ar")}`.toLowerCase().includes(q)),
    );
    const byMake = new Map<string, CatalogModel[]>();
    for (const m of matches) byMake.set(m.make, [...(byMake.get(m.make) ?? []), m]);
    return [...byMake.entries()];
  }, [catalog, query, make]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="relative max-w-xl">
          <TextInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            aria-label={c.searchPlaceholder}
            className="ps-11"
            dir="auto"
          />
          <Search className="pointer-events-none absolute start-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={c.title}>
          {[null, ...makes].map((m) => {
            const active = make === m;
            return (
              <button
                key={m ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setMake(m)}
                className={`border px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark ${
                  active ? "border-on-dark bg-on-dark text-canvas" : "border-hairline text-body hover:border-on-dark hover:text-on-dark"
                }`}
              >
                {m ? makeName(m, locale) : c.allMakes}
              </button>
            );
          })}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="border border-hairline bg-surface-card/70 px-6 py-10 text-center text-body">{c.empty}</p>
      ) : (
        groups.map(([groupMake, models]) => (
          <section key={groupMake} className="flex flex-col gap-3" aria-labelledby={`make-${groupMake}`}>
            <h2 id={`make-${groupMake}`} className={`text-xl font-bold text-on-dark ${locale === "en" ? "uppercase tracking-[-0.01em]" : ""}`}>
              {makeName(groupMake, locale)} <span className="font-mono text-sm font-normal text-muted">({nf.format(models.length)})</span>
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {models.map((m) => (
                <li key={m.model} className="flex flex-col gap-3 border border-hairline bg-surface-card/70 p-5 backdrop-blur-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-bold text-on-dark">{modelName(m.model, locale)}</span>
                    <span className="font-mono text-xs text-muted">
                      {Math.min(...m.years)}–{Math.max(...m.years)}
                    </span>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <dt className="flex items-center gap-1 text-muted">
                        <Droplet className="h-3 w-3" aria-hidden="true" />
                        {c.oil}
                      </dt>
                      <dd className="font-mono text-on-dark">{m.oilType ?? "—"}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="flex items-center gap-1 text-muted">
                        <Gauge className="h-3 w-3" aria-hidden="true" />
                        {c.oilEvery}
                      </dt>
                      <dd className="font-mono text-on-dark">
                        {m.oilIntervalKm ? `${nf.format(m.oilIntervalKm)} ${t.common.km}` : "—"}
                      </dd>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <dt className="flex items-center gap-1 text-muted">
                        <Wrench className="h-3 w-3" aria-hidden="true" />
                        {c.services}
                      </dt>
                      <dd className="font-mono text-on-dark">{nf.format(m.serviceCount)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <div className="flex flex-col items-start gap-3 border border-hairline bg-surface-card/70 p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-on-dark">{c.notListedTitle}</span>
          <span className="text-sm text-body">{c.notListedBody}</span>
        </div>
        <Link
          href="/signup"
          className={`inline-flex h-11 shrink-0 items-center border border-on-dark px-6 text-sm font-bold text-on-dark transition-colors hover:bg-on-dark hover:text-canvas ${tabCase}`}
        >
          {c.cta}
        </Link>
      </div>
    </div>
  );
}
