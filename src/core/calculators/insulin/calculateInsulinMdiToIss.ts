import type { CalculatorResult } from "../../types";

export const DEFAULT_ROW_CADENCE_MG_DL = 50;
export const OVERNIGHT_ANCHOR_BG_LOW = 201;
export const OVERNIGHT_ANCHOR_BG_HIGH = 250;
export const FIRST_ROW_BG_LOW = 70;
export const FIRST_ROW_BG_HIGH = 100;
export const MAX_BG_MG_DL = 500;

export interface InsulinMdiToIssInput {
  isf: number;
  icr: number;
  mealCarbsG: number;
  snackCarbsG: number;
  rowCadenceMgDl?: number;
  halfUnitIncrements?: boolean;
}

export interface BgRangeRow {
  label: string;
  low: number;
  high: number;
  index: number;
}

export interface IssScaleCell {
  rawUnits: number;
  displayUnits: number;
  applicable: boolean;
}

export interface IssScaleRow {
  bgRange: BgRangeRow;
  meal: IssScaleCell;
  snack: IssScaleCell;
  overnight: IssScaleCell;
}

export type RoundingDirection = "up" | "down" | "nearest" | "none";

export interface IcrRoundingSummary {
  mealRawUnits: number;
  mealRoundedUnits: number;
  mealDirection: RoundingDirection;
  snackRawUnits: number;
  snackRoundedUnits: number;
  snackDirection: RoundingDirection;
}

export interface IsfRoundingSummary {
  exactStepUnitsPerRow: number;
  displayIncrementUnits: number;
  scaleRoundingApplied: boolean;
  maxScaleDeviationUnits: number;
}

export interface RoundingSummary {
  icr: IcrRoundingSummary;
  isf: IsfRoundingSummary;
}

export interface InsulinMdiToIssResult {
  isf: number;
  icr: number;
  rowCadenceMgDl: number;
  halfUnitIncrements: boolean;
  stepUnitsPerRow: number;
  baseMealUnits: number;
  baseSnackUnits: number;
  overnightStartIndex: number;
  rows: IssScaleRow[];
  roundingSummary: RoundingSummary;
  standardAssumptions: string[];
}

function getRoundingDirection(raw: number, rounded: number): RoundingDirection {
  if (raw === rounded) return "none";
  if (rounded > raw) return "up";
  if (rounded < raw) return "down";
  return "nearest";
}

function roundToIncrement(
  value: number,
  increment: number,
): { rounded: number; direction: RoundingDirection } {
  if (increment <= 0) {
    throw new Error("Rounding increment must be greater than zero.");
  }
  const rounded = Math.round(value / increment) * increment;
  const direction = getRoundingDirection(value, rounded);
  return { rounded, direction };
}

export function generateBgRanges(rowCadenceMgDl: number): BgRangeRow[] {
  if (rowCadenceMgDl <= 0) {
    throw new Error("Row cadence must be greater than zero.");
  }

  const rows: BgRangeRow[] = [
    {
      label: `${FIRST_ROW_BG_LOW}-${FIRST_ROW_BG_HIGH}`,
      low: FIRST_ROW_BG_LOW,
      high: FIRST_ROW_BG_HIGH,
      index: 0,
    },
  ];

  let nextLow = FIRST_ROW_BG_HIGH + 1;
  while (nextLow <= MAX_BG_MG_DL) {
    const high = Math.min(nextLow + rowCadenceMgDl - 1, MAX_BG_MG_DL);
    rows.push({
      label: `${nextLow}-${high}`,
      low: nextLow,
      high,
      index: rows.length,
    });
    nextLow += rowCadenceMgDl;
  }

  return rows;
}

