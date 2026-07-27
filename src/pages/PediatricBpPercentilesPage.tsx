import { useMemo, useState } from "react";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  Field,
  NumberInput,
  ResultCard,
  SelectInput,
} from "../components/FormFields";
import { UnitLengthInput } from "../components/UnitInputs";
import {
  BP_DATA_CITATION,
  calculatePediatricBpPercentiles,
  lookupHeightPercentile,
  type BpClassification,
} from "@core/calculators/bp/calculatePediatricBpPercentiles";
import BpPercentileGradientChart, {
  BpThresholdTable,
} from "../components/bp/BpPercentileGradientChart";

function classificationBadgeClass(c: BpClassification): string {
  switch (c) {
    case "normal":
      return "border-green-200 bg-green-50 text-green-900";
    case "elevated":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "stage1":
      return "border-orange-200 bg-orange-50 text-orange-900";
    case "stage2":
      return "border-red-200 bg-red-50 text-red-900";
  }
}

function classificationTitle(c: BpClassification): string {
  switch (c) {
    case "normal":
      return "Normal blood pressure";
    case "elevated":
      return "Elevated blood pressure";
    case "stage1":
      return "Stage 1 hypertension";
    case "stage2":
      return "Stage 2 hypertension";
  }
}

export default function PediatricBpPercentilesPage() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [ageYears, setAgeYears] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [sbp, setSbp] = useState("");
  const [dbp, setDbp] = useState("");

  const result = useMemo(() => {
    const age = parseFloat(ageYears);
    const h = parseFloat(heightCm);
    const sbpVal = parseFloat(sbp);
    const dbpVal = parseFloat(dbp);
    if ([age, h, sbpVal, dbpVal].some((v) => Number.isNaN(v))) return null;
    try {
      return calculatePediatricBpPercentiles({
        sex,
        ageYears: age,
        height: h,
        heightUnit: "cm",
        sbp: sbpVal,
        dbp: dbpVal,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [sex, ageYears, heightCm, sbp, dbp]);

  const heightPreview = useMemo(() => {
    const cm = parseFloat(heightCm);
    const age = parseFloat(ageYears);
    if (Number.isNaN(cm) || cm <= 0) return null;

    const inches = cm / 2.54;
    const equivalent = `${cm.toFixed(1)} cm · ${inches.toFixed(1)} in`;

    const percentile =
      !Number.isNaN(age) && age > 0
        ? lookupHeightPercentile(sex, age, cm, "cm")
        : null;

    return { equivalent, percentile };
  }, [sex, ageYears, heightCm]);

  return (
    <CalculatorShell
      title="Pediatric Hypertensive BP Percentiles"
      description="Classify blood pressure using AAP 2017 age-, sex-, and height-adjusted percentiles (ages 1–17 years)."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sex">
          <SelectInput
            value={sex}
            onChange={(v) => setSex(v as "male" | "female")}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
        </Field>
        <Field label="Age (years)" hint="AAP tables cover ages 1–17 years">
          <NumberInput
            value={ageYears}
            onChange={setAgeYears}
            min={0}
            step="0.1"
            placeholder="e.g. 10"
          />
        </Field>
        <UnitLengthInput
          label="Height"
          valueCm={heightCm}
          onChangeCm={setHeightCm}
          placeholder="e.g. 140"
        />
        <Field label="Systolic BP (mm Hg)">
          <NumberInput value={sbp} onChange={setSbp} min={0} step="1" placeholder="e.g. 112" />
        </Field>
        <Field label="Diastolic BP (mm Hg)">
          <NumberInput value={dbp} onChange={setDbp} min={0} step="1" placeholder="e.g. 72" />
        </Field>
      </div>

      {heightPreview && (
        <p className="text-sm text-teal-800">
          Height equivalent: <strong>{heightPreview.equivalent}</strong>
          {heightPreview.percentile && (
            <>
              {" "}
              · Height percentile (AAP table age {heightPreview.percentile.ageYearsUsed}):{" "}
              <strong>{heightPreview.percentile.heightPercentileLabel}</strong>
            </>
          )}
        </p>
      )}

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title={classificationTitle(result.value.overallClassification)}
            value={`${parseFloat(sbp)}/${parseFloat(dbp)} mm Hg`}
            interpretation={result.interpretation}
          />

          <section className="space-y-3 rounded-xl border border-teal-100 bg-white p-4">
            <h3 className="text-sm font-semibold text-teal-900">Patient context</h3>
            <p className="text-sm text-teal-800">
              Table age row: <strong>{result.value.ageYearsUsed} years</strong> · Height:{" "}
              <strong>{result.value.heightCm.toFixed(1)} cm</strong> (
              {result.value.heightPercentileLabel})
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <p
                className={`rounded-lg border px-3 py-2 text-sm ${classificationBadgeClass(result.value.sbpClassification)}`}
              >
                SBP: {result.value.sbpPercentileEstimate}
              </p>
              <p
                className={`rounded-lg border px-3 py-2 text-sm ${classificationBadgeClass(result.value.dbpClassification)}`}
              >
                DBP: {result.value.dbpPercentileEstimate}
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-teal-100 bg-white p-4">
            <h3 className="text-sm font-semibold text-teal-900">
              BP percentile chart at this height
            </h3>
            <p className="text-xs text-teal-600">
              Interpolated from AAP 2017 Table {sex === "male" ? "4" : "5"} for age{" "}
              {result.value.ageYearsUsed} and {result.value.heightPercentileLabel}.
            </p>

            <BpPercentileGradientChart
              sbp={parseFloat(sbp)}
              dbp={parseFloat(dbp)}
              thresholds={result.value.thresholds}
              sbpClassification={result.value.sbpClassification}
              dbpClassification={result.value.dbpClassification}
            />

            <BpThresholdTable
              sbp={parseFloat(sbp)}
              dbp={parseFloat(dbp)}
              thresholds={result.value.thresholds}
              sbpClassification={result.value.sbpClassification}
              dbpClassification={result.value.dbpClassification}
            />

            <p className="text-xs text-teal-600">
              Elevated BP: ≥ 90th percentile; stage 1 HTN: ≥ 95th percentile; stage 2 HTN: ≥
              95th percentile + 12 mm Hg. Overall classification uses the higher of the SBP and
              DBP categories. Bold values indicate thresholds that apply to the patient.
            </p>
          </section>

          <section className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 text-sm text-teal-900">
            <h3 className="font-semibold text-teal-900">Reference</h3>
            <p className="mt-2">{BP_DATA_CITATION}</p>
            <CalculatorReferenceFooter>
              AAP 2017 BP tables by age, sex, and height percentile — Table 4 (boys) / Table
              5 (girls). Source tables extracted from{" "}
              <code className="rounded bg-white px-1">data/excel/BP-data.pdf</code> (Pediatrics
              2017;140(3):e20171904).
            </CalculatorReferenceFooter>
          </section>
        </div>
      ) : null}
    </CalculatorShell>
  );
}
