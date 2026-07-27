import type { CalculatorResult } from "../../types";

export interface HyperglycemiaCorrectedSodiumInput {
  /** Measured serum sodium (mmol/L or mEq/L). */
  serumSodiumMmoll: number;
  /** Serum glucose in mg/dL. */
  serumGlucoseMgDl: number;
}

export interface HyperglycemiaCorrectedSodiumResult {
  serumSodiumMmoll: number;
  serumGlucoseMgDl: number;
  glucoseContributionMmoll: number;
  correctedSodiumMmoll: number;
}

/**
 * Corrected sodium for hyperglycemia: cNa = sNa + 0.024 × (sGlu − 100).
 */
export const HYPERGLYCEMIA_SODIUM_FORMULA_TOOLTIP =
  "cNa = sNa + 0.024 × (sGlu − 100), where sNa is measured serum sodium (mmol/L) and sGlu is serum glucose (mg/dL).";

export const HYPERGLYCEMIA_SODIUM_CITATION =
  "Katz MA. Hyperglycemia-Induced Hyponatremia — Calculation of Expected Serum Sodium Depression. N Engl J Med. 1973;289(16):843-844.";

export const HYPERGLYCEMIA_SODIUM_RESULT_TOOLTIP = `${HYPERGLYCEMIA_SODIUM_FORMULA_TOOLTIP}\n\n${HYPERGLYCEMIA_SODIUM_CITATION}`;

export function calculateHyperglycemiaCorrectedSodium(
  input: HyperglycemiaCorrectedSodiumInput,
): CalculatorResult<HyperglycemiaCorrectedSodiumResult> {
  const { serumSodiumMmoll, serumGlucoseMgDl } = input;

  if (serumSodiumMmoll <= 0) {
    throw new Error("Enter a valid serum sodium.");
  }
  if (serumGlucoseMgDl < 0) {
    throw new Error("Enter a valid serum glucose.");
  }

  const glucoseContributionMmoll = 0.024 * (serumGlucoseMgDl - 100);
  const correctedSodiumMmoll = serumSodiumMmoll + glucoseContributionMmoll;

  const interpretation =
    serumGlucoseMgDl === 100
      ? "At glucose 100 mg/dL, corrected sodium equals measured sodium."
      : `Hyperglycemia contributes ${glucoseContributionMmoll >= 0 ? "+" : ""}${glucoseContributionMmoll.toFixed(1)} mmol/L to the measured sodium.`;

  return {
    value: {
      serumSodiumMmoll,
      serumGlucoseMgDl,
      glucoseContributionMmoll,
      correctedSodiumMmoll,
    },
    interpretation,
    warning:
      serumGlucoseMgDl > 400
        ? "Very high glucose — corrected sodium is an estimate; interpret with clinical context and repeat labs."
        : undefined,
  };
}