function findOvernightStartIndex(rows: BgRangeRow[]): number {
  const exact = rows.findIndex(
    (row) =>
      row.low === OVERNIGHT_ANCHOR_BG_LOW && row.high === OVERNIGHT_ANCHOR_BG_HIGH,
  );
  if (exact >= 0) return exact;

  const containing = rows.findIndex(
    (row) =>
      row.low <= OVERNIGHT_ANCHOR_BG_LOW && row.high >= OVERNIGHT_ANCHOR_BG_HIGH,
  );
  if (containing >= 0) return containing;

  const anchorMidpoint = (OVERNIGHT_ANCHOR_BG_LOW + OVERNIGHT_ANCHOR_BG_HIGH) / 2;
  return rows.findIndex(
    (row) => row.low <= anchorMidpoint && row.high >= anchorMidpoint,
  );
}

function noteRounding(
  rawValue: number,
  roundedValue: number,
): RoundingDirection {
  return getRoundingDirection(rawValue, roundedValue);
}

export function calculateInsulinMdiToIss(
  input: InsulinMdiToIssInput,
): CalculatorResult<InsulinMdiToIssResult> {
  const {
    isf,
    icr,
    mealCarbsG,
    snackCarbsG,
    rowCadenceMgDl = DEFAULT_ROW_CADENCE_MG_DL,
    halfUnitIncrements = false,
  } = input;

  if (isf <= 0 || icr <= 0) {
    throw new Error("ISF and ICR must be greater than zero.");
  }
  if (mealCarbsG < 0 || snackCarbsG < 0) {
    throw new Error("Carbohydrate amounts cannot be negative.");
  }

  const displayIncrement = halfUnitIncrements ? 0.5 : 1;
  const bgRanges = generateBgRanges(rowCadenceMgDl);
  const overnightStartIndex = findOvernightStartIndex(bgRanges);

  if (overnightStartIndex < 0) {
    throw new Error(
      `Unable to anchor overnight scale at ${OVERNIGHT_ANCHOR_BG_LOW}-${OVERNIGHT_ANCHOR_BG_HIGH} with ${rowCadenceMgDl} mg/dL row cadence.`,
    );
  }

  const rawBaseMeal = mealCarbsG / icr;
  const rawBaseSnack = snackCarbsG / icr;
  const baseMealRounded = Math.round(rawBaseMeal);
  const baseSnackRounded = Math.round(rawBaseSnack);
  const exactStepUnitsPerRow = rowCadenceMgDl / isf;

  let maxScaleDeviationUnits = 0;

  const rows: IssScaleRow[] = bgRanges.map((bgRange) => {
    const mealRaw = baseMealRounded + bgRange.index * exactStepUnitsPerRow;
    const snackRaw = baseSnackRounded + bgRange.index * exactStepUnitsPerRow;

    const mealRounded = roundToIncrement(mealRaw, displayIncrement);
    const snackRounded = roundToIncrement(snackRaw, displayIncrement);

    maxScaleDeviationUnits = Math.max(
      maxScaleDeviationUnits,
      Math.abs(mealRaw - mealRounded.rounded),
      Math.abs(snackRaw - snackRounded.rounded),
    );

    let overnight: IssScaleCell;
    if (bgRange.index < overnightStartIndex) {
      overnight = {
        rawUnits: 0,
        displayUnits: 0,
        applicable: false,
      };
    } else {
      const overnightSteps = bgRange.index - overnightStartIndex;
      const overnightRaw = overnightSteps * exactStepUnitsPerRow;
      const overnightRounded = roundToIncrement(overnightRaw, displayIncrement);
      maxScaleDeviationUnits = Math.max(
        maxScaleDeviationUnits,
        Math.abs(overnightRaw - overnightRounded.rounded),
      );
      overnight = {
        rawUnits: overnightRaw,
        displayUnits: overnightRounded.rounded,
        applicable: true,
      };
    }

    return {
      bgRange,
      meal: {
        rawUnits: mealRaw,
        displayUnits: mealRounded.rounded,
        applicable: true,
      },
      snack: {
        rawUnits: snackRaw,
        displayUnits: snackRounded.rounded,
        applicable: true,
      },
      overnight,
    };
  });

  const scaleRoundingApplied = maxScaleDeviationUnits > 0;

  const standardAssumptions = [
    `${rowCadenceMgDl} mg/dL row cadence (50 mg/dL is standard; 100 mg/dL doubles the glucose step per row).`,
    "Whole units for base meal and base snack insulin (carb coverage at the 70–100 mg/dL row).",
    `Overnight scale starts at the ${OVERNIGHT_ANCHOR_BG_LOW}–${OVERNIGHT_ANCHOR_BG_HIGH} mg/dL row with 0 units and increases by ISF above that row.`,
    halfUnitIncrements
      ? "Row values rounded to nearest 0.5 units."
      : "Row values rounded to nearest whole unit.",
  ];

  return {
    value: {
      isf,
      icr,
      rowCadenceMgDl,
      halfUnitIncrements,
      stepUnitsPerRow: exactStepUnitsPerRow,
      baseMealUnits: baseMealRounded,
      baseSnackUnits: baseSnackRounded,
      overnightStartIndex,
      rows,
      roundingSummary: {
        icr: {
          mealRawUnits: rawBaseMeal,
          mealRoundedUnits: baseMealRounded,
          mealDirection: noteRounding(rawBaseMeal, baseMealRounded),
          snackRawUnits: rawBaseSnack,
          snackRoundedUnits: baseSnackRounded,
          snackDirection: noteRounding(rawBaseSnack, baseSnackRounded),
        },
        isf: {
          exactStepUnitsPerRow,
          displayIncrementUnits: displayIncrement,
          scaleRoundingApplied,
          maxScaleDeviationUnits,
        },
      },
      standardAssumptions,
    },
    interpretation: `Meal/snack scales anchor at ${baseMealRounded} / ${baseSnackRounded} units (70–100 mg/dL) with ${exactStepUnitsPerRow.toFixed(2)} units per ${rowCadenceMgDl} mg/dL step.`,
  };
}

