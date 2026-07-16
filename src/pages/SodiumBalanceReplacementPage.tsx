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
import { calculateFreeWaterDeficit } from "@core/calculators/freeWaterDeficit";
import {
  calculateHyperglycemiaCorrectedSodium,
} from "@core/calculators/sodium/calculateHyperglycemiaCorrectedSodium";
import {
  calculateSodiumCorrectionGuidance,
  formatFluidRateMlPerHr,
  formatSodiumRate,
  type SodiumCorrectionGoal,
} from "@core/calculators/sodium/calculateSodiumCorrectionGuidance";
import {
  SODIUM_CORRECTION_RATE_PRESETS,
  SODIUM_FLUID_OPTIONS,
  type SodiumAgeCategory,
  type SodiumFluidType,
} from "@core/calculators/sodium/sodiumFluids";

type SodiumCalculatorTab = "fwd" | "hyperglycemia" | "correction";

const TAB_LABELS: { id: SodiumCalculatorTab; label: string }[] = [
  { id: "fwd", label: "Free water deficit" },
  { id: "hyperglycemia", label: "Hyperglycemia correction" },
  { id: "correction", label: "Na correction guidance" },
];

export default function SodiumBalanceReplacementPage() {
  const [tab, setTab] = useState<SodiumCalculatorTab>("fwd");

  return (
    <CalculatorShell
      title="Sodium balance and replacement"
      description="Free water deficit, hyperglycemia sodium correction, and hypo/hypernatremia infusion guidance."
    >
      <div className="flex flex-wrap gap-2">
        {TAB_LABELS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              tab === item.id
                ? "border-teal-500 bg-teal-700 text-white shadow-sm"
                : "border-teal-200 bg-white text-teal-800 hover:bg-teal-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "fwd" ? (
        <FreeWaterDeficitSection />
      ) : tab === "hyperglycemia" ? (
        <HyperglycemiaCorrectedSodiumSection />
      ) : (
        <SodiumCorrectionGuidanceSection />
      )}
    </CalculatorShell>
  );
}

