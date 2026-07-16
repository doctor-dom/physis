import type { CalculatorResult } from "../../types";
import {
  DEFAULT_ROW_CADENCE_MG_DL,
  findRowIndexForThreshold,
  formatInsulinDose,
  formatRoundingDirection,
  generateDilutedBgRanges,
  getRoundingDirection,
  roundToIncrement,
  type BgRangeRow,
  type RoundingDirection,
} from "./insulinScaleUtils";

export const DEFAULT_ISF = 300;
export const DEFAULT_ICR = 100;
export const DEFAULT_MEAL_CARBS_G = 40;
export const DEFAULT_SNACK_CARBS_G = 20;
export const DEFAULT_BG_TARGET_MG_DL = 120;
export const DEFAULT_DILUTION_FACTOR = 10;
export const DEFAULT_ROUNDING_INCREMENT = 0.05;
export const DEFAULT_CORRECTION_THRESHOLD_MG_DL = 250;

export const INSULIN_ROUNDING_OPTIONS = [
  { value: "0.05", label: "Nearest 0.05 units" },
  { value: "0.1", label: "Nearest 0.1 units" },
  { value: "0.5", label: "Nearest 0.5 units" },
  { value: "1", label: "Nearest whole unit" },
] as const;

export interface DilutedInsulinSlidingScaleInput {
  isf: number;
  icr: number;
  mealCarbsG: number;
  snackCarbsG: number;
  bgTargetMgDl?: number;
  correctionThresholdMgDl?: number;
  dilutionFactor?: number;
  roundingIncrementUnits?: number;
  rowCadenceMgDl?: number;
}

export interface DilutedScaleDoseRow {
  bgRange: BgRangeRow;
  unroundedUnits: number;
  insulinUnits: number;
  syringeUnits: number;
  instruction: string;
  applicable: boolean;
}

export interface DilutedUnifiedScaleRow {
  bgRange: BgRangeRow;
  meal: DilutedScaleDoseRow;
  snack: DilutedScaleDoseRow;
  correction: DilutedScaleDoseRow;
}

export interface DilutedInsulinRoundingSummary {
  mealBaseRaw: number;
  mealBaseRounded: number;
  mealBaseDirection: RoundingDirection;
  snackBaseRaw: number;
  snackBaseRounded: number;
  snackBaseDirection: RoundingDirection;
  exactStepUnitsPerRow: number;
  maxScaleDeviationUnits: number;
}

export interface DilutedInsulinSlidingScaleResult {
  isf: number;
  icr: number;
  bgTargetMgDl: number;
  dilutionFactor: number;
  roundingIncrementUnits: number;
  correctionThresholdMgDl: number;
  correctionStartIndex: number;
  rowCadenceMgDl: number;
  stepUnitsPerRow: number;
  unifiedRows: DilutedUnifiedScaleRow[];
  roundingSummary: DilutedInsulinRoundingSummary;
  standardAssumptions: string[];
}

function buildInstruction(
  bgRange: BgRangeRow,
  insulinUnits: number,
  syringeUnits: number,
): string {
  return (
    `If glucose ${bgRange.low} to ${bgRange.high}, give ${formatInsulinDose(insulinUnits)} ` +
    `units short-acting insulin which is ${formatInsulinDose(syringeUnits)} units in an insulin syringe.`
  );
}

function buildScaleRow(
  bgRange: BgRangeRow,
  unroundedUnits: number,
  roundingIncrement: number,
  dilutionFactor: number,
  applicable = true,
): DilutedScaleDoseRow {
  if (!applicable) {
    return {
      bgRange,
      unroundedUnits: 0,
      insulinUnits: 0,
      syringeUnits: 0,
      instruction: "",
      applicable: false,
    };
  }

  const { rounded: insulinUnits } = roundToIncrement(unroundedUnits, roundingIncrement);
  const syringeUnits = insulinUnits * dilutionFactor;

  return {
    bgRange,
    unroundedUnits,
    insulinUnits,
    syringeUnits,
    instruction: buildInstruction(bgRange, insulinUnits, syringeUnits),
    applicable: true,
  };
}

