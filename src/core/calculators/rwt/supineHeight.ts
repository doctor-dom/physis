/** Adjustment when standing height is converted for adjusted RWT supine-length model. */
export const RWT_SUPINE_HEIGHT_ADJUSTMENT_CM = 1.25;

/**
 * Height for adjusted RWT equation.
 * - Standing height (checkbox checked): add 1.25 cm per reference method.
 * - Supine length entered (checkbox unchecked): use as-is.
 */
export function heightForAdjustedRwt(
  heightCm: number,
  isStandingHeight: boolean,
): { adjustedHeightCm: number; adjustmentAppliedCm: number } {
  if (!isStandingHeight) {
    return { adjustedHeightCm: heightCm, adjustmentAppliedCm: 0 };
  }
  return {
    adjustedHeightCm: heightCm + RWT_SUPINE_HEIGHT_ADJUSTMENT_CM,
    adjustmentAppliedCm: RWT_SUPINE_HEIGHT_ADJUSTMENT_CM,
  };
}