function FreeWaterDeficitSection() {
  const [weightKg, setWeightKg] = useState("");
  const [naSerum, setNaSerum] = useState("");
  const [naTarget, setNaTarget] = useState("140");
  const [tbwFraction, setTbwFraction] = useState("0.6");

  const result = useMemo(() => {
    const weight = parseFloat(weightKg);
    const naS = parseFloat(naSerum);
    const naT = parseFloat(naTarget);
    const tbw = parseFloat(tbwFraction);
    if ([weight, naS, naT, tbw].some((v) => Number.isNaN(v))) return null;
    try {
      return calculateFreeWaterDeficit({
        weightKg: weight,
        naSerum: naS,
        naTarget: naT,
        tbwFraction: tbw,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [weightKg, naSerum, naTarget, tbwFraction]);

  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-sm text-teal-800">
        Estimate free water deficit for hypernatremia correction planning. Replace
        gradually and monitor sodium and neurologic status.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <UnitWeightInput label="Weight" valueKg={weightKg} onChangeKg={setWeightKg} />
        <Field label="Serum sodium (mEq/L)">
          <NumberInput value={naSerum} onChange={setNaSerum} min={0} />
        </Field>
        <Field label="Target sodium (mEq/L)">
          <NumberInput value={naTarget} onChange={setNaTarget} min={0} />
        </Field>
        <Field label="TBW fraction" hint="0.6 default; 0.7–0.75 for younger children">
          <SelectInput
            value={tbwFraction}
            onChange={setTbwFraction}
            options={[
              { value: "0.6", label: "0.6 (older child/adolescent)" },
              { value: "0.7", label: "0.7" },
              { value: "0.75", label: "0.75 (infant/toddler)" },
            ]}
          />
        </Field>
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Free water deficit"
            value={`${result.value.toFixed(2)} L`}
            interpretation={result.interpretation}
            warning={result.warning}
          />
          <CalculatorReferenceFooter>
            FWD (L) = (TBW × kg) × [(NaSerum / NaTarget) − 1]
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </div>
  );
}

function HyperglycemiaCorrectedSodiumSection() {
  const [serumSodium, setSerumSodium] = useState("");
  const [serumGlucose, setSerumGlucose] = useState("");

  const result = useMemo(() => {
    const sodium = parseFloat(serumSodium);
    const glucose = parseFloat(serumGlucose);
    if ([sodium, glucose].some((v) => Number.isNaN(v))) return null;
    try {
      return calculateHyperglycemiaCorrectedSodium({
        serumSodiumMmoll: sodium,
        serumGlucoseMgDl: glucose,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [serumSodium, serumGlucose]);

  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-sm text-teal-800">
        Estimate corrected serum sodium during hyperglycemia to assess true sodium
        status independent of glucose effect.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Serum sodium (mmol/L)" hint="mEq/L equivalent">
          <NumberInput
            value={serumSodium}
            onChange={setSerumSodium}
            min={0}
            placeholder="e.g. 132"
          />
        </Field>
        <Field label="Serum glucose (mg/dL)">
          <NumberInput
            value={serumGlucose}
            onChange={setSerumGlucose}
            min={0}
            placeholder="e.g. 450"
          />
        </Field>
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Corrected sodium"
            value={`${result.value.correctedSodiumMmoll.toFixed(1)} mmol/L`}
            interpretation={result.interpretation}
            warning={result.warning}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Measured sodium"
              value={`${result.value.serumSodiumMmoll.toFixed(1)} mmol/L`}
            />
            <MetricCard
              label="Glucose contribution"
              value={`${result.value.glucoseContributionMmoll >= 0 ? "+" : ""}${result.value.glucoseContributionMmoll.toFixed(1)} mmol/L`}
            />
          </div>
          <CalculatorReferenceFooter>
            cNa = sNa + 0.024 × (sGlu − 100), where sNa is measured serum sodium
            (mmol/L) and sGlu is serum glucose (mg/dL).
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </div>
  );
}

function SodiumCorrectionGuidanceSection() {
  const [weightKg, setWeightKg] = useState("");
  const [ageCategory, setAgeCategory] = useState<SodiumAgeCategory>("child");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [serumSodium, setSerumSodium] = useState("");
  const [correctionGoal, setCorrectionGoal] = useState<SodiumCorrectionGoal>("auto");
  const [ratePreset, setRatePreset] = useState("0.25");
  const [customRate, setCustomRate] = useState("0.25");
  const [fluidType, setFluidType] = useState<SodiumFluidType>("ns");

  const correctionRate =
    ratePreset === "custom" ? parseFloat(customRate) : parseFloat(ratePreset);

  const result = useMemo(() => {
    const weight = parseFloat(weightKg);
    const serum = parseFloat(serumSodium);
    if ([weight, serum, correctionRate].some((v) => Number.isNaN(v))) return null;
    try {
      return calculateSodiumCorrectionGuidance({
        weightKg: weight,
        ageCategory,
        sex,
        serumSodiumMmoll: serum,
        correctionRateMmollPerHr: correctionRate,
        fluidType,
        correctionGoal,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [
    weightKg,
    ageCategory,
    sex,
    serumSodium,
    correctionRate,
    fluidType,
    correctionGoal,
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-sm text-teal-800">
        <p>
          Estimate an IV infusion rate for fluids of varying tonicity when correcting
          hyponatremia or hypernatremia. Frequent serum sodium monitoring is required;
          rates here are a starting point only.
        </p>
        <div className="space-y-1.5 border-t border-teal-100/80 pt-3 text-xs text-teal-700">
          <p>Do not exceed 8 mEq/L in any 24-hour period.</p>
          <p>
            For acute hyponatremia management, sodium should only rise by 0.5–1 mEq/L per
            hour, and &lt; 10–12 mEq/L over the first 24 hours.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <UnitWeightInput label="Weight" valueKg={weightKg} onChangeKg={setWeightKg} />
        <Field label="Age category">
          <SelectInput
            value={ageCategory}
            onChange={(v) => setAgeCategory(v as SodiumAgeCategory)}
            options={[
              { value: "child", label: "Child" },
              { value: "adult", label: "Adult" },
              { value: "elderly", label: "Elderly" },
            ]}
          />
        </Field>
        <Field label="Sex" hint="Used for total body water fraction">
          <SelectInput
            value={sex}
            onChange={(v) => setSex(v as "male" | "female")}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
        </Field>
        <Field label="Serum sodium (mmol/L)" hint="mEq/L equivalent">
          <NumberInput
            value={serumSodium}
            onChange={setSerumSodium}
            min={0}
            placeholder="e.g. 128"
          />
        </Field>
        <Field label="Correction goal">
          <SelectInput
            value={correctionGoal}
            onChange={(v) => setCorrectionGoal(v as SodiumCorrectionGoal)}
            options={[
              { value: "auto", label: "Auto (from serum sodium)" },
              { value: "raise", label: "Raise serum sodium" },
              { value: "lower", label: "Lower serum sodium" },
            ]}
          />
        </Field>
        <Field label="IV fluid">
          <SelectInput
            value={fluidType}
            onChange={(v) => setFluidType(v as SodiumFluidType)}
            options={SODIUM_FLUID_OPTIONS.map((fluid) => ({
              value: fluid.id,
              label: `${fluid.label} (${fluid.naMmoll} mmol/L Na)`,
            }))}
          />
        </Field>
        <Field
          label="Target correction rate"
          hint="6–8 mmol/L per 24 h applies to hypo- and hypernatremia; other presets are hyponatremia-specific"
        >
          <SelectInput
            value={ratePreset}
            onChange={setRatePreset}
            options={SODIUM_CORRECTION_RATE_PRESETS.map((preset) => ({
              value: preset.value,
              label: preset.label,
            }))}
          />
        </Field>
        {ratePreset === "custom" ? (
          <Field label="Custom correction rate (mmol/L per hr)">
            <NumberInput
              value={customRate}
              onChange={setCustomRate}
              min={0}
              step="0.01"
              placeholder="e.g. 0.25"
            />
          </Field>
        ) : null}
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title={`Recommended ${result.value.fluidLabel} rate`}
            value={formatFluidRateMlPerHr(result.value.fluidRateMlPerHr)}
            interpretation={result.interpretation}
            warning={result.warning}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Correction direction"
              value={result.value.correctionDirection === "raise" ? "Raise Na" : "Lower Na"}
            />
            <MetricCard
              label="Target rate"
              value={formatSodiumRate(Math.abs(result.value.signedCorrectionRateMmollPerHr))}
            />
            <MetricCard
              label="Total body water"
              value={`${result.value.tbwLiters.toFixed(1)} L (${(result.value.tbwFraction * 100).toFixed(0)}%)`}
            />
            <MetricCard
              label="Δ serum Na per liter infused"
              value={`${result.value.changeInSerumSodiumPerLiter.toFixed(2)} mmol/L`}
            />
            <MetricCard
              label="24-hour volume at this rate"
              value={`${result.value.fluidVolumeLitersPer24Hr.toFixed(1)} L`}
            />
            <MetricCard
              label="Projected 24-hour Na change"
              value={`${result.value.projectedSodiumChangeMmollPer24Hr >= 0 ? "+" : ""}${result.value.projectedSodiumChangeMmollPer24Hr.toFixed(1)} mmol/L`}
            />
          </div>

          {result.value.warnings.length > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-teal-900">
              <p className="font-medium text-amber-900">Clinical guidance</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                {result.value.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <CalculatorReferenceFooter>
            Fluid rate (mL/hr) = (1000 × correction rate, mmol/L/hr) ÷ change in serum
            sodium; change in serum sodium = (fluid Na − serum Na) ÷ (TBW + 1); TBW = weight
            (kg) × body water fraction. Correct hypo- or hypernatremia cautiously by no more
            than 6–8 mmol/L per 24 hours; do not exceed 8 mmol/L in any 24-hour period. For
            symptomatic acute hyponatremia, target a 4–6 mmol/L rise in the first 6 hours, then
            slow the rate; reserve 3% saline for seriously symptomatic patients per local protocol.
            Source: fluids-Na.md.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-teal-100 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-teal-600">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-teal-950">{value}</p>
    </div>
  );
}
