import { useMemo, useState } from "react";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
  SelectInput,
} from "../components/FormFields";
import { UnitWeightInput } from "../components/UnitInputs";
import {
  bolusToAverageRateMlPerHr,
  calculateGir,
  getFormulaChoGPer100Ml,
  GIR_CHI_THRESHOLD_MG_KG_MIN,
  GIR_NORMAL_MAX_MG_KG_MIN,
  GIR_NORMAL_MIN_MG_KG_MIN,
  scaleChoForCaloricDensity,
} from "@core/calculators/gir/calculateGir";
import {
  GIR_DEXTROSE_PRESETS,
  girFormulas,
  GIR_KCAL_PER_OZ_OPTIONS,
} from "../data/gir/formulaPresets";

type FeedDeliveryMode = "continuous" | "bolus";
type FormulaMode = "preset" | "custom";

export default function GirPage() {
  const [weightKg, setWeightKg] = useState("");
  const [includeIv, setIncludeIv] = useState(true);
  const [dextrosePreset, setDextrosePreset] = useState("10");
  const [dextroseCustomPercent, setDextroseCustomPercent] = useState("");
  const [ivRateMlPerHr, setIvRateMlPerHr] = useState("");

  const [includeEnteral, setIncludeEnteral] = useState(true);
  const [formulaMode, setFormulaMode] = useState<FormulaMode>("preset");
  const [formulaPresetId, setFormulaPresetId] = useState(girFormulas[0]?.id ?? "");
  const [customChoGPer100Ml, setCustomChoGPer100Ml] = useState("");
  const [kcalPerOzPreset, setKcalPerOzPreset] = useState("20");
  const [kcalPerOzCustom, setKcalPerOzCustom] = useState("");
  const [feedDelivery, setFeedDelivery] = useState<FeedDeliveryMode>("continuous");
  const [continuousRateMlPerHr, setContinuousRateMlPerHr] = useState("");
  const [bolusVolumeMl, setBolusVolumeMl] = useState("");
  const [bolusIntervalHours, setBolusIntervalHours] = useState("3");

  const effectiveKcalPerOz = useMemo(() => {
    if (kcalPerOzPreset === "custom") {
      const custom = parseFloat(kcalPerOzCustom);
      return Number.isNaN(custom) ? null : custom;
    }
    return parseFloat(kcalPerOzPreset);
  }, [kcalPerOzPreset, kcalPerOzCustom]);

  const result = useMemo(() => {
    const weight = parseFloat(weightKg);
    if (Number.isNaN(weight)) return null;

    let ivDextrosePercent: number | undefined;
    let ivRate: number | undefined;
    if (includeIv) {
      if (dextrosePreset === "custom") {
        ivDextrosePercent = parseFloat(dextroseCustomPercent);
      } else {
        ivDextrosePercent = parseFloat(dextrosePreset);
      }
      ivRate = parseFloat(ivRateMlPerHr);
      if (
        Number.isNaN(ivDextrosePercent) ||
        Number.isNaN(ivRate) ||
        ivDextrosePercent <= 0 ||
        ivRate <= 0
      ) {
        ivDextrosePercent = undefined;
        ivRate = undefined;
      }
    }

    let enteralCho: number | undefined;
    let enteralRate: number | undefined;
    if (includeEnteral) {
      if (effectiveKcalPerOz === null || effectiveKcalPerOz <= 0) return null;

      if (formulaMode === "preset") {
        const preset = girFormulas.find((p) => p.id === formulaPresetId);
        if (!preset) return null;
        enteralCho = getFormulaChoGPer100Ml(preset, effectiveKcalPerOz);
      } else {
        const choAt20 = parseFloat(customChoGPer100Ml);
        if (Number.isNaN(choAt20) || choAt20 <= 0) return null;
        enteralCho = scaleChoForCaloricDensity(choAt20, effectiveKcalPerOz);
      }

      if (feedDelivery === "continuous") {
        enteralRate = parseFloat(continuousRateMlPerHr);
      } else {
        const volume = parseFloat(bolusVolumeMl);
        const interval = parseFloat(bolusIntervalHours);
        if (Number.isNaN(volume) || Number.isNaN(interval)) return null;
        try {
          enteralRate = bolusToAverageRateMlPerHr(volume, interval);
        } catch {
          return null;
        }
      }

      if (!enteralRate || enteralRate <= 0) {
        enteralCho = undefined;
        enteralRate = undefined;
      }
    }

    try {
      return calculateGir({
        weightKg: weight,
        ivDextrosePercent: ivDextrosePercent,
        ivRateMlPerHr: ivRate,
        enteralChoGPer100Ml: enteralCho,
        enteralRateMlPerHr: enteralRate,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [
    weightKg,
    includeIv,
    dextrosePreset,
    dextroseCustomPercent,
    ivRateMlPerHr,
    includeEnteral,
    formulaMode,
    formulaPresetId,
    customChoGPer100Ml,
    effectiveKcalPerOz,
    feedDelivery,
    continuousRateMlPerHr,
    bolusVolumeMl,
    bolusIntervalHours,
  ]);

  const enteralChoDisplay = useMemo(() => {
    if (!includeEnteral || effectiveKcalPerOz === null || effectiveKcalPerOz <= 0) {
      return null;
    }
    if (formulaMode === "preset") {
      const preset = girFormulas.find((p) => p.id === formulaPresetId);
      if (!preset) return null;
      return getFormulaChoGPer100Ml(preset, effectiveKcalPerOz);
    }
    const choAt20 = parseFloat(customChoGPer100Ml);
    if (Number.isNaN(choAt20)) return null;
    return scaleChoForCaloricDensity(choAt20, effectiveKcalPerOz);
  }, [
    includeEnteral,
    formulaMode,
    formulaPresetId,
    customChoGPer100Ml,
    effectiveKcalPerOz,
  ]);

  const enteralRateDisplay = useMemo(() => {
    if (!includeEnteral) return null;
    if (feedDelivery === "continuous") {
      const rate = parseFloat(continuousRateMlPerHr);
      return Number.isNaN(rate) ? null : rate;
    }
    const volume = parseFloat(bolusVolumeMl);
    const interval = parseFloat(bolusIntervalHours);
    if (Number.isNaN(volume) || Number.isNaN(interval) || interval <= 0) {
      return null;
    }
    return volume / interval;
  }, [
    includeEnteral,
    feedDelivery,
    continuousRateMlPerHr,
    bolusVolumeMl,
    bolusIntervalHours,
  ]);

  return (
    <CalculatorShell
      title="Glucose Infusion Rate (GIR)"
      description="Calculate combined IV and enteral glucose infusion rate with neonatal hypoglycemia context."
    >
      <p className="rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-sm text-teal-800">
        Normal neonatal GIR is typically{" "}
        <strong>
          {GIR_NORMAL_MIN_MG_KG_MIN}–{GIR_NORMAL_MAX_MG_KG_MIN} mg/kg/min
        </strong>
        . Consider{" "}
        <strong>congenital hyperinsulinism</strong> when GIR is required above{" "}
        <strong>{GIR_CHI_THRESHOLD_MG_KG_MIN} mg/kg/min</strong> to maintain
        euglycemia.
      </p>

      <UnitWeightInput
        label="Patient weight"
        valueKg={weightKg}
        onChangeKg={setWeightKg}
      />

      <fieldset className="space-y-4 rounded-xl border border-teal-100 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-teal-900">
          IV dextrose
        </legend>
        <label className="flex items-center gap-2 text-sm text-teal-900">
          <input
            type="checkbox"
            checked={includeIv}
            onChange={(e) => setIncludeIv(e.target.checked)}
            className="rounded border-teal-300 text-teal-700 focus:ring-teal-500"
          />
          Include IV fluids
        </label>
        {includeIv && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dextrose solution">
              <SelectInput
                value={dextrosePreset}
                onChange={setDextrosePreset}
                options={GIR_DEXTROSE_PRESETS.map((p) => ({
                  value: p.value,
                  label: p.label,
                }))}
              />
            </Field>
            {dextrosePreset === "custom" && (
              <Field label="Dextrose concentration (%)" hint="e.g. 10 for D10W">
                <NumberInput
                  value={dextroseCustomPercent}
                  onChange={setDextroseCustomPercent}
                  min={0}
                  placeholder="10"
                />
              </Field>
            )}
            <Field label="IV rate (mL/hr)">
              <NumberInput
                value={ivRateMlPerHr}
                onChange={setIvRateMlPerHr}
                min={0}
                placeholder="e.g. 6"
              />
            </Field>
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border border-teal-100 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-teal-900">
          Enteral feeds
        </legend>
        <label className="flex items-center gap-2 text-sm text-teal-900">
          <input
            type="checkbox"
            checked={includeEnteral}
            onChange={(e) => setIncludeEnteral(e.target.checked)}
            className="rounded border-teal-300 text-teal-700 focus:ring-teal-500"
          />
          Include enteral feeds
        </label>
        {includeEnteral && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Formula source">
                <SelectInput
                  value={formulaMode}
                  onChange={(v) => setFormulaMode(v as FormulaMode)}
                  options={[
                    { value: "preset", label: "Common infant formula" },
                    { value: "custom", label: "Custom CHO content" },
                  ]}
                />
              </Field>
              <Field
                label="Caloric density (kcal/oz)"
                hint="CHO scales proportionally when concentrating above 20 kcal/oz"
              >
                <SelectInput
                  value={kcalPerOzPreset}
                  onChange={setKcalPerOzPreset}
                  options={[
                    ...GIR_KCAL_PER_OZ_OPTIONS.map((k) => ({
                      value: String(k),
                      label: `${k} kcal/oz`,
                    })),
                    { value: "custom", label: "Custom kcal/oz" },
                  ]}
                />
              </Field>
            </div>

            {kcalPerOzPreset === "custom" && (
              <Field label="Custom caloric density (kcal/oz)">
                <NumberInput
                  value={kcalPerOzCustom}
                  onChange={setKcalPerOzCustom}
                  min={0}
                  placeholder="e.g. 24"
                />
              </Field>
            )}

            {formulaMode === "preset" ? (
              <Field label="Infant formula">
                <SelectInput
                  value={formulaPresetId}
                  onChange={setFormulaPresetId}
                  options={girFormulas.map((p) => ({
                    value: p.id,
                    label: p.label,
                  }))}
                />
              </Field>
            ) : (
              <Field
                label="CHO at 20 kcal/oz (g/100 mL)"
                hint="Scaled automatically for selected caloric density"
              >
                <NumberInput
                  value={customChoGPer100Ml}
                  onChange={setCustomChoGPer100Ml}
                  min={0}
                  placeholder="e.g. 7.2"
                />
              </Field>
            )}

            {enteralChoDisplay !== null && effectiveKcalPerOz !== null && (
              <p className="text-xs text-teal-700">
                Effective CHO at {effectiveKcalPerOz} kcal/oz:{" "}
                <strong>{enteralChoDisplay.toFixed(2)} g/100 mL</strong>
              </p>
            )}

            <Field label="Feed delivery">
              <SelectInput
                value={feedDelivery}
                onChange={(v) => setFeedDelivery(v as FeedDeliveryMode)}
                options={[
                  { value: "continuous", label: "Continuous (mL/hr)" },
                  { value: "bolus", label: "Bolus (volume + interval)" },
                ]}
              />
            </Field>

            {feedDelivery === "continuous" ? (
              <Field label="Feed rate (mL/hr)">
                <NumberInput
                  value={continuousRateMlPerHr}
                  onChange={setContinuousRateMlPerHr}
                  min={0}
                  placeholder="e.g. 15"
                />
              </Field>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Bolus volume (mL)">
                  <NumberInput
                    value={bolusVolumeMl}
                    onChange={setBolusVolumeMl}
                    min={0}
                    placeholder="e.g. 30"
                  />
                </Field>
                <Field label="Feeding interval (hours)">
                  <NumberInput
                    value={bolusIntervalHours}
                    onChange={setBolusIntervalHours}
                    min={0}
                    placeholder="e.g. 3"
                  />
                </Field>
              </div>
            )}

            {feedDelivery === "bolus" && enteralRateDisplay !== null && (
              <p className="text-xs text-teal-700">
                Average rate equivalent:{" "}
                <strong>{enteralRateDisplay.toFixed(1)} mL/hr</strong> (bolus
                delivery is pulsatile; glycemic variability may differ from
                continuous feeds).
              </p>
            )}
          </div>
        )}
      </fieldset>

      {result && "error" in result ? (
        <ResultCard title="GIR" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Total GIR"
            value={`${result.value.totalGirMgKgMin.toFixed(1)} mg/kg/min`}
            interpretation={result.interpretation}
            warning={result.warning}
          />
          {(result.value.ivGirMgKgMin > 0 ||
            result.value.enteralGirMgKgMin > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {result.value.ivGirMgKgMin > 0 && (
                <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                    IV GIR
                  </p>
                  <p className="mt-1 text-xl font-bold text-teal-900">
                    {result.value.ivGirMgKgMin.toFixed(1)} mg/kg/min
                  </p>
                </div>
              )}
              {result.value.enteralGirMgKgMin > 0 && (
                <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                    Enteral GIR
                  </p>
                  <p className="mt-1 text-xl font-bold text-teal-900">
                    {result.value.enteralGirMgKgMin.toFixed(1)} mg/kg/min
                  </p>
                </div>
              )}
            </div>
          )}
          <CalculatorReferenceFooter>
            Total GIR = IV GIR + enteral GIR. IV GIR (mg/kg/min) = [% dextrose × mL/hr ×
            10] ÷ [60 × kg]. Enteral GIR (mg/kg/min) = [CHO g/100 mL × mL/hr × 10] ÷ [60 ×
            kg].
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}