function buildCarbCoverageRow(
  bgRange: BgRangeRow,
  baseUnitsRounded: number,
  stepUnitsPerRow: number,
  roundingIncrement: number,
  dilutionFactor: number,
): DilutedScaleDoseRow {
  return buildScaleRow(
    bgRange,
    baseUnitsRounded + bgRange.index * stepUnitsPerRow,
    roundingIncrement,
    dilutionFactor,
  );
}

function buildCorrectionRow(
  bgRange: BgRangeRow,
  correctionStartIndex: number,
  stepUnitsPerRow: number,
  roundingIncrement: number,
  dilutionFactor: number,
): DilutedScaleDoseRow {
  if (bgRange.index < correctionStartIndex) {
    return buildScaleRow(bgRange, 0, roundingIncrement, dilutionFactor, false);
  }

  return buildScaleRow(
    bgRange,
    (bgRange.index - correctionStartIndex) * stepUnitsPerRow,
    roundingIncrement,
    dilutionFactor,
  );
}

export function calculateDilutedInsulinSlidingScale(
  input: DilutedInsulinSlidingScaleInput,
): CalculatorResult<DilutedInsulinSlidingScaleResult> {
  const {
    isf,
    icr,
    mealCarbsG,
    snackCarbsG,
    bgTargetMgDl = DEFAULT_BG_TARGET_MG_DL,
    correctionThresholdMgDl = DEFAULT_CORRECTION_THRESHOLD_MG_DL,
    dilutionFactor = DEFAULT_DILUTION_FACTOR,
    roundingIncrementUnits = DEFAULT_ROUNDING_INCREMENT,
    rowCadenceMgDl = DEFAULT_ROW_CADENCE_MG_DL,
  } = input;

  if (isf <= 0 || icr <= 0) {
    throw new Error("ISF and ICR must be greater than zero.");
  }
  if (dilutionFactor <= 0) {
    throw new Error("Dilution factor must be greater than zero.");
  }
  if (mealCarbsG < 0 || snackCarbsG < 0) {
    throw new Error("Carbohydrate amounts cannot be negative.");
  }
  if (bgTargetMgDl <= 70) {
    throw new Error("BG target must be greater than 70 mg/dL.");
  }
  if (correctionThresholdMgDl < 70) {
    throw new Error("Correction threshold should be at least 70 mg/dL.");
  }

  const bgRanges = generateDilutedBgRanges(rowCadenceMgDl, bgTargetMgDl);
  const correctionStartIndex = findRowIndexForThreshold(
    bgRanges,
    correctionThresholdMgDl,
  );
  const correctionAnchor = bgRanges[correctionStartIndex];

  const rawBaseMeal = mealCarbsG / icr;
  const rawBaseSnack = snackCarbsG / icr;
  const baseMealRounded = roundToIncrement(rawBaseMeal, roundingIncrementUnits).rounded;
  const baseSnackRounded = roundToIncrement(rawBaseSnack, roundingIncrementUnits).rounded;
  const exactStepUnitsPerRow = rowCadenceMgDl / isf;

  const unifiedRows: DilutedUnifiedScaleRow[] = bgRanges.map((bgRange) => ({
    bgRange,
    meal: buildCarbCoverageRow(
      bgRange,
      baseMealRounded,
      exactStepUnitsPerRow,
      roundingIncrementUnits,
      dilutionFactor,
    ),
    snack: buildCarbCoverageRow(
      bgRange,
      baseSnackRounded,
      exactStepUnitsPerRow,
      roundingIncrementUnits,
      dilutionFactor,
    ),
    correction: buildCorrectionRow(
      bgRange,
      correctionStartIndex,
      exactStepUnitsPerRow,
      roundingIncrementUnits,
      dilutionFactor,
    ),
  }));

  const applicableRows = unifiedRows.flatMap((row) => [
    row.meal,
    row.snack,
    ...(row.correction.applicable ? [row.correction] : []),
  ]);
  const maxScaleDeviationUnits = applicableRows.reduce(
    (max, row) => Math.max(max, Math.abs(row.unroundedUnits - row.insulinUnits)),
    0,
  );

  const standardAssumptions = [
    `${rowCadenceMgDl} mg/dL row cadence with a 70–${bgTargetMgDl} mg/dL anchor row, then ${rowCadenceMgDl} mg/dL steps.`,
    `Insulin doses rounded to nearest ${roundingIncrementUnits} units; syringe draw = insulin dose × ${dilutionFactor} (lispro dilution factor).`,
    `Correction scale uses the same glucose rows; insulin begins at the row containing ${correctionThresholdMgDl} mg/dL (${correctionAnchor.label} mg/dL) with 0 units at anchor.`,
  ];

  return {
    value: {
      isf,
      icr,
      bgTargetMgDl,
      dilutionFactor,
      roundingIncrementUnits,
      correctionThresholdMgDl,
      correctionStartIndex,
      rowCadenceMgDl,
      stepUnitsPerRow: exactStepUnitsPerRow,
      unifiedRows,
      roundingSummary: {
        mealBaseRaw: rawBaseMeal,
        mealBaseRounded: baseMealRounded,
        mealBaseDirection: getRoundingDirection(rawBaseMeal, baseMealRounded),
        snackBaseRaw: rawBaseSnack,
        snackBaseRounded: baseSnackRounded,
        snackBaseDirection: getRoundingDirection(rawBaseSnack, baseSnackRounded),
        exactStepUnitsPerRow,
        maxScaleDeviationUnits,
      },
      standardAssumptions,
    },
    interpretation: `Meal/snack scales anchor at ${formatInsulinDose(baseMealRounded)} / ${formatInsulinDose(baseSnackRounded)} units (70–${bgTargetMgDl} mg/dL); correction begins at ${correctionAnchor.label} mg/dL.`,
  };
}

