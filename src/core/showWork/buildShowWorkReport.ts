import { resolveParentalStature } from "../calculators/parentalStature";
import {
  calculateTw3BoneAge,
  smsToBoneAgeYears,
} from "../calculators/tw3/calculateTw3BoneAge";
import {
  lookupTw3Coefficients,
  TW3_MPH_POPULATION_MEAN_CM,
  tw3MenarchalStatusRequired,
} from "../calculators/tw3/calculateTw3PredictedHeight";
import {
  interpolateKhamisRocheCoefficients,
  KHAMIS_ROCHE_SE_CM,
} from "../calculators/khamisRoche/calculateKhamisRocheHeight";
import {
  interpolateRwtCoefficients,
  type RwtAgeCoefficientChart,
} from "../calculators/rwt/calculateRwtHeight";
import {
  heightForAdjustedRwt,
  RWT_SUPINE_HEIGHT_ADJUSTMENT_CM,
} from "../calculators/rwt/supineHeight";
import { TW3_RUS_LANDMARKS } from "../calculators/tw3/types";
import { linearInterpolate } from "../interpolation";
import { CM_PER_INCH, KG_PER_LB } from "../units";
import { TW3_REFERENCE_CHARTS, getTw3ReferenceChartsForSex } from "../../data/tw3/atlasManifest";
import { getTw3SmsScores } from "../../data/tw3/smsScores";
import { getTw3SmsToBoneAgeChart } from "../../data/tw3/smsToBoneAge";
import { tw3AphCoefficients } from "../../data/tw3/aphCoefficients";
import { rwtCoefficients } from "../../data/rwt/coefficients";
import {
  khamisRocheCoefficients,
  KHAMIS_ROCHE_AGE_MAX,
  KHAMIS_ROCHE_AGE_MIN,
} from "../../data/khamisRoche/coefficients";
import {
  HEIGHT_PREDICTION_METHOD_LABELS,
} from "../../hooks/useAdultHeightPredictions";
import type {
  InterpolationBracket,
  PredictionWorkSection,
  QcIssue,
  ShowWorkInput,
  ShowWorkReport,
  Tw3WorkSection,
} from "./types";

const HEIGHT_TOLERANCE_CM = 0.15;
const BONE_AGE_TOLERANCE_Y = 0.02;

function fmt(n: number, digits = 2): string {
  return n.toFixed(digits);
}

function describeInterpolation(
  points: { x: number; y: number }[],
  targetX: number,
  xLabel: string,
  yLabel: string,
): InterpolationBracket {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const result = linearInterpolate(sorted, targetX, true);

  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (targetX >= sorted[i].x && targetX <= sorted[i + 1].x) {
      lower = sorted[i];
      upper = sorted[i].x === sorted[i + 1].x ? sorted[i] : sorted[i + 1];
      break;
    }
  }
  if (targetX <= sorted[0].x) {
    lower = sorted[0];
    upper = sorted[Math.min(1, sorted.length - 1)];
  } else if (targetX >= sorted[sorted.length - 1].x) {
    lower = sorted[Math.max(0, sorted.length - 2)];
    upper = sorted[sorted.length - 1];
  }

  const denom = upper.x - lower.x;
  const formula =
    denom === 0
      ? `${yLabel} = ${fmt(lower.y)} (exact tabulated ${xLabel})`
      : `${yLabel} = ${fmt(lower.y)} + (${fmt(targetX)} − ${fmt(lower.x)}) / (${fmt(upper.x)} − ${fmt(lower.x)}) × (${fmt(upper.y)} − ${fmt(lower.y)}) = ${fmt(result)}`;

  return {
    lower: { x: lower.x, y: lower.y },
    upper: { x: upper.x, y: upper.y },
    target: targetX,
    result,
    formula,
  };
}

function describeCoefficientInterpolation(
  charts: { ageYears: number; coefficients: object }[],
  ageYears: number,
  key: string,
  label: string,
): InterpolationBracket {
  const series = charts.map((row) => ({
    x: row.ageYears,
    y: (row.coefficients as Record<string, number>)[key] ?? 0,
  }));
  return describeInterpolation(series, ageYears, "age (y)", label);
}

