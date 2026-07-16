import type { CalculatorResult } from "../types";
import {
  classifyCcr,
  interpretCcr,
  type CcrInterpretationCategory,
} from "./electrolytes/trpCacrGuidance";

export interface CalciumClearanceRatioInput {
  caUrine: number;
  caSerum: number;
  creatSerum: number;
  creatUrine: number;
}

export interface CalciumClearanceRatioResult {
  ccr: number;
  category: CcrInterpretationCategory;
}

/**
 * Calcium clearance ratio = [(CaUrine × CreatSerum) ÷ (CaSerum × CreatUrine)]
 * Cutoffs per data/calc/TRP-CaCr.txt.
 */
export function calculateCalciumClearanceRatio(
  input: CalciumClearanceRatioInput,
): CalculatorResult<CalciumClearanceRatioResult> {
  const { caUrine, caSerum, creatSerum, creatUrine } = input;

  if (caSerum <= 0 || creatUrine <= 0) {
    throw new Error("Serum calcium and urine creatinine must be greater than zero.");
  }

  const ccr = (caUrine * creatSerum) / (caSerum * creatUrine);
  const category = classifyCcr(ccr);

  return {
    value: { ccr, category },
    interpretation: interpretCcr(ccr),
    warning:
      category === "fhh_likely"
        ? "Low Ca/Cr clearance ratio — evaluate for FHH and confounders before attributing hypercalcemia to primary hyperparathyroidism."
        : category === "casr_testing_zone"
          ? "Borderline ratio — FHH is unlikely, but CaSR testing may still be indicated when ≤ 0.020."
          : undefined,
  };
}
