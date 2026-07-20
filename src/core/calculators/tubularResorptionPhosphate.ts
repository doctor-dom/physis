import type { CalculatorResult } from "../types";
import { interpretTrp } from "./electrolytes/trpCacrGuidance";

export interface TubularResorptionPhosphateInput {
  phosUrine: number;
  phosSerum: number;
  creatSerum: number;
  creatUrine: number;
}

/**
 * TRP = 1 − [(phosUrine × creatSerum) ÷ (phosSerum × creatUrine)]
 * TRP < 0.85 suggests excess phosphorus wasting (clinical threshold; not in TRP-CaCr.txt).
 */
export function calculateTubularResorptionPhosphate(
  input: TubularResorptionPhosphateInput,
): CalculatorResult<number> {
  const { phosUrine, phosSerum, creatSerum, creatUrine } = input;

  if (phosSerum <= 0 || creatUrine <= 0) {
    throw new Error("Serum phosphate and urine creatinine must be greater than zero.");
  }

  const fraction = (phosUrine * creatSerum) / (phosSerum * creatUrine);
  const trp = 1 - fraction;

  return { value: trp, interpretation: interpretTrp(trp) };
}
