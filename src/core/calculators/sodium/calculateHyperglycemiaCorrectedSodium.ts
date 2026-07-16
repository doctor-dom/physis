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
