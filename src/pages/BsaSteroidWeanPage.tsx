import { useMemo, useState } from "react";
import {
  CalculatorShell,
  Field,
  InfoTooltip,
  NumberInput,
  ResultCard,
  SelectInput,
} from "../components/FormFields";
import { UnitLengthInput, UnitWeightInput } from "../components/UnitInputs";
import SteroidWeanScheduleView from "../components/steroid/SteroidWeanScheduleView";
import { calculateBsa } from "@core/calculators/bsa/calculateBsa";
import { calculateSteroidDose } from "@core/calculators/steroid/calculateSteroidDose";
import { buildSteroidWeanSchedule } from "@core/calculators/steroid/calculateSteroidWeanSchedule";
import { STEROID_POTENCIES } from "../data/steroid/potencies";

type InputMode = "weight" | "bsa";
type PageStep = "input" | "schedule";

function ToggleSwitch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-teal-100 bg-white px-4 py-3"
    >
      <span className="text-sm font-medium text-teal-900">{label}</span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-teal-200 transition peer-checked:bg-teal-600" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function BsaSteroidWeanPage() {
  const [step, setStep] = useState<PageStep>("input");
  const [inputMode, setInputMode] = useState<InputMode>("weight");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [bsaDirectM2, setBsaDirectM2] = useState("");

  const [existingSteroids, setExistingSteroids] = useState(false);
  const [steroidId, setSteroidId] = useState(STEROID_POTENCIES[0].id);
  const [dailyDoseMg, setDailyDoseMg] = useState("");

  const [schedule, setSchedule] = useState<ReturnType<
    typeof buildSteroidWeanSchedule
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolvedBsaPreview = useMemo(() => {
    try {
      if (inputMode === "bsa") {
        const bsa = parseFloat(bsaDirectM2);
        if (Number.isNaN(bsa)) return null;
        return calculateBsa({ bsaM2Direct: bsa });
      }
      const weight = parseFloat(weightKg);
      if (Number.isNaN(weight)) return null;
      const height = parseFloat(heightCm);
      return calculateBsa({
        weightKg: weight,
        heightCm: Number.isNaN(height) ? undefined : height,
      });
    } catch {
      return null;
    }
  }, [inputMode, weightKg, heightCm, bsaDirectM2]);

  const hasValidBsa = resolvedBsaPreview !== null;

  const canCalculate =
    hasValidBsa &&
    (!existingSteroids ||
      (steroidId &&
        !Number.isNaN(parseFloat(dailyDoseMg)) &&
        parseFloat(dailyDoseMg) > 0));

  function handleCalculate() {
    setError(null);
    try {
      let bsaResult;
      if (inputMode === "bsa") {
        bsaResult = calculateBsa({
          bsaM2Direct: parseFloat(bsaDirectM2),
        });
      } else {
        const weight = parseFloat(weightKg);
        const height = parseFloat(heightCm);
        bsaResult = calculateBsa({
          weightKg: weight,
          heightCm: Number.isNaN(height) ? undefined : height,
        });
      }

      let steroidResult = null;
      if (existingSteroids) {
        steroidResult = calculateSteroidDose({
          steroidId,
          dailyDoseMg: parseFloat(dailyDoseMg),
          bsaM2: bsaResult.value.bsaM2,
        }).value;
      }

      setSchedule(
        buildSteroidWeanSchedule(bsaResult.value.bsaM2, steroidResult),
      );
      setStep("schedule");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (step === "schedule" && schedule) {
    return (
      <CalculatorShell
        title="BSA & Steroid Wean — Schedule"
        description="Structured maintenance, stress, and wean hydrocortisone dosing by body surface area."
      >
        <SteroidWeanScheduleView
          schedule={schedule}
          onBack={() => setStep("input")}
        />
      </CalculatorShell>
    );
  }

  return (
    <CalculatorShell
      title="BSA & Steroid Wean"
      description="Body surface area from weight and height (or direct entry) with steroid potency conversion and wean planning."
    >
      <fieldset className="space-y-4 rounded-xl border border-teal-100 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-teal-900">
          Patient size
        </legend>

        <Field label="Input method">
          <SelectInput
            value={inputMode}
            onChange={(v) => setInputMode(v as InputMode)}
            options={[
              { value: "weight", label: "Weight (optional height)" },
              { value: "bsa", label: "BSA directly (m²)" },
            ]}
          />
        </Field>

        {inputMode === "weight" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <UnitWeightInput
              label="Weight"
              hint="Required when not entering BSA directly"
              valueKg={weightKg}
              onChangeKg={setWeightKg}
            />
            <UnitLengthInput
              label="Height (optional)"
              hint="If provided, BSA uses Haycock method"
              valueCm={heightCm}
              onChangeCm={setHeightCm}
            />
          </div>
        ) : (
          <Field
            label="Body surface area (m²)"
            hint="Direct entry — sufficient to proceed"
          >
            <NumberInput
              value={bsaDirectM2}
              onChange={setBsaDirectM2}
              min={0}
              step="0.001"
              placeholder="e.g. 0.65"
            />
          </Field>
        )}

        {hasValidBsa && resolvedBsaPreview && (
          <p className="text-sm text-teal-800">
            Estimated BSA:{" "}
            <strong>{resolvedBsaPreview.value.bsaM2.toFixed(3)} m²</strong>
            <span className="text-teal-600">
              {" "}
              ({resolvedBsaPreview.value.methodLabel})
            </span>
          </p>
        )}
      </fieldset>

      {hasValidBsa && (
        <fieldset className="space-y-4 rounded-xl border border-teal-100 bg-teal-50/30 p-4">
          <legend className="px-1 text-sm font-semibold text-teal-900">
            Steroid regimen
          </legend>

          <ToggleSwitch
            id="existing-steroids"
            label="Existing steroids?"
            checked={existingSteroids}
            onChange={setExistingSteroids}
          />

          {existingSteroids && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Steroid"
                hint="Relative potency vs hydrocortisone (HCT = 1.0)"
              >
                <SelectInput
                  value={steroidId}
                  onChange={setSteroidId}
                  options={STEROID_POTENCIES.map((s) => ({
                    value: s.id,
                    label: `${s.label} (${s.hctPotency.toFixed(1)}× HCT)`,
                  }))}
                />
              </Field>
              <Field label="Total daily dose (mg)">
                <NumberInput
                  value={dailyDoseMg}
                  onChange={setDailyDoseMg}
                  min={0}
                  step="0.1"
                  placeholder="e.g. 10"
                />
              </Field>
            </div>
          )}

          {!existingSteroids && (
            <p className="text-xs text-teal-700">
              No current steroid — recommendations will show maintenance and stress
              dosing only.
              <InfoTooltip text="Enable existing steroids to compare the current regimen against the 30 mg/m²/day wean threshold and view a structured wean schedule." />
            </p>
          )}
        </fieldset>
      )}

      <button
        type="button"
        onClick={handleCalculate}
        disabled={!canCalculate}
        className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Calculate steroid doses
      </button>

      {error && <ResultCard title="Error" error={error} />}
    </CalculatorShell>
  );
}
