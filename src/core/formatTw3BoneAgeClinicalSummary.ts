import {
  formatBoneAgeWithTw3Sms,
  formatYearsMonthsLabel,
} from "./formatAphClinicalSummary";

export const TW3_BONE_AGE_CITATION =
  "Tanner JM, Healy MJ, Goldstein H, Cameron N. Assessment of Skeletal Maturity and Prediction of Adult Height (TW3 Method). 3rd ed. London: WB Saunders; 2001.";

export interface Tw3BoneAgeClinicalSummaryInput {
  chronAgeYears: number;
  boneAgeYears: number;
  skeletalMaturityScore: number;
}

export function buildTw3BoneAgeClinicalSummary(
  input: Tw3BoneAgeClinicalSummaryInput,
): string {
  const ca = formatYearsMonthsLabel(input.chronAgeYears);
  const ba = formatBoneAgeWithTw3Sms(
    input.boneAgeYears,
    input.skeletalMaturityScore,
  );
  return `CA: ${ca} BA: ${ba}\nCitation: ${TW3_BONE_AGE_CITATION}`;
}