export function formatDilutedSlidingScaleForCopy(
  result: DilutedInsulinSlidingScaleResult,
): string {
  const lines = [
    "DILUTED INSULIN SLIDING SCALE",
    `ISF ${result.isf} · ICR ${result.icr} · BG target ${result.bgTargetMgDl} mg/dL · correction threshold ${result.correctionThresholdMgDl} mg/dL · dilution ×${result.dilutionFactor}`,
    "",
  ];

  for (const row of result.unifiedRows) {
    lines.push(`Glucose ${row.bgRange.low}–${row.bgRange.high} mg/dL`);
    lines.push(`  Meal: ${row.meal.instruction}`);
    lines.push(`  Snack: ${row.snack.instruction}`);
    lines.push(
      `  Correction: ${row.correction.applicable ? row.correction.instruction : "No correction insulin at this glucose range."}`,
    );
    lines.push("");
  }

  return lines.join("\n").trim();
}

export function formatDilutedUnroundedDetails(
  result: DilutedInsulinSlidingScaleResult,
): string[] {
  return result.unifiedRows.flatMap((row) => {
    const prefix = `Glucose ${row.bgRange.label} mg/dL`;
    return [
      `${prefix} · Meal unrounded ${formatInsulinDose(row.meal.unroundedUnits)} units`,
      `${prefix} · Snack unrounded ${formatInsulinDose(row.snack.unroundedUnits)} units`,
      row.correction.applicable
        ? `${prefix} · Correction unrounded ${formatInsulinDose(row.correction.unroundedUnits)} units`
        : `${prefix} · Correction not applicable below threshold`,
    ];
  });
}

export function summarizeDilutedRounding(
  summary: DilutedInsulinRoundingSummary,
  roundingIncrementUnits: number,
): string[] {
  const formatChange = (
    label: string,
    raw: number,
    rounded: number,
    direction: RoundingDirection,
  ) => {
    if (direction === "none") {
      return `${label}: ${formatInsulinDose(raw)} units (no rounding).`;
    }
    return `${label}: ${raw.toFixed(3)} units → ${formatInsulinDose(rounded)} units (${formatRoundingDirection(direction)}).`;
  };

  return [
    "ICR (carb coverage):",
    formatChange(
      "Meal base",
      summary.mealBaseRaw,
      summary.mealBaseRounded,
      summary.mealBaseDirection,
    ),
    formatChange(
      "Snack base",
      summary.snackBaseRaw,
      summary.snackBaseRounded,
      summary.snackBaseDirection,
    ),
    "ISF (correction steps):",
    `Exact step ${summary.exactStepUnitsPerRow.toFixed(3)} units per row from row cadence ÷ ISF.`,
    summary.maxScaleDeviationUnits > 0
      ? `Display rounding to nearest ${roundingIncrementUnits} units adjusted scale values by up to ${formatInsulinDose(summary.maxScaleDeviationUnits)} units from unrounded calculations.`
      : "No row-level deviation from rounding.",
  ];
}
