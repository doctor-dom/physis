import { useMemo, useState } from "react";
import {
  CalculatorReferenceFooter,
  CalculatorShell,
  ClinicalGuidanceBanner,
  Field,
  NumberInput,
  ResultCard,
} from "../components/FormFields";
import { calculateTubularResorptionPhosphate } from "@core/calculators/tubularResorptionPhosphate";
import {
  TRP_BANNER_GUIDANCE,
  TRP_FORMULA_TEXT,
  TRP_PHOSPHORUS_WASTING_THRESHOLD,
} from "@core/calculators/electrolytes/trpCacrGuidance";

export default function TubularResorptionPhosphatePage() {
  const [phosUrine, setPhosUrine] = useState("");
  const [phosSerum, setPhosSerum] = useState("");
  const [creatSerum, setCreatSerum] = useState("");
  const [creatUrine, setCreatUrine] = useState("");

  const result = useMemo(() => {
    const values = [
      parseFloat(phosUrine),
      parseFloat(phosSerum),
      parseFloat(creatSerum),
      parseFloat(creatUrine),
    ];
    if (values.some((v) => Number.isNaN(v))) return null;
    try {
      return calculateTubularResorptionPhosphate({
        phosUrine: values[0],
        phosSerum: values[1],
        creatSerum: values[2],
        creatUrine: values[3],
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [phosUrine, phosSerum, creatSerum, creatUrine]);

  return (
    <CalculatorShell
      title="Tubular Resorption of Phosphate (TRP)"
      description="Estimate renal phosphate reabsorption to assess phosphorus wasting."
    >
      <ClinicalGuidanceBanner lines={[...TRP_BANNER_GUIDANCE]} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Urine phosphate"
          hint="Same units as serum phosphate"
          labelTooltip="Use paired urine and serum samples. TRP-CaCr.txt: uPhos, sPhos, sCr, uCr."
        >
          <NumberInput value={phosUrine} onChange={setPhosUrine} min={0} />
        </Field>
        <Field label="Serum phosphate">
          <NumberInput value={phosSerum} onChange={setPhosSerum} min={0} />
        </Field>
        <Field label="Serum creatinine">
          <NumberInput value={creatSerum} onChange={setCreatSerum} min={0} />
        </Field>
        <Field label="Urine creatinine">
          <NumberInput value={creatUrine} onChange={setCreatUrine} min={0} />
        </Field>
      </div>

      {result && "error" in result ? (
        <ResultCard title="Error" error={result.error} />
      ) : result ? (
        <div className="space-y-4">
          <ResultCard
            title="TRP"
            value={result.value.toFixed(3)}
            interpretation={result.interpretation}
          />
          <CalculatorReferenceFooter>
            {TRP_FORMULA_TEXT}. Interpretive cutoff: TRP &lt;{" "}
            {TRP_PHOSPHORUS_WASTING_THRESHOLD} for suggestive renal phosphate wasting
            (clinical threshold; not specified in TRP-CaCr.txt). Source: data/calc/TRP-CaCr.txt.
          </CalculatorReferenceFooter>
        </div>
      ) : null}
    </CalculatorShell>
  );
}
