import { useMemo, useState } from "react";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
  SharedGuidanceBannerGroup,
} from "../components/FormFields";
import {
  calculateInsulinMdiToIss,
  DEFAULT_ROW_CADENCE_MG_DL,
  formatBgRangeLabel,
  formatInsulinUnits,
  summarizeIcrRounding,
  summarizeIsfRounding,
  type InsulinMdiToIssResult,
} from "@core/calculators/insulin/calculateInsulinMdiToIss";
import { ALTERNATE_ROW_CADENCE_MG_DL } from "@core/calculators/insulin/insulinScaleUtils";

const CLINICAL_GUIDANCE = [
  "Meal and snack columns anchor carb coverage at the 70–100 mg/dL row; ISF sets the increment for each higher glucose row.",
  "Overnight correction starts at the 201–250 mg/dL row (0 units at anchor, then ISF-based steps upward).",
  "50 mg/dL row steps are standard; optional 100 mg/dL rows double the glucose range per step. Whole-unit base meal/snack doses are standard.",
];

export default function InsulinMdiToIssPage() {
  const [isf, setIsf] = useState("");
  const [icr, setIcr] = useState("");
  const [mealCarbs, setMealCarbs] = useState("60");
  const [snackCarbs, setSnackCarbs] = useState("15");
  const [wideRowCadence, setWideRowCadence] = useState(false);
  const [halfUnitIncrements, setHalfUnitIncrements] = useState(false);

  const effectiveCadence = wideRowCadence
    ? ALTERNATE_ROW_CADENCE_MG_DL
    : DEFAULT_ROW_CADENCE_MG_DL;

  const result = useMemo(() => {
    const isfVal = parseFloat(isf);
    const icrVal = parseFloat(icr);
    const meal = parseFloat(mealCarbs);
    const snack = parseFloat(snackCarbs);
    const values = [isfVal, icrVal, meal, snack];
    if (values.some((v) => Number.isNaN(v))) return null;

    try {
      return calculateInsulinMdiToIss({
        isf: isfVal,
        icr: icrVal,
        mealCarbsG: meal,
        snackCarbsG: snack,
        rowCadenceMgDl: effectiveCadence,
        halfUnitIncrements,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [
    isf,
    icr,
    mealCarbs,
    snackCarbs,
    wideRowCadence,
    effectiveCadence,
    halfUnitIncrements,
  ]);

  const roundingLines = result && !("error" in result)
    ? [
        "ICR (carb coverage):",
        ...summarizeIcrRounding(result.value.roundingSummary.icr),
        "ISF (correction steps):",
        ...summarizeIsfRounding(result.value.roundingSummary.isf),
      ]
    : ["Enter ISF, ICR, and carb amounts to view rounding summary."];

  const assumptionLines =
    result && !("error" in result)
      ? result.value.standardAssumptions
      : [
          `${DEFAULT_ROW_CADENCE_MG_DL} mg/dL row cadence (optional ${ALTERNATE_ROW_CADENCE_MG_DL} mg/dL rows).`,
          "Whole units for base meal and base snack insulin (carb coverage at the 70–100 mg/dL row).",
          "Overnight scale starts at the 201–250 mg/dL row with 0 units and increases by ISF above that row.",
        ];

  return (
    <CalculatorShell
      title="Insulin MDI → ISS"
      description="Convert insulin ISF/ICR MDI regimen to sliding scales using fixed carbs."
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
          <NumberInput
            value={isf}
            onChange={setIsf}
            min={0}
            step="1"
            placeholder="e.g. 100"
          />
        </Field>
        <Field label="ICR (insulin-to-carb ratio)" hint="grams carb per 1 unit">
          <NumberInput
            value={icr}
            onChange={setIcr}
            min={0}
            step="0.1"
            placeholder="e.g. 20"
          />
        </Field>
        <Field label="Default meal carbs (g)">
          <NumberInput
            value={mealCarbs}
            onChange={setMealCarbs}
            min={0}
            step="1"
            placeholder="e.g. 60"
          />
        </Field>
        <Field label="Default snack carbs (g)">
          <NumberInput
            value={snackCarbs}
            onChange={setSnackCarbs}
            min={0}
            step="1"
            placeholder="e.g. 15"
          />
        </Field>
      </div>

      <fieldset className="space-y-4 rounded-xl border border-teal-100 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-teal-900">
          Scale options
        </legend>

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
            Each row spans {ALTERNATE_ROW_CADENCE_MG_DL} mg/dL; ISF step doubles per row. Overnight
            anchor remains the 201–250 mg/dL row when present.
          </p>
        ) : null}

        <label className="flex items-center gap-2 text-sm text-teal-900">
          <input
            type="checkbox"
            checked={halfUnitIncrements}
            onChange={(e) => setHalfUnitIncrements(e.target.checked)}
            className="rounded border-teal-300 text-teal-700 focus:ring-teal-500"
          />
          Round scale values to 0.5 unit increments (default: whole units)
        </label>
      </fieldset>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Sliding scale summary"
            value={`${formatInsulinUnits(result.value.baseMealUnits)} meal · ${formatInsulinUnits(result.value.baseSnackUnits)} snack at 70–100 mg/dL`}
            interpretation={result.interpretation}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Step per row"
              value={`${result.value.stepUnitsPerRow.toFixed(2)} units / ${result.value.rowCadenceMgDl} mg/dL`}
            />
            <MetricCard label="ISF" value={`${result.value.isf} mg/dL/unit`} />
            <MetricCard label="ICR" value={`1 unit : ${result.value.icr} g`} />
          </div>

          <IssScaleTable result={result.value} />

          <CalculatorReferenceFooter>
            Base meal/snack at 70–100 mg/dL = round(meal or snack carbs ÷ ICR). Each higher
            row adds (row cadence ÷ ISF) units. Overnight column begins at 201–250 mg/dL with
            0 units, then uses the same ISF step for higher rows.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}

function IssScaleTable({ result }: { result: InsulinMdiToIssResult }) {
  return (
    <section className="overflow-hidden rounded-xl border border-teal-100 bg-white">
      <h3 className="border-b border-teal-100 bg-teal-50/60 px-4 py-2 text-sm font-semibold text-teal-900">
        Insulin sliding scale
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm text-teal-900">
          <thead>
            <tr className="border-b border-teal-100 text-xs text-teal-600">
              <th className="px-4 py-2 font-medium">Glucose (mg/dL)</th>
              <th className="px-4 py-2 font-medium">Meal (units)</th>
              <th className="px-4 py-2 font-medium">Snack (units)</th>
              <th className="px-4 py-2 font-medium">Overnight (units)</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.bgRange.label} className="border-b border-teal-50">
                <td className="px-4 py-2 tabular-nums">
                  {formatBgRangeLabel(row.bgRange.label)}
                </td>
                <td className="px-4 py-2 tabular-nums font-medium">
                  {formatInsulinUnits(row.meal.displayUnits)}
                </td>
                <td className="px-4 py-2 tabular-nums font-medium">
                  {formatInsulinUnits(row.snack.displayUnits)}
                </td>
                <td className="px-4 py-2 tabular-nums font-medium">
                  {row.overnight.applicable
                    ? formatInsulinUnits(row.overnight.displayUnits)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
