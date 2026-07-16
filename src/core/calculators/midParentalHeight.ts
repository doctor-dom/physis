import type { CalculatorResult, Sex } from "../types";

/** Mid-parental height range (cm) used for target height band. */
export const MPH_RANGE_CM = 8.5;

export interface MidParentalHeightInput {
  fatherHeightCm: number;
  motherHeightCm: number;
  sex: Sex;
}

export interface MidParentalHeightOutput {
  midParentalHeightCm: number;
  targetRangeLowCm: number;
  targetRangeHighCm: number;
}

/**
 * Standard mid-parental height (Tanner method).
 * Boys: (father + mother + 13) / 2
 * Girls: (father + mother − 13) / 2
 */
export function calculateMidParentalHeight(
  input: MidParentalHeightInput,
): CalculatorResult<MidParentalHeightOutput> {
  const { fatherHeightCm, motherHeightCm, sex } = input;
  const adjustment = sex === "male" ? 13 : -13;
  const mph = (fatherHeightCm + motherHeightCm + adjustment) / 2;

  return {
    value: {
      midParentalHeightCm: mph,
      targetRangeLowCm: mph - MPH_RANGE_CM,
      targetRangeHighCm: mph + MPH_RANGE_CM,
    },
    interpretation: `Target adult height range: ${(mph - MPH_RANGE_CM).toFixed(1)}–${(mph + MPH_RANGE_CM).toFixed(1)} cm (±${MPH_RANGE_CM} cm).`,
  };
}