function describeAgeCoefficientInterpolation(
  charts: RwtAgeCoefficientChart[],
  ageYears: number,
  key: keyof RwtAgeCoefficientChart["coefficients"],
  label: string,
): InterpolationBracket {
  return describeCoefficientInterpolation(charts, ageYears, key, label);
}

function nearbyCoefficientRows(
  charts: { ageYears: number; coefficients: object }[],
  ageYears: number,
  window = 2,
): { ageYears: number; coefficients: Record<string, number> }[] {
  const sorted = [...charts].sort((a, b) => a.ageYears - b.ageYears);
  let centerIdx = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].ageYears <= ageYears) centerIdx = i;
  }
  const start = Math.max(0, centerIdx - window);
  const end = Math.min(sorted.length, centerIdx + window + 1);
  return sorted.slice(start, end).map((row) => ({
    ageYears: row.ageYears,
    coefficients: row.coefficients as Record<string, number>,
  }));
}

function buildTw3Section(
  input: ShowWorkInput,
  issues: QcIssue[],
): Tw3WorkSection | null {
  const ratingCount = Object.keys(input.ratings).length;
  if (ratingCount === 0 && !input.boneAgeFromTw3) {
    return null;
  }

  const smsScores = getTw3SmsScores(input.sex);
  const smsChart = getTw3SmsToBoneAgeChart(input.sex);
  const enteredBoneAge = parseFloat(input.boneAgeYears);

  try {
    const result = calculateTw3BoneAge({
      sex: input.sex,
      landmarkRatings: input.ratings,
      smsScores,
      smsToBoneAgeChart: smsChart,
    });

    const landmarkRows = TW3_RUS_LANDMARKS.filter(
      (l) => input.ratings[l.id] !== undefined,
    ).map((landmark) => {
      const rating = input.ratings[landmark.id]!;
      const smsPoints = result.value.landmarkScores[landmark.id]!;
      return {
        landmarkId: landmark.id,
        label: landmark.label,
        rating,
        smsPoints,
      };
    });

    const smsTotal = result.value.skeletalMaturityScore;
    const boneAgeFromSms = result.value.boneAgeYears;
    const smsInterpolation = describeInterpolation(
      smsChart.map((row) => ({ x: row.sms, y: row.boneAgeYears })),
      smsTotal,
      "SMS",
      "bone age (y)",
    );

    if (input.boneAgeFromTw3) {
      if (result.value.completedLandmarks < TW3_RUS_LANDMARKS.length) {
        issues.push({
          id: "tw3-incomplete-landmarks",
          severity: "error",
          message: `TW3 workflow used but only ${result.value.completedLandmarks}/${TW3_RUS_LANDMARKS.length} RUS landmarks are scored.`,
          troubleshooting:
            "Full RUS SMS requires all 13 landmarks. Partial scoring yields an incomplete SMS.",
          suggestedFix: "Return to TW3 scoring and assign a stage to every landmark.",
        });
      }

      if (!Number.isNaN(enteredBoneAge)) {
        const delta = Math.abs(boneAgeFromSms - enteredBoneAge);
        if (delta > BONE_AGE_TOLERANCE_Y) {
          issues.push({
            id: "bone-age-mismatch",
            severity: "error",
            message: `Entered bone age (${fmt(enteredBoneAge)} y) differs from TW3-derived bone age (${fmt(boneAgeFromSms)} y) by ${fmt(delta, 3)} y.`,
            troubleshooting:
              "Bone age may have been edited manually on the prediction page after TW3 calculation.",
            suggestedFix: `Set bone age to ${fmt(boneAgeFromSms)} years to match TW3 SMS lookup.`,
          });
        }
      }
    }

    if (result.warning) {
      issues.push({
        id: "tw3-partial-warning",
        severity: "warning",
        message: result.warning,
        troubleshooting: "Partial landmark scoring reduces SMS reliability.",
      });
    }

    return {
      landmarkRows,
      smsTotal,
      boneAgeFromSms,
      smsInterpolation,
      enteredBoneAgeYears: enteredBoneAge,
      completedLandmarks: result.value.completedLandmarks,
      totalLandmarks: TW3_RUS_LANDMARKS.length,
    };
  } catch (e) {
    issues.push({
      id: "tw3-calculation-error",
      severity: "error",
      message: (e as Error).message,
      troubleshooting: "Verify each scored landmark uses a valid maturity stage for this sex.",
      suggestedFix: "Re-score invalid landmarks or clear TW3 ratings and enter bone age manually.",
    });
    return null;
  }
}

