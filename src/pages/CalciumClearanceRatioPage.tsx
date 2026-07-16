import { useMemo, useState } from "react";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  ClinicalGuidanceBanner,
  Field,
  NumberInput,
  ResultCard,
} from "../components/FormFields";
import { calculateCalciumClearanceRatio } from "@core/calculators/calciumClearanceRatio";
import {
  CCR_BANNER_GUIDANCE,
  CCR_CASR_TEST_THRESHOLD,
  CCR_FHH_LIKELY_THRESHOLD,
  CCR_FORMULA_TEXT,
  CCR_UCA_CR_PERCENTILE_NOTE,
} from "@core/calculators/electrolytes/trpCacrGuidance";

export default function CalciumClearanceRatioPage() {
  const [caUrine, setCaUrine] = useState("");
  const [caSerum, setCaSerum] = useState("");
  const [creatSerum, setCreatSerum] = useState("");
  const [creatUrine, setCreatUrine] = useState("");

  const result = useMemo(() => {
    const values = [
      parseFloat(caUrine),
      parseFloat(caSerum),
      parseFloat(creatSerum),
      parseFloat(creatUrine),
    ];
    if (values.some((v) => Number.isNaN(v))) return null;
    try {
      return calculateCalciumClearanceRatio({
        caUrine: values[0],
        caSerum: values[1],
        creatSerum: values[2],
        creatUrine: values[3],
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [caUrine, caSerum, creatSerum, creatUrine]);

  return (
    <CalculatorShell
      title="Calcium Clearance Ratio (CCR)"
      description="Ratio of urinary to serum calcium clearance for hypercalcemia workup and FHH differentiation."
    >
      <ClinicalGuidanceBanner
        lines={[...CCR_BANNER_GUIDANCE, CCR_UCA_CR_PERCENTILE_NOTE]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Urine calcium (mg/dL)"
          labelTooltip="TRP-CaCr.txt specifies mg/dL for UCa, SCa, SCr, and UCr."
        >
          <NumberInput value={caUrine} onChange={setCaUrine} min={0} />
        </Field>
        <Field label="Serum calcium (mg/dL)">
          <NumberInput value={caSerum} onChange={setCaSerum} min={0} />
        </Field>
        <Field label="Serum creatinine (mg/dL)">
          <NumberInput value={creatSerum} onChange={setCreatSerum} min={0} />
        </Field>
        <Field label="Urine creatinine (mg/dL)">
          <NumberInput value={creatUrine} onChange={setCreatUrine} min={0} />
        </Field>
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="Calcium clearance ratio"
            value={result.value.ccr.toFixed(4)}
            interpretation={result.interpretation}
            warning={result.warning}
          />
          <CalculatorReferenceFooter>
            {CCR_FORMULA_TEXT} Cutoffs: &lt; {CCR_FHH_LIKELY_THRESHOLD} FHH likely; &gt;{" "}
            {CCR_FHH_LIKELY_THRESHOLD} FHH unlikely (PHPT more likely when hypercalcemic); ≤{" "}
            {CCR_CASR_TEST_THRESHOLD} consider CaSR gene testing. Source: data/calc/TRP-CaCr.txt.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}
