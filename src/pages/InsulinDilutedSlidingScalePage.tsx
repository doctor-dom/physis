import { useMemo, useState } from "react";
import CopyClinicalSummaryButton from "../components/CopyClinicalSummaryButton";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  CollapsibleGuidancePanel,
  Field,
  NumberInput,
  ResultCard,
  SelectInput,
  SharedGuidanceBannerGroup,
} from "../components/FormFields";
import {
  calculateDilutedInsulinSlidingScale,
  DEFAULT_BG_TARGET_MG_DL,
  DEFAULT_CORRECTION_THRESHOLD_MG_DL,
  DEFAULT_DILUTION_FACTOR,
  DEFAULT_ICR,
  DEFAULT_ISF,
  DEFAULT_MEAL_CARBS_G,
  DEFAULT_ROUNDING_INCREMENT,
  DEFAULT_SNACK_CARBS_G,
  formatDilutedSlidingScaleForCopy,
  formatDilutedUnroundedDetails,
  INSULIN_ROUNDING_OPTIONS,
  summarizeDilutedRounding,
  type DilutedInsulinSlidingScaleResult,
} from "@core/calculators/insulin/calculateDilutedInsulinSlidingScale";
import {
  ALTERNATE_ROW_CADENCE_MG_DL,
  DEFAULT_ROW_CADENCE_MG_DL,
} from "@core/calculators/insulin/insulinScaleUtils";

const CLINICAL_GUIDANCE = [
  "Generates meal, snack, and correction sliding scales for diluted lispro with nurse-facing draw-up instructions.",
  "Meal and snack columns anchor carb coverage at the 70–BG target row; ISF sets the increment for each higher glucose row.",
  "Correction uses the same glucose rows and begins at the configured threshold with 0 units at anchor.",
  "50 mg/dL row steps are standard; optional 100 mg/dL rows double the glucose step per row.",
  "Syringe units = insulin dose × lispro dilution factor (default 10).",
];

