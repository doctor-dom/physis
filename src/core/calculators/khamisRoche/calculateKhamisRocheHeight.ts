/**
 * Khamis-Roche adult height prediction (no bone age).
 * PAH (in) = β₀ + β₁·height(in) + β₂·weight(lb) + β₃·MPS(in)
 * Coefficients from Khamis & Roche, Pediatrics 1994 erratum.
 */

import { interpolateByAge } from "../../interpolation";
import { CM_PER_INCH, KG_PER_LB } from "../../units";
import type { CalculatorResult, Sex } from "../../types";

export interface KhamisRocheCoefficientSet {
  beta0: number;
  betaHeightIn: number;
  betaWeightLb: number;
  betaMpsIn: number;
}

export interface KhamisRocheAgeChart {
  ageYears: number;
  coefficients: KhamisRocheCoefficientSet;
}

export interface KhamisRochePredictedHeightInput {
  sex: Sex;
  chronologicalAgeYears: number;
  /** Standing height in cm */
  heightCm: number;
  weightKg: number;
  /** Mid-parental stature (average parental height) in cm */
  mpsCm: number;
  maleCharts: KhamisRocheAgeChart[];
  femaleCharts: KhamisRocheAgeChart[];
  ageMin?: number;
  ageMax?: number;
}

/** Published approximate standard errors (cm). */
export const KHAMIS_ROCHE_SE_CM: Record<Sex, number> = {
  male: 5.6,
  female: 4.3,
};

export function interpolateKhamisRocheCoefficients(
  charts: KhamisRocheAgeChart[],
  ageYears: number,
): KhamisRocheCoefficientSet {
  const keys: (keyof KhamisRocheCoefficientSet)[] = [
    "beta0",
    "betaHeightIn",
    "betaWeightLb",
    "betaMpsIn",
  ];
  const result = {} as KhamisRocheCoefficientSet;
  for (const key of keys) {
    const series = charts.map((row) => ({
      ageYears: row.ageYears,
      value: row.coefficients[key],
    }));
    result[key] = interpolateByAge(series, ageYears);
  }
  return result;
}

export function calculateKhamisRochePredictedHeight(
  input: KhamisRochePredictedHeightInput,
): CalculatorResult<number> {
  const ageMin = input.ageMin ?? 4;
  const ageMax = input.ageMax ?? 17.5;

  if (
    input.chronologicalAgeYears < ageMin ||
    input.chronologicalAgeYears > ageMax
  ) {
    throw new Error(
      `Khamis-Roche method is validated for ages ${ageMin}–${ageMax} years.`,
    );
  }

  const charts =
    input.sex === "male" ? input.maleCharts : input.femaleCharts;
  const coeffs = interpolateKhamisRocheCoefficients(
    charts,
    input.chronologicalAgeYears,
  );

  const heightIn = input.heightCm / CM_PER_INCH;
  const weightLb = input.weightKg / KG_PER_LB;
  const mpsIn = input.mpsCm / CM_PER_INCH;

  const predictedIn =
    coeffs.beta0 +
    coeffs.betaHeightIn * heightIn +
    coeffs.betaWeightLb * weightLb +
    coeffs.betaMpsIn * mpsIn;

  const predictedCm = predictedIn * CM_PER_INCH;
  const se = KHAMIS_ROCHE_SE_CM[input.sex];

  return {
    value: predictedCm,
    interpretation: `Khamis-Roche predicted adult height: ${predictedCm.toFixed(1)} cm (MPS ${input.mpsCm.toFixed(1)} cm; standing height; approximate SE ±${se} cm).`,
  };
}