export function formatInsulinUnits(value: number): string {
  return value % 1 === 0
    ? `${value.toFixed(0)} units`
    : `${value.toFixed(1)} units`;
}

export function formatBgRangeLabel(label: string): string {
  return `${label} mg/dL`;
}

export function summarizeIcrRounding(summary: IcrRoundingSummary): string[] {
  const lines = [
    formatRoundingChange(
      "Meal carb coverage",
      summary.mealRawUnits,
      summary.mealRoundedUnits,
      summary.mealDirection,
    ),
    formatRoundingChange(
      "Snack carb coverage",
      summary.snackRawUnits,
      summary.snackRoundedUnits,
      summary.snackDirection,
    ),
  ];
  return lines;
}

export function summarizeIsfRounding(summary: IsfRoundingSummary): string[] {
  const lines = [
    `Exact ISF step: ${summary.exactStepUnitsPerRow.toFixed(2)} units per row from row cadence ÷ ISF.`,
  ];

  if (summary.scaleRoundingApplied) {
    lines.push(
      `Display rounding to nearest ${summary.displayIncrementUnits} unit(s) adjusted scale values by up to ${summary.maxScaleDeviationUnits.toFixed(1)} units from the unrounded ISF-based calculation.`,
    );
  } else {
    lines.push("No ISF-based row adjustment from display rounding.");
  }

  return lines;
}

function formatRoundingChange(
  label: string,
  raw: number,
  rounded: number,
  direction: RoundingDirection,
): string {
  if (direction === "none") {
    return `${label}: ${formatInsulinUnits(raw)} (no rounding).`;
  }
  return `${label}: ${raw.toFixed(2)} units → ${formatInsulinUnits(rounded)} (${formatRoundingDirection(direction)}).`;
}

export function formatRoundingDirection(direction: RoundingDirection): string {
  switch (direction) {
    case "up":
      return "rounded up";
    case "down":
      return "rounded down";
    case "nearest":
      return "rounded to nearest";
    default:
      return "no rounding";
  }
}
