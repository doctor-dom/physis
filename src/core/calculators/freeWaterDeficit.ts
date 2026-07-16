import type { CalculatorResult } from "../types";

export interface FreeWaterDeficitInput {
  weightKg: number;
  naSerum: number;
  naTarget: number;
  /** Total body water fraction; default 0.6 for older children/adults. */
  tbwFraction?: number;
}

/**
 * Free water deficit (L) = (TBW fraction × kg) × [(NaSerum / NaTarget) − 1]
 * Used for hypernatremia correction planning.
 */
export function calculateFreeWaterDeficit(
  input: FreeWaterDeficitInput,
): CalculatorResult<number> {
  const { weightKg, naSerum, naTarget, tbwFraction = 0.6 } = input;

  if (naTarget <= 0) {
    throw new Error("Target sodium must be greater than zero.");
  }

  const fwdLiters = tbwFraction * weightKg * (naSerum / naTarget - 1);

  const interpretation =
    fwdLiters > 0
      ? `Estimated free water deficit: ${fwdLiters.toFixed(2)} L. Replace gradually; monitor sodium and neurologic status.`
      : "No free water deficit calculated (serum sodium ≤ target).";

  return {
    value: fwdLiters,
    interpretation,
    warning:
      tbwFraction === 0.6
        ? "TBW fraction 0.6 assumes older child/adolescent. Use 0.7–0.75 for infants/toddlers if appropriate."
        : undefined,
  };
}