export default function InsulinDilutedSlidingScalePage() {
  const [isf, setIsf] = useState(String(DEFAULT_ISF));
  const [icr, setIcr] = useState(String(DEFAULT_ICR));
  const [mealCarbs, setMealCarbs] = useState(String(DEFAULT_MEAL_CARBS_G));
  const [snackCarbs, setSnackCarbs] = useState(String(DEFAULT_SNACK_CARBS_G));
  const [bgTarget, setBgTarget] = useState(String(DEFAULT_BG_TARGET_MG_DL));
  const [correctionThreshold, setCorrectionThreshold] = useState(
    String(DEFAULT_CORRECTION_THRESHOLD_MG_DL),
  );
  const [dilutionFactor, setDilutionFactor] = useState(String(DEFAULT_DILUTION_FACTOR));
  const [roundingIncrement, setRoundingIncrement] = useState(
    String(DEFAULT_ROUNDING_INCREMENT),
  );
  const [wideRowCadence, setWideRowCadence] = useState(false);

  const effectiveCadence = wideRowCadence
    ? ALTERNATE_ROW_CADENCE_MG_DL
    : DEFAULT_ROW_CADENCE_MG_DL;

  const result = useMemo(() => {
    const values = [
      parseFloat(isf),
      parseFloat(icr),
      parseFloat(mealCarbs),
      parseFloat(snackCarbs),
      parseFloat(bgTarget),
      parseFloat(correctionThreshold),
      parseFloat(dilutionFactor),
      parseFloat(roundingIncrement),
    ];
    if (values.some((v) => Number.isNaN(v))) return null;

    try {
      return calculateDilutedInsulinSlidingScale({
        isf: values[0],
        icr: values[1],
        mealCarbsG: values[2],
        snackCarbsG: values[3],
        bgTargetMgDl: values[4],
        correctionThresholdMgDl: values[5],
        dilutionFactor: values[6],
        roundingIncrementUnits: values[7],
        rowCadenceMgDl: effectiveCadence,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [
    isf,
    icr,
    mealCarbs,
    snackCarbs,
    bgTarget,
    correctionThreshold,
    dilutionFactor,
    roundingIncrement,
    wideRowCadence,
    effectiveCadence,
  ]);

  const roundingLines =
    result && !("error" in result)
      ? summarizeDilutedRounding(
          result.value.roundingSummary,
          result.value.roundingIncrementUnits,
        )
      : ["Enter regimen values to view rounding summary."];

  const assumptionLines =
    result && !("error" in result)
      ? result.value.standardAssumptions
      : [
          `70–${DEFAULT_BG_TARGET_MG_DL} mg/dL anchor row (BG target), then ${DEFAULT_ROW_CADENCE_MG_DL} mg/dL steps (optional ${ALTERNATE_ROW_CADENCE_MG_DL} mg/dL).`,
          `Insulin rounding default ${DEFAULT_ROUNDING_INCREMENT} units; dilution factor default ${DEFAULT_DILUTION_FACTOR}.`,
          `Correction threshold default ${DEFAULT_CORRECTION_THRESHOLD_MG_DL} mg/dL.`,
        ];

  const copySummary =
    result && !("error" in result)
      ? formatDilutedSlidingScaleForCopy(result.value)
      : null;

  return (
    <CalculatorShell
      title="Diluted ISS generation"
      description="Generate meal, snack, and correction sliding scales for diluted lispro with syringe draw-up guidance."
    >
      <SharedGuidanceBannerGroup
        sections={[
          { id: "clinical", title: "Clinical guidance", lines: CLINICAL_GUIDANCE },
          { id: "assumptions", title: "Standard assumptions", lines: assumptionLines },
          { id: "rounding", title: "Rounding summary", lines: roundingLines },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ISF (insulin sensitivity factor)" hint="mg/dL per 1 unit">
          <NumberInput value={isf} onChange={setIsf} min={0} step="1" placeholder="e.g. 300" />
        </Field>
        <Field label="ICR (insulin-to-carb ratio)" hint="grams carb per 1 unit">
          <NumberInput value={icr} onChange={setIcr} min={0} step="0.1" placeholder="e.g. 100" />
        </Field>
        <Field label="Default meal carbs (g)">
          <NumberInput value={mealCarbs} onChange={setMealCarbs} min={0} step="1" placeholder="e.g. 40" />
        </Field>
        <Field label="Default snack carbs (g)">
          <NumberInput value={snackCarbs} onChange={setSnackCarbs} min={0} step="1" placeholder="e.g. 20" />
        </Field>
        <Field label="BG target (mg/dL)" hint="Upper bound of the anchor row (70 to target)">
          <NumberInput value={bgTarget} onChange={setBgTarget} min={0} step="1" placeholder="e.g. 120" />
        </Field>
        <Field
          label="Correction threshold (mg/dL)"
          hint="Glucose at which correction / not-eating insulin begins"
        >
          <NumberInput
            value={correctionThreshold}
            onChange={setCorrectionThreshold}
            min={0}
            step="1"
            placeholder="e.g. 250"
          />
        </Field>
        <Field label="Lispro dilution factor" hint="Syringe units = insulin dose × factor">
          <NumberInput
            value={dilutionFactor}
            onChange={setDilutionFactor}
            min={0}
            step="1"
            placeholder="e.g. 10"
          />
        </Field>
        <Field label="Insulin rounding rule">
          <SelectInput
            value={roundingIncrement}
            onChange={setRoundingIncrement}
            options={INSULIN_ROUNDING_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </Field>
      </div>

      <fieldset className="space-y-3 rounded-xl border border-teal-100 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-teal-900">Scale options</legend>
        <label className="flex items-center gap-2 text-sm text-teal-900">
          <input
            type="checkbox"
            checked={wideRowCadence}
            onChange={(e) => setWideRowCadence(e.target.checked)}
            className="rounded border-teal-300 text-teal-700 focus:ring-teal-500"
          />
          Use {ALTERNATE_ROW_CADENCE_MG_DL} mg/dL row cadence (default {DEFAULT_ROW_CADENCE_MG_DL} mg/dL)
        </label>
        {wideRowCadence ? (
          <p className="text-xs text-teal-700">
            Each row spans {ALTERNATE_ROW_CADENCE_MG_DL} mg/dL; ISF step doubles per row.
          </p>
        ) : null}
      </fieldset>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Scale summary"
            value={`Dilution ×${result.value.dilutionFactor} · rounding ${result.value.roundingIncrementUnits} units`}
            interpretation={result.interpretation}
          />

          <CopyClinicalSummaryButton summary={copySummary} />

          <UnifiedScaleTable result={result.value} />

          <CollapsibleGuidancePanel
            title="Unrounded calculation details"
            lines={formatDilutedUnroundedDetails(result.value)}
          />

          <CalculatorReferenceFooter>
            Base meal/snack at 70–BG target mg/dL = round(carbs ÷ ICR) to the selected increment.
            Each higher row adds (row cadence ÷ ISF) units before rounding. Correction uses the same
            glucose rows, starting at the configured threshold with 0 units. Syringe draw = insulin
            dose × lispro dilution factor.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}

function UnifiedScaleTable({ result }: { result: DilutedInsulinSlidingScaleResult }) {
  return (
    <section className="overflow-hidden rounded-xl border border-teal-100 bg-white">
      <h3 className="border-b border-teal-100 bg-teal-50/60 px-4 py-2 text-sm font-semibold text-teal-900">
        Combined sliding scale
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm text-teal-900">
          <thead>
            <tr className="border-b border-teal-100 text-xs text-teal-600">
              <th className="px-4 py-2 font-medium align-top">Glucose (mg/dL)</th>
              <th className="px-4 py-2 font-medium align-top">Meal</th>
              <th className="px-4 py-2 font-medium align-top">Snack</th>
              <th className="px-4 py-2 font-medium align-top">Correction</th>
            </tr>
          </thead>
          <tbody>
            {result.unifiedRows.map((row) => (
              <tr key={row.bgRange.label} className="border-b border-teal-50 align-top">
                <td className="px-4 py-3 tabular-nums whitespace-nowrap">
                  {row.bgRange.low}–{row.bgRange.high}
                </td>
                <td className="px-4 py-3 text-xs leading-relaxed">{row.meal.instruction}</td>
                <td className="px-4 py-3 text-xs leading-relaxed">{row.snack.instruction}</td>
                <td className="px-4 py-3 text-xs leading-relaxed">
                  {row.correction.applicable ? (
                    row.correction.instruction
                  ) : (
                    <span className="text-teal-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
