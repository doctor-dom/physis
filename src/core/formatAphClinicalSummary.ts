import {
  formatDecimalYears,
  splitDecimalYearsToYearsMonths,
} from "./ageUnits";
import {
  HEIGHT_PREDICTION_METHOD_LABELS,
  type HeightPredictionMethod,
} from "../hooks/useAdultHeightPredictions";

export const APH_METHOD_CITATIONS: Record<HeightPredictionMethod, string> = {
  "adjusted-rwt":
    "Khamis HJ, Guo S. Improvement in the Roche-Wainer-Thissen stature prediction model: A comparative study. Am J Hum Biol. 1993;5(6):669-679. doi: 10.1002/ajhb.1310050609. PMID: 28548358.",
  tw3:
    "Tanner JM, Whitehouse RH, Marshall WA, Carter BS. Prediction of adult height from height, bone age, and occurrence of menarche, at ages 4 to 16 with allowance for midparent height. Arch Dis Child. 1975 Jan;50(1):14-26. doi: 10.1136/adc.50.1.14. PMID: 164838; PMCID: PMC1544488.",
  "khamis-roche":
    "Harry J. Khamis, Alex F. Roche; Predicting Adult Stature Without Using Skeletal Age: The Khamis-Roche Method. Pediatrics October 1994; 94 (4): 504–507. 10.1542/peds.94.4.504",
};

export function formatYearsMonthsLabel(decimalYears: number): string {
  const { years, months } = splitDecimalYearsToYearsMonths(decimalYears);
  if (years === 0) {
    return months === 1 ? "1 month" : `${months} months`;
  }
  if (months === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  }
  const yearLabel = years === 1 ? "1 year" : `${years} years`;
  const monthLabel = months === 1 ? "1 month" : `${months} months`;
  return `${yearLabel}, ${monthLabel}`;
}

export function formatBoneAgeLabel(decimalYears: number): string {
  return `${formatDecimalYears(decimalYears, 2)} years (${formatYearsMonthsLabel(decimalYears)})`;
}

export function formatBoneAgeWithTw3Sms(
  boneAgeYears: number,
  tw3SmsScore?: number | null,
): string {
  const base = formatBoneAgeLabel(boneAgeYears);
  if (tw3SmsScore != null) {
    return `${base} (via TW3, SMS: ${tw3SmsScore})`;
  }
  return base;
}

export interface AphClinicalSummaryInput {
  chronAgeYears: number;
  boneAgeYears: number | null;
  mphCm: number;
  aphCm: number;
  method: HeightPredictionMethod;
  tw3SmsScore?: number | null;
}

export function buildAphClinicalSummary(input: AphClinicalSummaryInput): string {
  const ca = formatYearsMonthsLabel(input.chronAgeYears);
  const ba =
    input.boneAgeYears !== null && !Number.isNaN(input.boneAgeYears)
      ? formatBoneAgeWithTw3Sms(input.boneAgeYears, input.tw3SmsScore)
      : "N/A";
  const mph = `${input.mphCm.toFixed(1)} cm`;
  const aph = `${input.aphCm.toFixed(1)} cm`;
  const methodLabel = HEIGHT_PREDICTION_METHOD_LABELS[input.method];
  const citation = APH_METHOD_CITATIONS[input.method];

  return `CA: ${ca} BA: ${ba} MPH: ${mph} APH: ${aph} (${methodLabel})\nCitation: ${citation}`;
}
