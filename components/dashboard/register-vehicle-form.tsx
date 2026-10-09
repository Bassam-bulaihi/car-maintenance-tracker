"use client";

import { useActionState, useMemo, useState } from "react";
import { ArrowLeftRight, Car, Droplet, PenLine } from "lucide-react";
import { registerVehicle } from "@/lib/dashboard/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { DEFAULT_SERVICE_SCHEDULE, serviceTypesFor } from "@/lib/admin/service-types";
import { TextInput, Select, FieldLabel } from "@/components/ui/text-input";
import { Button } from "@/components/ui/button";
import { DataLabel } from "@/components/ui/data-label";

export type RegisterPreset = {
  id: string;
  make: string;
  model: string;
  year: number;
  recommended_oil: string | null;
  serviceCount: number;
};

// PRD §5.2: make → model → year loads the preset. Cars outside the catalog
// switch to a custom mode: typed make/model/year plus an editable schedule
// pre-filled with DEFAULT_SERVICE_SCHEDULE.
export function RegisterVehicleForm({
  presets,
  locale,
  t,
}: {
  presets: RegisterPreset[];
  locale: Locale;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(registerVehicle, undefined);
  const [mode, setMode] = useState<"preset" | "custom">(presets.length === 0 ? "custom" : "preset");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [presetId, setPresetId] = useState("");
  const d = t.dashboard;

  const makes = useMemo(() => [...new Set(presets.map((p) => p.make))].sort(), [presets]);
  const models = useMemo(
    () => [...new Set(presets.filter((p) => p.make === make).map((p) => p.model))].sort(),
    [presets, make],
  );
  const years = useMemo(
    () => presets.filter((p) => p.make === make && p.model === model).sort((a, b) => b.year - a.year),
    [presets, make, model],
  );
  const selected = presets.find((p) => p.id === presetId);
  const currentYear = new Date().getFullYear();

  return (
    <form action={formAction} className="flex w-full max-w-2xl flex-col gap-6">
      <input type="hidden" name="mode" value={mode} />

      {mode === "preset" ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="make">{d.makeLabel}</FieldLabel>
              <Select
                id="make"
                value={make}
                required
                onChange={(event) => {
                  setMake(event.target.value);
                  setModel("");
                  setPresetId("");
                }}
              >
                <option value="" disabled>
                  {d.chooseMake}
                </option>
                {makes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="model">{d.modelLabel}</FieldLabel>
              <Select
                id="model"
                value={model}
                required
                disabled={!make}
                onChange={(event) => {
                  setModel(event.target.value);
                  const onlyYear = presets.filter((p) => p.make === make && p.model === event.target.value);
                  setPresetId(onlyYear.length === 1 ? onlyYear[0].id : "");
                }}
              >
                <option value="" disabled>
                  {d.chooseModel}
                </option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="preset_id">{d.yearLabel}</FieldLabel>
              <Select
                id="preset_id"
                name="preset_id"
                value={presetId}
                required
                disabled={!model}
                onChange={(event) => setPresetId(event.target.value)}
                className="font-mono"
              >
                <option value="" disabled>
                  {d.chooseYear}
                </option>
                {years.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.year}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {selected && (
            <p className="flex items-center gap-2 text-sm text-body" role="status">
              <Droplet className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              {d.presetSummary
                .replace("{oil}", selected.recommended_oil ?? "—")
                .replace("{count}", new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(selected.serviceCount))}
            </p>
          )}

          <button
            type="button"
            onClick={() => setMode("custom")}
            className="inline-flex items-center gap-2 self-start text-sm text-muted underline-offset-4 hover:text-on-dark hover:underline"
          >
            <PenLine className="h-4 w-4" aria-hidden="true" />
            {d.notListed}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-body">{d.customIntro}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="custom_make">{d.makeLabel}</FieldLabel>
              <TextInput id="custom_make" name="custom_make" required maxLength={40} placeholder={d.customMakePlaceholder} dir="auto" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="custom_model">{d.modelLabel}</FieldLabel>
              <TextInput id="custom_model" name="custom_model" required maxLength={40} placeholder={d.customModelPlaceholder} dir="auto" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor="custom_year">{d.yearLabel}</FieldLabel>
              <TextInput
                id="custom_year"
                name="custom_year"
                type="number"
                inputMode="numeric"
                min={1960}
                max={currentYear + 1}
                required
                dir="ltr"
                placeholder={String(currentYear)}
                className="font-mono"
              />
            </div>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold text-on-dark">{d.scheduleTitle}</legend>
            <div className="grid gap-px border border-hairline bg-hairline">
              {serviceTypesFor(locale).map((service) => {
                const defaults = DEFAULT_SERVICE_SCHEDULE[service.value];
                return (
                  <div
                    key={service.value}
                    className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 bg-surface-card px-3 py-2"
                  >
                    <label className="flex min-w-0 items-center gap-2 text-sm text-on-dark">
                      <input
                        type="checkbox"
                        name={`track_${service.value}`}
                        defaultChecked
                        className="h-4 w-4 accent-on-dark"
                        aria-label={`${d.scheduleTrack}: ${service.label}`}
                      />
                      <span className="truncate">{service.label}</span>
                    </label>
                    <label className="flex flex-col gap-0.5">
                      <DataLabel>{d.scheduleKm}</DataLabel>
                      <TextInput
                        uiSize="sm"
                        name={`km_${service.value}`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        defaultValue={defaults.interval_km ?? ""}
                        dir="ltr"
                        className="w-24 font-mono"
                      />
                    </label>
                    <label className="flex flex-col gap-0.5">
                      <DataLabel>{d.scheduleMonths}</DataLabel>
                      <TextInput
                        uiSize="sm"
                        name={`months_${service.value}`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        defaultValue={defaults.interval_months ?? ""}
                        dir="ltr"
                        className="w-20 font-mono"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted">{d.scheduleHint}</p>
          </fieldset>

          {presets.length > 0 && (
            <button
              type="button"
              onClick={() => setMode("preset")}
              className="inline-flex items-center gap-2 self-start text-sm text-muted underline-offset-4 hover:text-on-dark hover:underline"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              {d.backToList}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="current_odometer">{d.odometerLabel}</FieldLabel>
          <TextInput
            id="current_odometer"
            name="current_odometer"
            type="number"
            inputMode="numeric"
            min={0}
            required
            dir="ltr"
            className="font-mono"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="plate_no">{d.plateLabel}</FieldLabel>
          <TextInput id="plate_no" name="plate_no" maxLength={20} dir="auto" />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-m-red" role="alert">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        locale={locale}
        icon={<Car className="h-4 w-4" />}
        className="self-start"
      >
        {pending ? d.registerSubmitting : d.registerSubmit}
      </Button>
    </form>
  );
}
