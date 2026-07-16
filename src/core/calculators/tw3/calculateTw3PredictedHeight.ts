/**
 * Tanner–Whitehouse 3 (TW3) adult height prediction (Tanner et al. 1975, Tables V & VI).
 * PAH = constant + β_height·height + β_CA·chronological age + β_BA·RUS bone age
 * Optional MPH adjustment: PAH += (MPH − population mean MPH) / 3
 */

import type { CalculatorResult, Sex } from "../../types";

export type Tw3MenarchalStatus = "pre" | "post";

export interface Tw3CoefficientSet {
  betaHeight: number;
  betaChronAge: number;
  betaBoneAge: number;
  constant: number;
  residualSd: number;
  r: number;
}

export interface Tw3AgeBand extends Tw3CoefficientSet {
  ageMinYears: number;
  ageMaxYears: number;
}

export type Tw3GirlChart = "childhood" | "premenarche" | "postmenarche" | "late";

export interface Tw3GirlAgeBand extends Tw3AgeBand {
  chart: Tw3GirlChart;
}

export interface Tw3PredictedHeightInput {
  sex: Sex;
  heightCm: number;
  chronologicalAgeYears: number;
  /** TW3 RUS bone age in years */
  boneAgeYears: number;
  /** Required for girls aged 11–14.5 y */
  menarchalStatus?: Tw3MenarchalStatus | null;
  /** When set, applies + (MPH − mean) / 3 per Tanner 1975 */
  midParentalHeightCm?: number;
  applyMphAdjustment?: boolean;
  /** Population mean MPH cited in Tanner 1975 (cm) */
  mphPopulationMeanCm?: number;
  maleBands: Tw3AgeBand[];
  femaleBands: Tw3GirlAgeBand[];
}

export const TW3_AGE_MIN_YEARS = 4;
export const TW3_BOYS_AGE_MAX_YEARS = 18;
export const TW3_GIRLS_AGE_MAX_YEARS = 16;
export const TW3_MENARCHE_AGE_MIN_YEARS = 11;
export const TW3_MENARCHE_AGE_MAX_YEARS = 15;
export const TW3_MPH_POPULATION_MEAN_CM = 168;

export function tw3MenarchalStatusRequired(
  sex: Sex,
  chronologicalAgeYears: number,
): boolean {
  return (
    sex === "female" &&
    chronologicalAgeYears >= TW3_MENARCHE_AGE_MIN_YEARS &&
    chronologicalAgeYears < TW3_MENARCHE_AGE_MAX_YEARS
  );
}

function findAgeBand<T extends Tw3AgeBand>(
  bands: T[],
  chronologicalAgeYears: number,
): T {
  const band = bands.find(
    (row) =>
      chronologicalAgeYears >= row.ageMinYears &&
      chronologicalAgeYears < row.ageMaxYears,
  );
  if (!band) {
    throw new Error(
      `No TW3 coefficient band for chronological age ${chronologicalAgeYears.toFixed(2)} y.`,
    );
  }
  return band;
}

function selectGirlChart(
  chronologicalAgeYears: number,
  menarchalStatus: Tw3MenarchalStatus | null | undefined,
): Tw3GirlChart {
  if (chronologicalAgeYears < TW3_MENARCHE_AGE_MIN_YEARS) {
    return "childhood";
  }
  if (chronologicalAgeYears >= TW3_MENARCHE_AGE_MAX_YEARS) {
    return "late";
  }
  if (menarchalStatus === "pre") return "premenarche";
  if (menarchalStatus === "post") return "postmenarche";
  throw new Error(
    "Menarchal status (pre- or post-menarche) is required for girls aged 11–14 y in the TW3 method.",
  );
}

export function lookupTw3Coefficients(
  input: Pick<
    Tw3PredictedHeightInput,
    | "sex"
    | "chronologicalAgeYears"
    | "menarchalStatus"
    | "maleBands"
    | "femaleBands"
  >,
): Tw3AgeBand & { chart?: Tw3GirlChart } {
  if (input.sex === "male") {
    return findAgeBand(input.maleBands, input.chronologicalAgeYears);
  }

  const chart = selectGirlChart(
    input.chronologicalAgeYears,
    input.menarchalStatus,
  );
  const eligible = input.femaleBands.filter((row) => row.chart === chart);
  const band = findAgeBand(eligible, input.chronologicalAgeYears);
  return { ...band, chart };
}

export function calculateTw3PredictedHeight(
  input: Tw3PredictedHeightInput,
): CalculatorResult<number> {
  const ageMax =
    input.sex === "male" ? TW3_BOYS_AGE_MAX_YEARS : TW3_GIRLS_AGE_MAX_YEARS;

  if (
    input.chronologicalAgeYears < TW3_AGE_MIN_YEARS ||
    input.chronologicalAgeYears >= ageMax
  ) {
    throw new Error(
      `TW3 method is validated for ages ${TW3_AGE_MIN_YEARS}–${ageMax} years (${input.sex === "male" ? "boys" : "girls"}).`,
    );
  }

  const coeffs = lookupTw3Coefficients(input);

  const basePredicted =
    coeffs.constant +
    coeffs.betaHeight * input.heightCm +
    coeffs.betaChronAge * input.chronologicalAgeYears +
    coeffs.betaBoneAge * input.boneAgeYears;

  const mphMean = input.mphPopulationMeanCm ?? TW3_MPH_POPULATION_MEAN_CM;
  const applyMph =
    input.applyMphAdjustment === true &&
    input.midParentalHeightCm !== undefined &&
    !Number.isNaN(input.midParentalHeightCm);

  const mphAdjustmentCm = applyMph
    ? (input.midParentalHeightCm! - mphMean) / 3
    : 0;

  const predicted = basePredicted + mphAdjustmentCm;

  const ageBandLabel =
    input.sex === "female" && "chart" in coeffs && coeffs.chart
      ? `${coeffs.chart} chart, `
      : "";

  const menarcheNote =
    input.sex === "female" &&
    tw3MenarchalStatusRequired(input.sex, input.chronologicalAgeYears)
      ? `; ${input.menarchalStatus === "post" ? "post" : "pre"}-menarche coefficients`
      : "";

  const mphNote = applyMph
    ? `; MPH adjustment +${mphAdjustmentCm.toFixed(1)} cm (MPH ${input.midParentalHeightCm!.toFixed(1)} cm, mean ${mphMean} cm)`
    : "";

  return {
    value: predicted,
    interpretation: `TW3 predicted adult height: ${predicted.toFixed(1)} cm (${ageBandLabel}coefficients at CA ${input.chronologicalAgeYears.toFixed(2)} y, RUS bone age ${input.boneAgeYears.toFixed(2)} y${menarcheNote}${mphNote}).`,
    warning:
      input.sex === "female" &&
      coeffs.chart === "postmenarche" &&
      input.chronologicalAgeYears >= 11 &&
      input.chronologicalAgeYears < 11.5
        ? "Post-menarche residual SD and r at age 11.0–11.5 y are estimated in the original publication."
        : undefined,
  };
}
