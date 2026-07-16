import { linearInterpolate } from "../../interpolation";
import type { CalculatorResult, Sex } from "../../types";
import type { SmsBoneAgePoint } from "../../../data/tw3/smsToBoneAge";
import type { Tw3SmsScoreTable } from "../../../data/tw3/smsScores";
import type { Tw3LandmarkId, Tw3MaturityRating } from "./types";
import { TW3_RUS_LANDMARKS } from "./types";

export interface Tw3BoneAgeInput {
  sex: Sex;
  landmarkRatings: Partial<Record<Tw3LandmarkId, Tw3MaturityRating>>;
  smsScores: Tw3SmsScoreTable;
  smsToBoneAgeChart: SmsBoneAgePoint[];
}

export interface Tw3BoneAgeOutput {
  skeletalMaturityScore: number;
  boneAgeYears: number;
  completedLandmarks: number;
  landmarkScores: Partial<Record<Tw3LandmarkId, number>>;
}

export function smsToBoneAgeYears(
  sms: number,
  chart: SmsBoneAgePoint[],
): number {
  if (chart.length === 0) {
    throw new Error("SMS-to-bone-age chart is empty.");
  }
  return linearInterpolate(
    chart.map((row) => ({ x: row.sms, y: row.boneAgeYears })),
    sms,
    true,
  );
}

/**
 * Sum RUS landmark maturity ratings into SMS, then convert to bone age
 * via sex-specific tabulated chart with linear interpolation.
 */
export function calculateTw3BoneAge(
  input: Tw3BoneAgeInput,
): CalculatorResult<Tw3BoneAgeOutput> {
  let sms = 0;
  let completedLandmarks = 0;
  const landmarkScores: Partial<Record<Tw3LandmarkId, number>> = {};

  for (const landmark of TW3_RUS_LANDMARKS) {
    const rating = input.landmarkRatings[landmark.id];
    if (!rating) continue;

    const score = input.smsScores[landmark.id]?.[rating];
    if (score === undefined) {
      throw new Error(`No SMS score for ${landmark.label} rating ${rating}.`);
    }

    landmarkScores[landmark.id] = score;
    sms += score;
    completedLandmarks += 1;
  }

  if (completedLandmarks === 0) {
    throw new Error("Assign a maturity rating (A–I) for at least one RUS landmark.");
  }

  const boneAge = smsToBoneAgeYears(sms, input.smsToBoneAgeChart);

  return {
    value: {
      skeletalMaturityScore: sms,
      boneAgeYears: boneAge,
      completedLandmarks,
      landmarkScores,
    },
    interpretation: `TW3 RUS bone age (${input.sex === "male" ? "boys" : "girls"}; Table ${input.sex === "male" ? "A1" : "A3"}): ${boneAge.toFixed(2)} years (SMS ${sms}; letter points from Table ${input.sex === "male" ? "A5" : "A6"}).`,
    warning:
      completedLandmarks < TW3_RUS_LANDMARKS.length
        ? `${TW3_RUS_LANDMARKS.length - completedLandmarks} landmark(s) not scored — score all 13 for full RUS SMS.`
        : undefined,
  };
}

export function getAvailableRatings(
  smsScores: Tw3SmsScoreTable,
  landmarkId: Tw3LandmarkId,
): Tw3MaturityRating[] {
  const table = smsScores[landmarkId];
  if (!table) return [];
  return (Object.keys(table) as Tw3MaturityRating[]).sort();
}
