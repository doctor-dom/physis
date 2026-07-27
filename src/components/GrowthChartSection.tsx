import GrowthChartPlot from "./cdc/GrowthChartPlot";
import { ResultCard } from "./FormFields";
import CopyClinicalSummaryButton from "./CopyClinicalSummaryButton";
import { buildAphClinicalSummary } from "@core/formatAphClinicalSummary";
import {
  getParentalTargetForMethod,
  getPredictionForMethod,
  HEIGHT_PREDICTION_METHOD_LABELS,
  type HeightPredictionMethod,
} from "../hooks/useAdultHeightPredictions";
import type { AdultHeightPredictions } from "../hooks/useAdultHeightPredictions";
import type { Sex } from "@core/types";

export interface GrowthChartSectionProps {
  sex: Sex;
  chronAgeYears: string;
  boneAgeYears: string;
  tw3SmsScore?: number | null;
  heightCm: string;
  weightKg: string;
  method: HeightPredictionMethod;
  predictions: AdultHeightPredictions;
  onBackToPrediction: () => void;
  onShowWork: () => void;
}

export default function GrowthChartSection({
  sex,
  chronAgeYears,
  boneAgeYears,
  tw3SmsScore,
  heightCm,
  weightKg,
  method,
  predictions,
  onBackToPrediction,
  onShowWork,
}: GrowthChartSectionProps) {
  const chronAge = parseFloat(chronAgeYears);
  const boneAge = parseFloat(boneAgeYears);
  const height = parseFloat(heightCm);
  const weight = parseFloat(weightKg);

  const prediction = getPredictionForMethod(predictions, method);
  const parentalTarget = getParentalTargetForMethod(predictions, method);

  const predictedAdultHeightCm =
    prediction && !("error" in prediction) ? prediction.value : null;

  const inputsValid =
    parentalTarget &&
    predictedAdultHeightCm !== null &&
    !Number.isNaN(chronAge) &&
    !Number.isNaN(boneAge) &&
    !Number.isNaN(height) &&
    !Number.isNaN(weight) &&
    chronAge >= 2 &&
    chronAge <= 20;

  const clinicalSummary =
    prediction &&
    !("error" in prediction) &&
    predictions.parental &&
    !Number.isNaN(chronAge)
      ? buildAphClinicalSummary({
          chronAgeYears: chronAge,
          boneAgeYears: Number.isNaN(boneAge) ? null : boneAge,
          mphCm: predictions.parental.mphCm,
          aphCm: prediction.value,
          method,
          tw3SmsScore,
        })
      : null;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBackToPrediction}
        className="text-sm font-medium text-teal-700 hover:text-teal-900"
      >
        ← Back to height prediction
      </button>

      <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Selected method
        </p>
        <p className="mt-1 text-lg font-bold text-teal-900">
          {HEIGHT_PREDICTION_METHOD_LABELS[method]}
        </p>
        {prediction && "error" in prediction ? (
          <p className="mt-2 text-sm text-red-700">{prediction.error}</p>
        ) : prediction ? (
          <p className="mt-2 text-sm text-teal-800">
            Predicted adult height:{" "}
            <strong>{prediction.value.toFixed(1)} cm</strong>
          </p>
        ) : null}
      </div>

      <CopyClinicalSummaryButton summary={clinicalSummary} />

      {!inputsValid ? (
        <ResultCard
          title="Cannot plot growth chart"
          error="Chronological age must be 2–20 years with valid height, weight, bone age, and parental heights."
        />
      ) : (
        <GrowthChartPlot
          sex={sex}
          onShowWork={onShowWork}
          data={{
            chronAgeYears: chronAge,
            boneAgeYears: boneAge,
            heightCm: height,
            weightKg: weight,
            mphCm: predictions.parental!.mphCm,
            mpsCm: predictions.parental!.mpsCm,
            parentalStatureUsedInCalculation: parentalTarget.label,
            predictedAdultHeightCm: predictedAdultHeightCm,
            methodLabel: HEIGHT_PREDICTION_METHOD_LABELS[method],
          }}
        />
      )}
    </div>
  );
}