function buildTw3PredictionSection(
  input: ShowWorkInput,
  parentalMph: number,
  heightCm: number,
): PredictionWorkSection {
  const chronAge = parseFloat(input.chronAgeYears);
  const boneAge = parseFloat(input.boneAgeYears);

  const coeffs = lookupTw3Coefficients({
    sex: input.sex,
    chronologicalAgeYears: chronAge,
    menarchalStatus: input.menarchalStatus,
    maleBands: tw3AphCoefficients.male,
    femaleBands: tw3AphCoefficients.female,
  });

  const terms = [
    {
      name: "Height",
      symbol: "height",
      value: heightCm,
      coefficient: coeffs.betaHeight,
      product: coeffs.betaHeight * heightCm,
    },
    {
      name: "Chronological age",
      symbol: "CA",
      value: chronAge,
      coefficient: coeffs.betaChronAge,
      product: coeffs.betaChronAge * chronAge,
    },
    {
      name: "RUS bone age",
      symbol: "RUS BA",
      value: boneAge,
      coefficient: coeffs.betaBoneAge,
      product: coeffs.betaBoneAge * boneAge,
    },
  ];

  const basePredicted =
    coeffs.constant + terms.reduce((sum, term) => sum + term.product, 0);

  const applyMph = input.tw3ApplyMphAdjustment === true;
  const mphAdjustment = applyMph
    ? (parentalMph - TW3_MPH_POPULATION_MEAN_CM) / 3
    : 0;

  if (applyMph) {
    terms.push({
      name: "MPH adjustment",
      symbol: "⅓(MPH − mean)",
      value: parentalMph - TW3_MPH_POPULATION_MEAN_CM,
      coefficient: 1 / 3,
      product: mphAdjustment,
    });
  }

  const predictedCm = basePredicted + mphAdjustment;

  const chartNote =
    input.sex === "female" && "chart" in coeffs && coeffs.chart
      ? ` (${coeffs.chart} chart)`
      : "";

  return {
    method: "tw3",
    methodLabel: HEIGHT_PREDICTION_METHOD_LABELS.tw3,
    equation: `PAH = constant + β_height·height + β_CA·CA + β_BA·RUS bone age${applyMph ? " + ⅓·(MPH − 168 cm)" : ""}${chartNote}`,
    terms,
    intercept: coeffs.constant,
    predictedCm,
    displayedCm: input.displayedPredictionCm,
    chronAgeYears: chronAge,
    coefficientTableRows: [
      {
        ageYears: chronAge,
        coefficients: {
          betaHeight: coeffs.betaHeight,
          betaChronAge: coeffs.betaChronAge,
          betaBoneAge: coeffs.betaBoneAge,
          constant: coeffs.constant,
          residualSd: coeffs.residualSd,
          r: coeffs.r,
        },
      },
    ],
    heightUsedCm: heightCm,
  };
}

