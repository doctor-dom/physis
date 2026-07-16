import type { Sex } from "../types";
import { calculateMidParentalHeight, MPH_RANGE_CM } from "./midParentalHeight";

export type ParentalInputMode = "individual" | "mph";

export interface ParentalStatureSummary {
  mphCm: number;
  mphRangeLowCm: number;
  mphRangeHighCm: number;
  mpsCm: number;
  mphFormula: string;
  mpsFormula: string;
}

export interface ResolvedParentalStature extends ParentalStatureSummary {
  /** Present only when father and mother heights were entered individually. */
  fatherHeightCm?: number;
  motherHeightCm?: number;
  /** Combined parental height (father + mother). Always available. */
  parentalSumCm: number;
  inputMode: ParentalInputMode;
  mphDirectCm?: number;
  derivedFromMph: boolean;
}

export interface ParentalStatureInput {
  mode: ParentalInputMode;
  fatherCm: string;
  motherCm: string;
  mphDirectCm: string;
  sex: Sex;
}

/**
 * Parental height sum (father + mother) implied by a Tanner MPH and patient sex.
 * Inverse of: MPH = (father + mother + adjustment) ÷ 2
 */
export function parentalSumFromMph(mphCm: number, sex: Sex): number {
  const adjustment = sex === "male" ? 13 : -13;
  return 2 * mphCm - adjustment;
}

/**
 * MPS from MPH when individual parent heights are unknown.
 * Only the combined parental height (father + mother) is required.
 */
export function mpsFromMph(mphCm: number, sex: Sex): number {
  return parentalSumFromMph(mphCm, sex) / 2;
}

/**
 * MPS — mid-parental stature for adjusted RWT: average of parental heights.
 */
export function calculateMidParentalStature(
  fatherHeightCm: number,
  motherHeightCm: number,
): number {
  return (fatherHeightCm + motherHeightCm) / 2;
}

/**
 * MPH (Tanner) and MPS (RWT average) from parental heights.
 */
export function summarizeParentalStature(
  fatherHeightCm: number,
  motherHeightCm: number,
  sex: Sex,
): ParentalStatureSummary {
  const mphResult = calculateMidParentalHeight({
    fatherHeightCm,
    motherHeightCm,
    sex,
  });
  const mpsCm = calculateMidParentalStature(fatherHeightCm, motherHeightCm);

  const mphFormula =
    sex === "male"
      ? "MPH = (father + mother + 13) ÷ 2"
      : "MPH = (father + mother − 13) ÷ 2";

  return {
    mphCm: mphResult.value.midParentalHeightCm,
    mphRangeLowCm: mphResult.value.targetRangeLowCm,
    mphRangeHighCm: mphResult.value.targetRangeHighCm,
    mpsCm,
    mphFormula,
    mpsFormula: "MPS = (father + mother) ÷ 2",
  };
}

export function resolveParentalStature(
  input: ParentalStatureInput,
): ResolvedParentalStature | null {
  if (input.mode === "mph") {
    const mph = parseFloat(input.mphDirectCm);
    if (Number.isNaN(mph)) return null;
    const parentalSumCm = parentalSumFromMph(mph, input.sex);
    const mpsCm = parentalSumCm / 2;
    const mphFormula =
      input.sex === "male"
        ? "MPH = (father + mother + 13) ÷ 2"
        : "MPH = (father + mother − 13) ÷ 2";

    return {
      mphCm: mph,
      mphRangeLowCm: mph - MPH_RANGE_CM,
      mphRangeHighCm: mph + MPH_RANGE_CM,
      mpsCm,
      mphFormula,
      mpsFormula: "MPS = (father + mother) ÷ 2",
      parentalSumCm,
      inputMode: "mph",
      mphDirectCm: mph,
      derivedFromMph: true,
    };
  }

  const father = parseFloat(input.fatherCm);
  const mother = parseFloat(input.motherCm);
  if (Number.isNaN(father) || Number.isNaN(mother)) return null;
  const summary = summarizeParentalStature(father, mother, input.sex);
  return {
    ...summary,
    fatherHeightCm: father,
    motherHeightCm: mother,
    parentalSumCm: father + mother,
    inputMode: "individual",
    derivedFromMph: false,
  };
}

export { MPH_RANGE_CM };
