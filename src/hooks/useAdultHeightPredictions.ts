import { useMemo } from "react";
import {
  resolveParentalStature,
  type ParentalInputMode,
  type ResolvedParentalStature,
} from "@core/calculators/parentalStature";
import { calculateRwtPredictedHeight } from "@core/calculators/rwt/calculateRwtHeight";
import {
  heightForAdjustedRwt,
} from "@core/calculators/rwt/supineHeight";
import { calculateKhamisRochePredictedHeight } from "@core/calculators/khamisRoche/calculateKhamisRocheHeight";
import {
  calculateTw3PredictedHeight,
  tw3MenarchalStatusRequired,
  type Tw3MenarchalStatus,
} from "@core/calculators/tw3/calculateTw3PredictedHeight";
import { rwtCoefficients } from "../data/rwt/coefficients";
import { tw3AphCoefficients } from "../data/tw3/aphCoefficients";
import {
  khamisRocheCoefficients,
  KHAMIS_ROCHE_AGE_MIN,
  KHAMIS_ROCHE_AGE_MAX,
} from "../data/khamisRoche/coefficients";
import type { Sex } from "@core/types";

export type HeightPredictionMethod = "tw3" | "adjusted-rwt" | "khamis-roche";

export interface HeightPredictionInputs {
  sex: Sex;
  parentalInputMode: ParentalInputMode;
  fatherCm: string;
  motherCm: string;
  mphDirectCm: string;
  heightCm: string;
  weightKg: string;
  chronAgeYears: string;
  boneAgeYears: string;
  heightIsStandingVertical: boolean;
  /** Required for TW3 girls aged 11–14 y */
  menarchalStatus?: Tw3MenarchalStatus | null;
  /** Apply Tanner 1975 MPH adjustment to TW3 PAH (default true) */
  tw3ApplyMphAdjustment?: boolean;
}

type PredictionSuccess = {
  value: number;
  interpretation?: string;
  warning?: string;
  adjustmentAppliedCm?: number;
  adjustedHeightCm?: number;
};

type PredictionResult = PredictionSuccess | { error: string } | null;

export interface AdultHeightPredictions {
  parental: ResolvedParentalStature | null;
  tw3Result: PredictionResult;
  rwtResult: PredictionResult;
  krResult: PredictionResult;
}

export function useAdultHeightPredictions(
  inputs: HeightPredictionInputs,
): AdultHeightPredictions {
  const {
    sex,
    parentalInputMode,
    fatherCm,
    motherCm,
    mphDirectCm,
    heightCm,
    weightKg,
    chronAgeYears,
    boneAgeYears,
    heightIsStandingVertical,
    menarchalStatus = null,
    tw3ApplyMphAdjustment = false,
  } = inputs;

  const parental = useMemo(() => {
    return resolveParentalStature({
      mode: parentalInputMode,
      fatherCm,
      motherCm,
      mphDirectCm,
      sex,
    });
  }, [parentalInputMode, fatherCm, motherCm, mphDirectCm, sex]);

  const tw3Result = useMemo(() => {
    const height = parseFloat(heightCm);
    const boneAge = parseFloat(boneAgeYears);
    const chronAge = parseFloat(chronAgeYears);
    if (!parental || [height, boneAge, chronAge].some((v) => Number.isNaN(v))) {
      return null;
    }
    if (
      tw3MenarchalStatusRequired(sex, chronAge) &&
      menarchalStatus !== "pre" &&
      menarchalStatus !== "post"
    ) {
      return {
        error:
          "Select pre-menarche or post-menarche for TW3 adult height prediction (girls aged 11–14 y).",
      };
    }
    try {
      return calculateTw3PredictedHeight({
        sex,
        heightCm: height,
        chronologicalAgeYears: chronAge,
        boneAgeYears: boneAge,
        menarchalStatus,
        midParentalHeightCm: parental.mphCm,
        applyMphAdjustment: tw3ApplyMphAdjustment,
        maleBands: tw3AphCoefficients.male,
        femaleBands: tw3AphCoefficients.female,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [
    parental,
    heightCm,
    boneAgeYears,
    chronAgeYears,
    sex,
    menarchalStatus,
    tw3ApplyMphAdjustment,
  ]);

  const rwtResult = useMemo(() => {
    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);
    const boneAge = parseFloat(boneAgeYears);
    const chronAge = parseFloat(chronAgeYears);
    if (!parental || [height, weight, boneAge, chronAge].some((v) => Number.isNaN(v))) {
      return null;
    }
    const { adjustedHeightCm, adjustmentAppliedCm } = heightForAdjustedRwt(
      height,
      heightIsStandingVertical,
    );
    try {
      const result = calculateRwtPredictedHeight({
        variant: "adjusted",
        sex,
        heightCm: adjustedHeightCm,
        weightKg: weight,
        midParentalHeightCm: parental.mpsCm,
        boneAgeYears: boneAge,
        chronologicalAgeYears: chronAge,
        maleCharts: rwtCoefficients.male.adjusted,
        femaleCharts: rwtCoefficients.female.adjusted,
        methodLabel: "Adjusted RWT",
        parentalStatureLabel: "MPS",
      });
      return {
        ...result,
        adjustmentAppliedCm,
        adjustedHeightCm,
      };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [
    parental,
    heightCm,
    weightKg,
    boneAgeYears,
    chronAgeYears,
    sex,
    heightIsStandingVertical,
  ]);

  const krResult = useMemo(() => {
    const height = parseFloat(heightCm);
    const weight = parseFloat(weightKg);
    const chronAge = parseFloat(chronAgeYears);
    if (!parental || [height, weight, chronAge].some((v) => Number.isNaN(v))) {
      return null;
    }
    try {
      return calculateKhamisRochePredictedHeight({
        sex,
        chronologicalAgeYears: chronAge,
        heightCm: height,
        weightKg: weight,
        mpsCm: parental.mpsCm,
        maleCharts: khamisRocheCoefficients.male,
        femaleCharts: khamisRocheCoefficients.female,
        ageMin: KHAMIS_ROCHE_AGE_MIN,
        ageMax: KHAMIS_ROCHE_AGE_MAX,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [parental, heightCm, weightKg, chronAgeYears, sex]);

  return { parental, tw3Result, rwtResult, krResult };
}

export function getPredictionForMethod(
  predictions: AdultHeightPredictions,
  method: HeightPredictionMethod,
): PredictionResult {
  switch (method) {
    case "tw3":
      return predictions.tw3Result;
    case "adjusted-rwt":
      return predictions.rwtResult;
    case "khamis-roche":
      return predictions.krResult;
  }
}

export function getParentalTargetForMethod(
  predictions: AdultHeightPredictions,
  method: HeightPredictionMethod,
): { label: "MPH" | "MPS"; cm: number } | null {
  if (!predictions.parental) return null;
  if (method === "tw3") {
    return { label: "MPH", cm: predictions.parental.mphCm };
  }
  return { label: "MPS", cm: predictions.parental.mpsCm };
}

export const HEIGHT_PREDICTION_METHOD_LABELS: Record<
  HeightPredictionMethod,
  string
> = {
  tw3: "TW3 method",
  "adjusted-rwt": "Adjusted RWT",
  "khamis-roche": "Khamis-Roche",
};

export { KHAMIS_ROCHE_AGE_MIN, KHAMIS_ROCHE_AGE_MAX };
export type { ParentalInputMode, Tw3MenarchalStatus };
export { tw3MenarchalStatusRequired };
