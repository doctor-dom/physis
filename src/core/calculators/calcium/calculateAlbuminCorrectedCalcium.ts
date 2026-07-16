import type { CalculatorResult } from "../../types";

export const DEFAULT_ALBUMIN_BASELINE_G_DL = 4.0;

export interface AlbuminCorrectedCalciumInput {
  /** Measured total serum calcium (mg/dL). */
  serumCalciumMgDl: number;
  /** Patient serum albumin (g/dL). */
  patientAlbuminGdl: number;
  /** Normal/reference albumin (g/dL); defaults to 4.0. */
  albuminBaselineGdl?: number;
}

export interface AlbuminCorrectedCalciumResult {
  serumCalciumMgDl: number;
  patientAlbuminGdl: number;
  albuminBaselineGdl: number;
  albuminContributionMgDl: number;
  correctedCalciumMgDl: number;
}

/**
 * Corrected calcium for albumin: cCa = 0.8 × (normal albumin − patient albumin) + sCa.
 */
export function calculateAlbuminCorrectedCalcium(
  input: AlbuminCorrectedCalciumInput,
): CalculatorResult<AlbuminCorrectedCalciumResult> {
  const {
    serumCalciumMgDl,
    patientAlbuminGdl,
    albuminBaselineGdl = DEFAULT_ALBUMIN_BASELINE_G_DL,
  } = input;

  if (serumCalciumMgDl <= 0) {
    throw new Error("Enter a valid serum calcium.");
  }
  if (patientAlbuminGdl < 0) {
    throw new Error("Enter a valid patient albumin.");
  }
  if (albuminBaselineGdl <= 0) {
    throw new Error("Normal albumin baseline must be greater than zero.");
  }

  const albuminContributionMgDl =
    0.8 * (albuminBaselineGdl - patientAlbuminGdl);
  const correctedCalciumMgDl = albuminContributionMgDl + serumCalciumMgDl;

  const interpretation =
    albuminContributionMgDl === 0
      ? "Patient albumin equals the reference baseline — corrected calcium equals measured calcium."
      : `Albumin adjustment ${albuminContributionMgDl >= 0 ? "adds" : "subtracts"} ${Math.abs(albuminContributionMgDl).toFixed(1)} mg/dL to measured calcium.`;

  return {
    value: {
      serumCalciumMgDl,
      patientAlbuminGdl,
      albuminBaselineGdl,
      albuminContributionMgDl,
      correctedCalciumMgDl,
    },
    interpretation,
  };
}