function buildRwtPredictionSection(
  input: ShowWorkInput,
  method: "adjusted-rwt" | "original-rwt",
  parentalMphOrMps: number,
  parentalLabel: "MPH" | "MPS",
  heightCm: number,
  heightAdjustmentCm: number | undefined,
): PredictionWorkSection {
  const chronAge = parseFloat(input.chronAgeYears);
  const weight = parseFloat(input.weightKg);
  const boneAge = parseFloat(input.boneAgeYears);
  const variant = method === "original-rwt" ? "original" : "adjusted";
  const charts =
    input.sex === "male"
      ? rwtCoefficients.male[variant]
      : rwtCoefficients.female[variant];

  const coeffs = interpolateRwtCoefficients(charts, chronAge);
  const coefficientInterpolation = (
    ["beta0", "betaHeight", "betaWeight", "betaMph", "betaBoneAge"] as const
  ).map((key) =>
    describeAgeCoefficientInterpolation(
      charts,
      chronAge,
      key,
      key,
    ),
  );

  const terms = [
    {
      name: "Height",
      symbol: "height",
      value: heightCm,
      coefficient: coeffs.betaHeight,
      product: coeffs.betaHeight * heightCm,
    },
    {
      name: "Weight",
      symbol: "weight",
      value: weight,
      coefficient: coeffs.betaWeight,
      product: coeffs.betaWeight * weight,
    },
    {
      name: parentalLabel,
      symbol: parentalLabel.toLowerCase(),
      value: parentalMphOrMps,
      coefficient: coeffs.betaMph,
      product: coeffs.betaMph * parentalMphOrMps,
    },
    {
      name: "Bone age",
      symbol: "bone age",
      value: boneAge,
      coefficient: coeffs.betaBoneAge,
      product: coeffs.betaBoneAge * boneAge,
    },
  ];

  const predictedCm =
    coeffs.beta0 +
    terms.reduce((sum, term) => sum + term.product, 0);

  return {
    method,
    methodLabel: HEIGHT_PREDICTION_METHOD_LABELS[method],
    equation: `PAH = β₀ + β₁·height + β₂·weight + β₃·${parentalLabel} + β₄·bone age`,
    terms,
    intercept: coeffs.beta0,
    predictedCm,
    displayedCm: input.displayedPredictionCm,
    chronAgeYears: chronAge,
    coefficientInterpolation,
    coefficientTableRows: nearbyCoefficientRows(charts, chronAge),
    heightAdjustmentCm,
    heightUsedCm: heightCm,
  };
}

function buildKhamisRocheSection(
  input: ShowWorkInput,
  parental: NonNullable<ReturnType<typeof verifyParental>>,
): PredictionWorkSection {
  const chronAge = parseFloat(input.chronAgeYears);
  const height = parseFloat(input.heightCm);
  const weight = parseFloat(input.weightKg);

  const charts =
    input.sex === "male"
      ? khamisRocheCoefficients.male
      : khamisRocheCoefficients.female;
  const coeffs = interpolateKhamisRocheCoefficients(charts, chronAge);

  const heightIn = height / CM_PER_INCH;
  const weightLb = weight / KG_PER_LB;
  const mpsIn = parental.mpsCm / CM_PER_INCH;

  const coefficientInterpolation = (
    ["beta0", "betaHeightIn", "betaWeightLb", "betaMpsIn"] as const
  ).map((key) =>
    describeCoefficientInterpolation(charts, chronAge, key, key),
  );

  const terms = [
    {
      name: "Height",
      symbol: "height (in)",
      value: heightIn,
      coefficient: coeffs.betaHeightIn,
      product: coeffs.betaHeightIn * heightIn,
    },
    {
      name: "Weight",
      symbol: "weight (lb)",
      value: weightLb,
      coefficient: coeffs.betaWeightLb,
      product: coeffs.betaWeightLb * weightLb,
    },
    {
      name: "MPS",
      symbol: "mps (in)",
      value: mpsIn,
      coefficient: coeffs.betaMpsIn,
      product: coeffs.betaMpsIn * mpsIn,
    },
  ];

  const predictedIn =
    coeffs.beta0 + terms.reduce((sum, term) => sum + term.product, 0);
  const predictedCm = predictedIn * CM_PER_INCH;

  return {
    method: "khamis-roche",
    methodLabel: HEIGHT_PREDICTION_METHOD_LABELS["khamis-roche"],
    equation: `PAH (in) = β₀ + β₁·height(in) + β₂·weight(lb) + β₃·MPS(in); SE ≈ ±${KHAMIS_ROCHE_SE_CM[input.sex]} cm`,
    terms,
    intercept: coeffs.beta0,
    predictedCm,
    displayedCm: input.displayedPredictionCm,
    chronAgeYears: chronAge,
    coefficientInterpolation,
    coefficientTableRows: nearbyCoefficientRows(charts, chronAge),
    heightUsedCm: height,
    unitConversions: [
      { label: "Height", value: `${fmt(height, 1)} cm → ${fmt(heightIn, 2)} in` },
      { label: "Weight", value: `${fmt(weight, 2)} kg → ${fmt(weightLb, 2)} lb` },
      { label: "MPS", value: `${fmt(parental.mpsCm, 1)} cm → ${fmt(mpsIn, 2)} in` },
      { label: "PAH", value: `${fmt(predictedIn, 3)} in → ${fmt(predictedCm, 1)} cm` },
    ],
  };
}

