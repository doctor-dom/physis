/**
 * Roche–Wainer–Thissen (RWT) adult height prediction.
 * PAH = β₀ + β₁·height + β₂·weight + β₃·MPH + β₄·bone age
 * Coefficients are interpolated by chronological age from tabulated charts.
 */

import { interpolateByAge } from "../../interpolation";
import type { CalculatorResult, Sex } from "../../types";

export type RwtEquationVariant = "original" | "adjusted";

export interface RwtCoefficientSet {
  beta0: number;
  betaHeight: number;
  betaWeight: number;
  betaMph: number;
  betaBoneAge: number;
}

export interface RwtAgeCoefficientChart {
  ageYears: number;
  coefficients: RwtCoefficientSet;
}

export interface RwtPredictedHeightInput {
  variant: RwtEquationVariant;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  midParentalHeightCm: number;
  boneAgeYears: number;
  chronologicalAgeYears: number;
  maleCharts: RwtAgeCoefficientChart[];
  femaleCharts: RwtAgeCoefficientChart[];
  /** Overrides default interpretation label (e.g. "TW3 method" vs "Adjusted RWT"). */
  methodLabel?: string;
  /** Label for parental term in interpretation (e.g. "MPH" or "MPS"). */
  parentalStatureLabel?: string;
}

export function interpolateRwtCoefficients(
  charts: RwtAgeCoefficientChart[],
  ageYears: number,
): RwtCoefficientSet {
  const keys: (keyof RwtCoefficientSet)[] = [
    "beta0",
    "betaHeight",
    "betaWeight",
    "betaMph",
    "betaBoneAge",
  ];

  const result: RwtCoefficientSet = {
    beta0: 0,
    betaHeight: 0,
    betaWeight: 0,
    betaMph: 0,
    betaBoneAge: 0,
  };

  for (const key of keys) {
    const series = charts.map((row) => ({
      ageYears: row.ageYears,
      value: row.coefficients[key],
    }));
    result[key] = interpolateByAge(series, ageYears);
  }

  return result;
}

/**
 * Predicted adult height (cm) from RWT with age-interpolated coefficients.
 */
export function calculateRwtPredictedHeight(
  input: RwtPredictedHeightInput,
): CalculatorResult<number> {
  const charts = input.sex === "male" ? input.maleCharts : input.femaleCharts;
  const coeffs = interpolateRwtCoefficients(charts, input.chronologicalAgeYears);

  const predicted =
    coeffs.beta0 +
    coeffs.betaHeight * input.heightCm +
    coeffs.betaWeight * input.weightKg +
    coeffs.betaMph * input.midParentalHeightCm +
    coeffs.betaBoneAge * input.boneAgeYears;

  const methodLabel =
    input.methodLabel ?? (input.variant === "adjusted" ? "Adjusted RWT" : "Original RWT");
  const parentalLabel = input.parentalStatureLabel ?? "MPH";

  const warnings: string[] = [];
  if (charts.length === 0) {
    warnings.push("Coefficient chart is empty — run npm run import:data.");
  } else {
    const minAge = charts[0].ageYears;
    const maxAge = charts[charts.length - 1].ageYears;
    if (
      input.chronologicalAgeYears < minAge ||
      input.chronologicalAgeYears > maxAge
    ) {
      warnings.push(
        `${methodLabel} coefficient tables cover ${minAge.toFixed(1)}–${maxAge.toFixed(1)} y; chronological age ${input.chronologicalAgeYears.toFixed(2)} y is outside that range — endpoint coefficients were used.`,
      );
    }
  }

  return {
    value: predicted,
    interpretation: `${methodLabel} predicted adult height: ${predicted.toFixed(1)} cm (${parentalLabel} ${input.midParentalHeightCm.toFixed(1)} cm; coefficients at chronological age ${input.chronologicalAgeYears.toFixed(2)} y).`,
    warning: warnings.length > 0 ? warnings.join(" ") : undefined,
  };
}
