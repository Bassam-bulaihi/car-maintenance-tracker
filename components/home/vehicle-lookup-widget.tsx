"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, Gauge, Droplet, CalendarClock } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { BRANDS, LOOKUP_YEARS, SHOWCASE_PRESETS } from "@/lib/home/content";
import { TextInput, Select } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { DataLabel } from "@/components/ui/data-label";
import { BracketLabel } from "@/components/ui/bracket-label";

// Structural analog of the Figma booking widget (Group 126): a bordered
// card overlapping the hero band, holding four inputs plus a primary
// action. Semantics adapted from "rent a car" to "preview this car's
// maintenance schedule".
export function VehicleLookupWidget({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [odometer, setOdometer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const modelsForMake = useMemo(
    () => SHOWCASE_PRESETS.filter((p) => p.make === make),
    [make],
  );

  const matched = useMemo(
    () => SHOWCASE_PRESETS.find((p) => p.make === make && p.model === model),
    [make, model],
  );

  // Estimated next-service mileage, rounded up to the next interval
  // boundary from the entered odometer. Deliberately an estimate — exact
  // tracking needs a registered vehicle with real baselines.
  const estimate = useMemo(() => {
    if (!matched) return null;
    const odo = Number(odometer);
    const base = Number.isFinite(odo) && odo > 0 ? odo : 0;
    const nextOil = Math.ceil((base + 1) / matched.oilIntervalKm) * matched.oilIntervalKm;
    return {
      nextOil,
      remaining: nextOil - base,
      oilType: matched.oilType,
      months: matched.intervalMonths,
    };
  }, [matched, odometer]);

  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
  const showResult = submitted && !!matched;

  return (
    <section aria-labelledby="lookup-heading" className="relative z-10 px-6">
      <div className="mx-auto -mt-12 max-w-[1216px] border border-hairline bg-surface-card/70 backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-hairline px-6 py-4">
          <Search className="h-4 w-4 text-muted" aria-hidden="true" />
          <BracketLabel>{t.home.lookup.eyebrow}</BracketLabel>
          <h2 id="lookup-heading" className="sr-only">
            {t.home.lookup.submit}
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="grid grid-cols-1 gap-px bg-hairline/60 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
        >
          <div className="flex flex-col gap-1.5 bg-surface-card/70 backdrop-blur-sm p-5">
            <DataLabel htmlFor="lookup-make">{t.home.lookup.make}</DataLabel>
            <Select
              uiSize="sm"
              id="lookup-make"
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setModel("");
                setSubmitted(false);
              }}
            >
              <option value="">{t.home.lookup.makePlaceholder}</option>
              {BRANDS.map((b) => (
                <option key={b.slug} value={b.name}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 bg-surface-card/70 backdrop-blur-sm p-5">
            <DataLabel htmlFor="lookup-model">{t.home.lookup.model}</DataLabel>
            <Select
              uiSize="sm"
              id="lookup-model"
              value={model}
              disabled={!make}
              onChange={(e) => {
                setModel(e.target.value);
                setSubmitted(false);
              }}
            >
              <option value="">{t.home.lookup.modelPlaceholder}</option>
              {modelsForMake.map((p) => (
                <option key={p.slug} value={p.model}>
                  {p.model}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 bg-surface-card/70 backdrop-blur-sm p-5">
            <DataLabel htmlFor="lookup-year">{t.home.lookup.year}</DataLabel>
            <Select
              uiSize="sm"
              id="lookup-year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="font-mono"
            >
              <option value="">{t.home.lookup.yearPlaceholder}</option>
              {LOOKUP_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 bg-surface-card/70 backdrop-blur-sm p-5">
            <DataLabel htmlFor="lookup-odometer">{t.home.lookup.odometer}</DataLabel>
            <TextInput
              uiSize="sm"
              id="lookup-odometer"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={t.home.lookup.odometerPlaceholder}
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              dir="ltr"
              className="font-mono"
            />
          </div>

          <div className="flex items-end bg-surface-card/70 backdrop-blur-sm p-5">
            <Button
              type="submit"
              locale={locale}
              className="w-full lg:w-auto"
              icon={<ArrowRight className="h-4 w-4 rtl:scale-x-[-1]" />}
            >
              {t.home.lookup.submit}
            </Button>
          </div>
        </form>

        <div className="border-t border-hairline px-6 py-5">
          {showResult && estimate ? (
            <div className="flex flex-col gap-4">
              <span className="font-mono text-xs text-muted ltr:uppercase ltr:tracking-[0.08em]">
                {t.home.lookup.resultTitle}
              </span>
              <dl className="grid grid-cols-1 gap-px bg-hairline/60 sm:grid-cols-3">
                <div className="flex items-center gap-3 bg-surface-card/70 backdrop-blur-sm p-4">
                  <Gauge className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                  <div className="flex flex-col">
                    <dt className="font-mono text-[11px] text-muted ltr:uppercase">
                      {t.home.collection.specs.oilInterval}
                    </dt>
                    <dd className="font-mono text-lg font-bold text-on-dark">
                      {nf.format(estimate.nextOil)} {t.common.km}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-surface-card/70 backdrop-blur-sm p-4">
                  <Droplet className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                  <div className="flex flex-col">
                    <dt className="font-mono text-[11px] text-muted ltr:uppercase">
                      {t.home.collection.specs.oilType}
                    </dt>
                    <dd className="font-mono text-lg font-bold text-on-dark">{estimate.oilType}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-surface-card/70 backdrop-blur-sm p-4">
                  <CalendarClock className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
                  <div className="flex flex-col">
                    <dt className="font-mono text-[11px] text-muted ltr:uppercase">
                      {t.home.collection.specs.timeInterval}
                    </dt>
                    <dd className="font-mono text-lg font-bold text-on-dark">
                      {nf.format(estimate.months)} {t.common.months}
                    </dd>
                  </div>
                </div>
              </dl>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted">{t.home.lookup.note}</p>
                <Link href="/signup">
                  <Button size="sm" locale={locale}>
                    {t.home.lookup.resultCta}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">{t.home.lookup.resultEmpty}</p>
          )}
        </div>
      </div>
    </section>
  );
}