function verifyParental(input: ShowWorkInput, issues: QcIssue[]) {
  const resolved = resolveParentalStature({
    mode: input.parentalInputMode,
    fatherCm: input.fatherCm,
    motherCm: input.motherCm,
    mphDirectCm: input.mphDirectCm,
    sex: input.sex,
  });
  if (!resolved) {
    issues.push({
      id: "parental-missing",
      severity: "error",
      message: "Parental stature input is missing or invalid.",
      troubleshooting:
        input.parentalInputMode === "mph"
          ? "Enter a valid mid-parental height (MPH)."
          : "Both father and mother heights are required for MPH/MPS.",
      suggestedFix: "Enter valid parental stature on the prediction page.",
    });
    return null;
  }
  return resolved;
}

function verifyPrediction(
  section: PredictionWorkSection,
  issues: QcIssue[],
) {
  if (section.displayedCm === null) {
    issues.push({
      id: "prediction-missing",
      severity: "error",
      message: "No displayed predicted adult height was available for QC.",
      troubleshooting: "The selected method may have failed during prediction.",
    });
    return;
  }

  const delta = Math.abs(section.predictedCm - section.displayedCm);
  if (delta > HEIGHT_TOLERANCE_CM) {
    issues.push({
      id: "prediction-mismatch",
      severity: "error",
      message: `Recomputed PAH (${fmt(section.predictedCm, 1)} cm) differs from displayed value (${fmt(section.displayedCm, 1)} cm) by ${fmt(delta, 2)} cm.`,
      troubleshooting:
        "Inputs may have changed after the prediction was cached, or a calculation regression exists.",
      suggestedFix: "Return to height prediction and recalculate before opening Show work.",
    });
  }
}

export function buildShowWorkReport(input: ShowWorkInput): ShowWorkReport {
  const issues: QcIssue[] = [];
  const tw3Used =
    input.boneAgeFromTw3 || Object.keys(input.ratings).length > 0;

  const tw3Section = buildTw3Section(input, issues);
  const parentalSection = verifyParental(input, issues);

  let predictionSection: PredictionWorkSection | null = null;

  const chronAge = parseFloat(input.chronAgeYears);
  const height = parseFloat(input.heightCm);
  const weight = parseFloat(input.weightKg);
  const boneAge = parseFloat(input.boneAgeYears);

  if ([chronAge, height, weight].some(Number.isNaN)) {
    issues.push({
      id: "prediction-inputs-invalid",
      severity: "error",
      message: "Chronological age, height, or weight is missing or invalid.",
      troubleshooting: "All prediction inputs must be numeric.",
    });
  } else if (
    (input.method === "tw3" ||
      input.method === "adjusted-rwt" ||
      input.method === "original-rwt") &&
    Number.isNaN(boneAge)
  ) {
    issues.push({
      id: "bone-age-missing",
      severity: "error",
      message: "Bone age is required for TW3 and RWT-based methods.",
      troubleshooting: "TW3 and RWT equations include a bone age term.",
      suggestedFix: "Enter bone age manually or complete TW3 scoring.",
    });
  } else if (parentalSection) {
    try {
      if (input.method === "tw3") {
        if (
          tw3MenarchalStatusRequired(input.sex, chronAge) &&
          input.menarchalStatus !== "pre" &&
          input.menarchalStatus !== "post"
        ) {
          issues.push({
            id: "tw3-menarche-missing",
            severity: "error",
            message:
              "Menarchal status is required for TW3 prediction in girls aged 11–14 y.",
            troubleshooting:
              "Table VI provides separate coefficient sets for pre- and post-menarche girls.",
            suggestedFix: "Select pre-menarche or post-menarche on the prediction page.",
          });
        } else {
          predictionSection = buildTw3PredictionSection(
            input,
            parentalSection.mphCm,
            height,
          );
        }
      } else if (
        input.method === "adjusted-rwt" ||
        input.method === "original-rwt"
      ) {
        const { adjustedHeightCm, adjustmentAppliedCm } = heightForAdjustedRwt(
          height,
          input.heightIsStandingVertical,
        );
        predictionSection = buildRwtPredictionSection(
          input,
          input.method,
          parentalSection.mpsCm,
          "MPS",
          adjustedHeightCm,
          adjustmentAppliedCm,
        );
        if (
          input.heightIsStandingVertical &&
          adjustmentAppliedCm !== RWT_SUPINE_HEIGHT_ADJUSTMENT_CM
        ) {
          issues.push({
            id: "height-adjustment-error",
            severity: "error",
            message: "Standing height adjustment was not applied as expected.",
            troubleshooting: `Expected +${RWT_SUPINE_HEIGHT_ADJUSTMENT_CM} cm for standing height.`,
          });
        }
      } else {
        if (
          chronAge < KHAMIS_ROCHE_AGE_MIN ||
          chronAge > KHAMIS_ROCHE_AGE_MAX
        ) {
          issues.push({
            id: "kr-age-range",
            severity: "error",
            message: `Chronological age ${fmt(chronAge)} y is outside Khamis-Roche range (${KHAMIS_ROCHE_AGE_MIN}–${KHAMIS_ROCHE_AGE_MAX} y).`,
            troubleshooting:
              "Khamis-Roche coefficients are validated only within the published age range.",
          });
        }
        predictionSection = buildKhamisRocheSection(input, parentalSection);
      }
      if (predictionSection) {
        verifyPrediction(predictionSection, issues);
      }
    } catch (e) {
      issues.push({
        id: "prediction-error",
        severity: "error",
        message: (e as Error).message,
        troubleshooting: "Check input ranges and coefficient tables.",
      });
    }
  }

  if (input.boneAgeFromTw3 && !tw3Section) {
    issues.push({
      id: "tw3-missing-work",
      severity: "error",
      message: "Workflow indicates TW3 bone age but landmark ratings could not be reproduced.",
      troubleshooting:
        "TW3 ratings may have been cleared after bone age was carried forward.",
      suggestedFix: "Return to TW3 and recalculate bone age.",
    });
  }

  const references: ShowWorkReport["references"] = [];

  if (tw3Used) {
    const charts = getTw3ReferenceChartsForSex(input.sex);
    references.push({
      title: charts.rusPointTableLabel,
      src: charts.rusPointTable,
      alt: charts.rusPointTableLabel,
    });
    references.push({
      title: charts.smsToBoneAgeLabel,
      src: charts.smsToBoneAgeChart,
      alt: charts.smsToBoneAgeLabel,
    });
    references.push({
      title: "TW3 maturity stage scoring rubric",
      src: TW3_REFERENCE_CHARTS.rubric,
      alt: "Bone maturity stage scoring rubric",
    });
  }

  if (input.method === "tw3") {
    references.push({
      title:
        input.sex === "male"
          ? "TW3 PAH coefficients — Table V (boys)"
          : "TW3 PAH coefficients — Table VI (girls)",
      src:
        input.sex === "male"
          ? "/tw3-aph/TW3 coefficient chart - boys.png"
          : "/tw3-aph/TW3 coefficient chart - girls.png",
      alt: "TW3 adult height prediction coefficient chart",
    });
  }

  const qcPassed = issues.filter((i) => i.severity === "error").length === 0;

  return {
    qcPassed,
    qcIssues: issues,
    tw3Used,
    tw3Section,
    parentalSection: parentalSection
      ? {
          fatherCm: parentalSection.fatherHeightCm,
          motherCm: parentalSection.motherHeightCm,
          parentalSumCm: parentalSection.parentalSumCm,
          sex: input.sex,
          inputMode: parentalSection.inputMode,
          mphDirectCm: parentalSection.mphDirectCm,
          derivedFromMph: parentalSection.derivedFromMph,
          mphFormula: parentalSection.mphFormula,
          mphCm: parentalSection.mphCm,
          mpsFormula: parentalSection.mpsFormula,
          mpsCm: parentalSection.mpsCm,
          mphRangeLowCm: parentalSection.mphRangeLowCm,
          mphRangeHighCm: parentalSection.mphRangeHighCm,
        }
      : null,
    predictionSection,
    references,
  };
}

/** Independent SMS→bone age check for QC display. */
export function verifySmsToBoneAge(
  sms: number,
  sex: ShowWorkInput["sex"],
): number {
  return smsToBoneAgeYears(sms, getTw3SmsToBoneAgeChart(sex));
}
